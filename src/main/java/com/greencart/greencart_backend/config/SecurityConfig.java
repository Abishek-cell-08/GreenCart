package com.greencart.greencart_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> {})  // ✅ allow cross-origin using Customizer
            .csrf(csrf -> csrf.disable()) // ✅ disable CSRF (safe if no login/forms) - updated for deprecation
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll() // ✅ all endpoints are public
            );

        return http.build();
    }
}
