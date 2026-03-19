package com.urlshortner.urlshortener.controller;

import java.net.URI;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.urlshortner.urlshortener.entity.ShortUrl;
import com.urlshortner.urlshortener.models.CustomizedResponse;
import com.urlshortner.urlshortener.models.UrlShortenerRequest;
import com.urlshortner.urlshortener.service.ShortUrlService;






@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping(path = "/api/shortUrl")
public class ShortUrlController {

    @Autowired
    private ShortUrlService shortUrlService;
    @PostMapping("/shorten")
    public ResponseEntity<CustomizedResponse> shortenUrl(@RequestBody UrlShortenerRequest request){
        ResponseEntity<CustomizedResponse> response;
        try {
            if(request.getLongUrl() == null || request.getLongUrl().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new CustomizedResponse("Invalid URL", null));
            }
            response = ResponseEntity.ok(shortUrlService.shortenUrl(request));
        } catch (Exception e) {
            response=ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new CustomizedResponse("Error shortening URL: " + e.getMessage(),null));
        }
        response = ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        return response;
    }

    @GetMapping("/{shortCode}")
    public ResponseEntity<Void> redirect(@PathVariable String shortCode) {
        try {
            ShortUrl url = shortUrlService.resolveShortUrl(shortCode);

            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(url.getOriginalUrl()))
                    .build();

        } catch (RuntimeException e) {
            e.printStackTrace();
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            if (e.getMessage().contains("inactive")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            if (e.getMessage().contains("expired")) {
                return ResponseEntity.status(HttpStatus.GONE).build();
            }

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    @GetMapping(path = "/analytics/{shortCode}")
    public ResponseEntity<CustomizedResponse> getAnalytics(@PathVariable String shortCode) {
        try {
            return ResponseEntity.ok(shortUrlService.getAnalytics(shortCode));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new CustomizedResponse("Error fetching analytics: " + e.getMessage(), null));
        }
    }
    @GetMapping(path="/all")
    public ResponseEntity<CustomizedResponse> getAllShortUrls(@RequestParam(required=false) Long userId) {
        try {
            return ResponseEntity.ok(shortUrlService.getAllShortUrls(userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new CustomizedResponse("Error fetching all short URLs: " + e.getMessage(), null));
        }
    }
    

}
