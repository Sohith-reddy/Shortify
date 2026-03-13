package com.urlshortner.urlshortener.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.urlshortner.urlshortener.entity.ShortUrl;
import com.urlshortner.urlshortener.models.CustomizedResponse;
import com.urlshortner.urlshortener.models.UrlShortenerRequest;
import com.urlshortner.urlshortener.repository.ShortUrlRepository;

@Service
public class ShortUrlService {

    @Autowired
    private ShortUrlRepository shortUrlRepository;

    public CustomizedResponse shortenUrl(UrlShortenerRequest longUrl) {

        try {
            // Write the logic here
            ShortUrl shortUrl=new ShortUrl();
            shortUrl.setOriginalUrl(longUrl.getLongUrl());
            
            // ShortUrl entity = new ShortUrl();
            // entity.setOriginalUrl(longUrl);
            // entity.setShortUrl(shortUrl);
            // entity.setClickCount(0L);

            // shortUrlRepository.save(entity);

            return new CustomizedResponse(
                    "URL shortened successfully",
                    shortUrl
            );

        } catch (Exception e) {

            return new CustomizedResponse(
                    "Error shortening URL: " + e.getMessage(),
                    null
            );
        }
    }

    private String generateShortUrl(UrlShortenerRequest longUrl) {

        return "short.ly/" + Math.abs(longUrl.getLongUrl().hashCode());

    }
}