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
import com.urlshortner.urlshortener.models.UserRequest;
import com.urlshortner.urlshortener.repository.UserRepository;

@RestController
public class UserController {
    @CrossOrigin(origins = "*",maxAge = 3600)
    @RequestMapping("/api/users")

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<CustomizedResponse> login(@RequestBody UserRequest userRequest){
        try {
            String userName=userRequest.getEmail();
            Optional<User> u=userRepository.findByUserName(userName);
            if(u.isEmpty()){
                return new CustomizedResponse().internalServerError().body("Invalid Login");
            }
            else{
                return new ResponseEntity<>("Successs");
            }
        } catch (Exception e) {
            return new ResponseEntity<>(500);
        }
    }

}
