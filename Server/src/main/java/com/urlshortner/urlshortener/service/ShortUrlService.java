package com.urlshortner.urlshortener.service;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.urlshortner.urlshortener.entity.ShortUrl;
import com.urlshortner.urlshortener.entity.User;
import com.urlshortner.urlshortener.models.CustomizedResponse;
import com.urlshortner.urlshortener.models.UrlShortenerRequest;
import com.urlshortner.urlshortener.repository.ShortUrlRepository;
import com.urlshortner.urlshortener.repository.UserRepository;


@Service
public class ShortUrlService {

    private static final String BASE62 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int CODE_LEN = 6;
    private static final Random RANDOM = new Random();
    @Value("${app.base-url:http://localhost:8080}")
    private String appBaseUrl;

    @Autowired
    private ShortUrlRepository shortUrlRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RedisService redisService;
    public CustomizedResponse shortenUrl(UrlShortenerRequest request) {
        try {
            if (request == null || request.getLongUrl() == null || request.getLongUrl().trim().isEmpty()) {
                return new CustomizedResponse(false, "Long URL is required", 400, null);
            }
            String normalizedUrl = request.getLongUrl().trim();
            if (!isValidHttpUrl(normalizedUrl)) {
                return new CustomizedResponse(false, "Invalid URL format. Use http:// or https://", 400, null);
            }
            User user = null;
            if (request.getUserId() != null) {
                user = userRepository.findById(request.getUserId()).orElse(null);
                if (user == null) {
                    return new CustomizedResponse(false, "User not found", 404, null);
                }
            }
            if (user != null) {
                Optional<ShortUrl> existing = shortUrlRepository
                        .findByOriginalUrlAndUserUserIdAndIsActiveTrue(normalizedUrl, user.getUserId());

                if (existing.isPresent()) {
                    ShortUrl url = existing.get();

                    Map<String, Object> data = new LinkedHashMap<>();
                    data.put("id", url.getId());
                    data.put("shortCode", url.getShortCode());
                    data.put("shortUrl", buildShortUrl(url.getShortCode()));
                    data.put("originalUrl", url.getOriginalUrl());

                    return new CustomizedResponse(true, "URL already shortened", 200, data);
                }
            }
            String shortCode;
            String alias = request.getCustomAlias();

            if (alias != null && !alias.trim().isEmpty()) {

                shortCode = alias.trim();
                if (!shortCode.matches("^[a-zA-Z0-9_-]{4,15}$")) {
                    return new CustomizedResponse(false,
                            "Custom alias must be 4-15 chars: letters, numbers, _ or -",
                            400,
                            null);
                }
                if (shortUrlRepository.existsByShortCode(shortCode)) {
                    return new CustomizedResponse(false, "Custom alias already taken", 409, null);
                }

            } else {
                shortCode = generateUniqueShortCode();
            }

            ShortUrl shortUrl = new ShortUrl();
            shortUrl.setOriginalUrl(normalizedUrl);
            shortUrl.setShortCode(shortCode);
            shortUrl.setUser(user);
            shortUrl.setShortUrl(buildShortUrl(shortCode));
            shortUrl.setCreatedAt(LocalDateTime.now());
            shortUrl.setClickCount(0L);
            shortUrl.setIsActive(true);
            if (request.getExpirationTime() != null) {
                shortUrl.setExpirationTime(request.getExpirationTime());
            } else {
                shortUrl.setExpirationTime(null);
            }
            ShortUrl saved = shortUrlRepository.save(shortUrl);
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("id", saved.getId());
            data.put("shortCode", saved.getShortCode());
            data.put("shortUrl", buildShortUrl(saved.getShortCode()));
            data.put("originalUrl", saved.getOriginalUrl());
            data.put("createdAt", saved.getCreatedAt());
            data.put("expirationTime", saved.getExpirationTime());
            data.put("isActive", saved.getIsActive());
            data.put("userId", saved.getUser() != null ? saved.getUser().getUserId() : null);

            return new CustomizedResponse(true, "URL shortened successfully", 200, data);

        } catch (Exception e) {

            return new CustomizedResponse(false,
                    "Error shortening URL: " + e.getMessage(),
                    500,
                    null);
        }
    }

    private String generateUniqueShortCode() {
        String code;
        int attempts = 0;
        do {
            code = randomBase62(CODE_LEN);
            attempts++;
            if (attempts > 10) {
                throw new RuntimeException("Could not generate unique short code");
            }
        } while (shortUrlRepository.existsByShortCode(code));
        return code;
    }

    private String randomBase62(int len) {
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            sb.append(BASE62.charAt(RANDOM.nextInt(BASE62.length())));
        }
        return sb.toString();
    }

    private boolean isValidHttpUrl(String url) {
        try {
            URI uri = new URI(url);
            String scheme = uri.getScheme();
            return scheme != null && (scheme.equalsIgnoreCase("http") || scheme.equalsIgnoreCase("https"));
        } catch (URISyntaxException e) {
            return false;
        }
    }

    private String buildShortUrl(String shortCode) {
        String trimmedBaseUrl = appBaseUrl != null ? appBaseUrl.trim() : "";
        if (trimmedBaseUrl.endsWith("/")) {
            return trimmedBaseUrl + "r/" + shortCode;
        }
        return trimmedBaseUrl + "/r/" + shortCode;
    }

    public ShortUrl resolveShortUrl(String shortCode) {
        String key = "shorten:url:" + shortCode;
        Object value = redisService.get(key);
        if(value!=null){
            Map<String, Object> cacheMap = (Map<String, Object>) value;
            Boolean isActive = (Boolean) cacheMap.get("isActive");
            if(isActive==null || !isActive){
                throw new RuntimeException("Short URL is inactive");
            }
            if(cacheMap.equals("NULL")){
                throw new RuntimeException("Short URL not found");
            }
            Object expObj = cacheMap.get("expirationTime");
            if (expObj != null) {
                LocalDateTime expirationTime = convertToLocalDateTime(expObj);

                if (expirationTime.isBefore(LocalDateTime.now())) {
                    throw new RuntimeException("Short URL has expired");
                }
            }
            redisService.increment("shortUrl:click:" + shortCode);
            ShortUrl url = new ShortUrl();
            url.setOriginalUrl((String) cacheMap.get("originalUrl"));
            return url;
        }
        ShortUrl url = shortUrlRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new RuntimeException("Short URL not found"));
        if (!url.getIsActive()) {
            throw new RuntimeException("Short URL is inactive");
        }
        if (url.getExpirationTime() != null
                && url.getExpirationTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Short URL has expired");
        }
        url.setClickCount(url.getClickCount() + 1);
        shortUrlRepository.save(url);
        Map<String, Object> cacheMap = new LinkedHashMap<>();
        cacheMap.put("originalUrl", url.getOriginalUrl());
        cacheMap.put("clickCount", url.getClickCount());
        cacheMap.put("isActive", url.getIsActive());
        cacheMap.put("expirationTime", url.getExpirationTime());
        redisService.set(key, cacheMap, 3600);

        redisService.increment("shortUrl:click:" + shortCode);
        return url;
    }

    public CustomizedResponse getAnalytics(String shortCode) {
        try {
            ShortUrl url = shortUrlRepository.findByShortCode(shortCode)
                    .orElseThrow(() -> new RuntimeException("Short URL not found"));

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("shortUrl", url.getShortUrl());
            data.put("originalUrl", url.getOriginalUrl());
            data.put("createdAt", url.getCreatedAt());
            data.put("expirationTime", url.getExpirationTime());
            data.put("isActive", url.getIsActive());
            data.put("role", url.getRole());
            data.put("userId", url.getUser() != null ? url.getUser().getUserId() : null);
            data.put("clickCount", url.getClickCount());

            return new CustomizedResponse(true, "Analytics fetched successfully", 200, data);
        } catch (Exception e) {
            throw new RuntimeException("Error fetching analytics: " + e.getMessage());
        }
    }

    public CustomizedResponse getAllShortUrls(Long userId) {
        try {
            if (userId != null) {
                List<ShortUrl> filteredUrls = shortUrlRepository.findByUser_UserId(userId);
                Map<String, Object> data = new LinkedHashMap<>();
                data.put("shortUrls", filteredUrls);
                return new CustomizedResponse(true, "Filtered short URLs fetched successfully", 200, data);
            }
            List<ShortUrl> urls = shortUrlRepository.findAll();

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("shortUrls", urls);

            return new CustomizedResponse(true, "All short URLs fetched successfully", 200, data);
        } catch (Exception e) {
            throw new RuntimeException("Error fetching all short URLs: " + e.getMessage());
        }
    }
    private LocalDateTime convertToLocalDateTime(Object obj) {

        if (obj instanceof List<?>) {
            List<?> list = (List<?>) obj;

            return LocalDateTime.of(
                    (Integer) list.get(0),
                    (Integer) list.get(1),
                    (Integer) list.get(2),
                    (Integer) list.get(3),
                    (Integer) list.get(4),
                    (Integer) list.get(5)
            );
        }

        return null;
    }
}
