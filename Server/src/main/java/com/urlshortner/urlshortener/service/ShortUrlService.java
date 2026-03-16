package com.urlshortner.urlshortener.service;

import java.net.URI;
import java.net.URISyntaxException;
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

    @Value("${app.base-url:http://localhost:8080}")
    private String appBaseUrl;

    public CustomizedResponse shortenUrl(UrlShortenerRequest request) {
        try {
            // 1) Basic input validation
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
                if (!shortCode.matches("^[a-zA-Z0-9_-]{4,30}$")) {
                    return new CustomizedResponse(false, "Custom alias must be 4-30 chars: letters, numbers, _ or -", 400, null);
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

            if (request.getExpirationTime() != null) {
                shortUrl.setExpirationTime(request.getExpirationTime());
            }
            if (request.getIsActive() != null) {
                shortUrl.setIsActive(request.getIsActive() == 1);
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
            data.put("originalUrl", saved.getOriginalUrl());
            data.put("createdAt", saved.getCreatedAt());
            data.put("expirationTime", saved.getExpirationTime());
            data.put("isActive", saved.getIsActive());
            data.put("role", saved.getRole());
            data.put("shortUrl", buildShortUrl(saved.getShortCode()));

            return new CustomizedResponse(true, "URL shortened successfully", 201, data);

        } catch (Exception e) {
            return new CustomizedResponse(false, "Error shortening URL: " + e.getMessage(), 500, null);
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
        if (trimmedBaseUrl.isEmpty()) {
            trimmedBaseUrl = "http://localhost:8080";
        }

        if (trimmedBaseUrl.endsWith("/")) {
            return trimmedBaseUrl + shortCode;
        }
        return trimmedBaseUrl + "/" + shortCode;
    }
}