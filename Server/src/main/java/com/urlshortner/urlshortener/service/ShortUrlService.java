package com.urlshortner.urlshortener.service;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
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
    private static final int CODE_LEN = 7;
    private static final Random RANDOM = new Random();

    @Autowired
    private ShortUrlRepository shortUrlRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${app.base-url:https://short.ly}")
    private String appBaseUrl;

    public CustomizedResponse shortenUrl(UrlShortenerRequest request) {
    try {

        if (request == null || request.getLongUrl() == null || request.getLongUrl().trim().isEmpty()) {
            return new CustomizedResponse(false, "Long URL is required", 400, null);
        }

        String normalizedUrl = request.getLongUrl().trim();

        if (!isValidHttpUrl(normalizedUrl)) {
            return new CustomizedResponse(false, "Invalid URL format. Use http:// or https://", 400, null);
        }

        String shortCode;
        String alias = request.getCustomAlias();

        if (alias != null && !alias.trim().isEmpty()) {

            shortCode = alias.trim();

            if (!shortCode.matches("^[a-zA-Z0-9_-]{4,10}$")) {
                return new CustomizedResponse(false,
                        "Custom alias must be 4-10 chars: letters, numbers, _ or -",
                        400,
                        null);
            }

            if (shortUrlRepository.existsByShortCode(shortCode)) {
                return new CustomizedResponse(false, "Custom alias already taken", 409, null);
            }

        } else {
            shortCode = generateUniqueShortCode();
        }

        String shortUrlString = buildShortUrl(shortCode);
        ShortUrl shortUrl = new ShortUrl();
        shortUrl.setOriginalUrl(normalizedUrl);
        shortUrl.setShortCode(shortCode);
        shortUrl.setShortUrl(shortUrlString);   

        if (request.getExpirationTime() != null) {
            shortUrl.setExpirationTime(request.getExpirationTime());
        }

        if (request.getIsActive() != null) {
            shortUrl.setIsActive(request.getIsActive());
        }
        if (request.getUserId() != null) {

            User user = userRepository.findById(request.getUserId()).orElse(null);

            if (user == null) {
                return new CustomizedResponse(false, "User not found", 404, null);
            }

            shortUrl.setRole(user.getRole());
        }

        ShortUrl saved = shortUrlRepository.save(shortUrl);

        Map<String, Object> data = new LinkedHashMap<>();

        data.put("id", saved.getId());
        data.put("shortCode", saved.getShortCode());
        data.put("shortUrl", saved.getShortUrl());
        data.put("originalUrl", saved.getOriginalUrl());
        data.put("createdAt", saved.getCreatedAt());
        data.put("expirationTime", saved.getExpirationTime());
        data.put("isActive", saved.getIsActive());
        data.put("role", saved.getRole());

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
            return trimmedBaseUrl + shortCode;
        }
        return trimmedBaseUrl + "/" + shortCode;
    }
    public ShortUrl resolveShortUrl(String shortCode) {
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
            data.put("clickCount", url.getClickCount());

            return new CustomizedResponse(true, "Analytics fetched successfully", 200, data);
        } catch (Exception e) {
            throw new RuntimeException("Error fetching analytics: " + e.getMessage());
        }
    }
}