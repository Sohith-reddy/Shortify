package com.urlshortner.urlshortener.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.urlshortner.urlshortener.models.CustomizedResponse;
import com.urlshortner.urlshortener.service.ShortUrlService;



@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping(path = "/api/shortUrl")
public class ShortUrlController {

    @Autowired
    private ShortUrlService shortUrlService;
    @PostMapping("/shorten")
    public ResponseEntity<CustomizedResponse> shortenUrl(@RequestParam  String longUrl){
        ResponseEntity<CustomizedResponse> response=null;
        try {
            response = ResponseEntity.ok(shortUrlService.shortenUrl(longUrl));
        } catch (Exception e) {
            response=ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new CustomizedResponse("Error shortening URL: " + e.getMessage(),null));
        }
        return response;
    }
    
}
