package com.urlshortner.urlshortener.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.urlshortner.urlshortener.entity.User;
import com.urlshortner.urlshortener.models.CustomizedResponse;
import com.urlshortner.urlshortener.models.LoginRequest;
import com.urlshortner.urlshortener.models.UserRequest;
import com.urlshortner.urlshortener.repository.UserRepository;

import jakarta.validation.Valid;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/api/auth")
public class UserController {
    @PostMapping("/login")
    public ResponseEntity<CustomizedResponse> login(@RequestBody @Valid LoginRequest loginRequest) {
        return ResponseEntity.ok(new CustomizedResponse(false, null));
    }

}
