package com.chatapp.controller;

import com.chatapp.model.User;
import com.chatapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body("⚠️ User already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return ResponseEntity.ok("✅ User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        return userRepository.findByUsername(user.getUsername())
                .map(existing -> {
                    if (passwordEncoder.matches(user.getPassword(), existing.getPassword())) {
                        Map<String, String> response = new HashMap<>();
                        response.put("message", "✅ Login successful");
                        response.put("username", existing.getUsername());
                        return ResponseEntity.ok(response);
                    } else {
                        return ResponseEntity.badRequest().body("⚠️ Invalid password");
                    }
                })
                .orElse(ResponseEntity.badRequest().body("⚠️ User not found"));
    }
}
