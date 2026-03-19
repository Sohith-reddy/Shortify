package com.urlshortner.urlshortener.controller;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.urlshortner.urlshortener.entity.ShortUrl;
import com.urlshortner.urlshortener.service.RedisService;
import com.urlshortner.urlshortener.service.ShortUrlService;

@RestController
public class RedirectController {

    @Autowired
    private ShortUrlService shortUrlService;
    @Autowired
    private RedisService redisService;

    @GetMapping("/{shortCode}")
    public ResponseEntity<Void> redirect(@PathVariable String shortCode) {

        String key = "shorten:url:" + shortCode;

        try {
            // 1️⃣ Try Redis first
            Object cachedObj = redisService.get(key);

            if (cachedObj != null) {

                Map<String, Object> cached = (Map<String, Object>) cachedObj;

                Boolean isActive = (Boolean) cached.get("isActive");
                if (isActive == null || !isActive) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }

                // 🔥 Expiration check
                Object expObj = cached.get("expirationTime");
                if (expObj != null) {
                    LocalDateTime expirationTime = convertToLocalDateTime(expObj);

                    if (expirationTime.isBefore(LocalDateTime.now())) {
                        return ResponseEntity.status(HttpStatus.GONE).build();
                    }
                }

                // 🔥 Click count (Redis)
                redisService.increment("short:click:" + shortCode);

                String originalUrl = (String) cached.get("originalUrl");

                return ResponseEntity.status(HttpStatus.FOUND)
                        .location(URI.create(originalUrl))
                        .build();
            }

            // 2️⃣ Cache MISS → call service
            ShortUrl url = shortUrlService.resolveShortUrl(shortCode);

            // 3️⃣ Store in Redis
            Map<String, Object> value = new HashMap<>();
            value.put("originalUrl", url.getOriginalUrl());
            value.put("isActive", url.getIsActive());
            value.put("expirationTime", url.getExpirationTime());

            redisService.set(key, value, 600);

            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(url.getOriginalUrl()))
                    .build();

        } catch (RuntimeException e) {

            String msg = e.getMessage() != null ? e.getMessage().toLowerCase() : "";

            if (msg.contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            if (msg.contains("inactive")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            if (msg.contains("expired")) {
                return ResponseEntity.status(HttpStatus.GONE).build();
            }

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
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
