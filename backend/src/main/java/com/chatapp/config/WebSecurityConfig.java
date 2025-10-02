package com.chatapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class WebSecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Disable CSRF for APIs
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll() // allow register/login without auth
                        .requestMatchers("/api/chat/**").permitAll() // ✅ allow chat endpoints
                        .anyRequest().authenticated() // everything else needs auth
                )
                .formLogin(login -> login.disable()) // disable default login form
                .httpBasic(basic -> basic.disable()); // disable basic auth

        return http.build();
    }
}
