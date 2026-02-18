package com.placeease.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.placeease.dto.UpdateProfileRequest;
import com.placeease.model.User;
import com.placeease.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    @Transactional
    public User updateUserProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(request.getName());
        user.setPhone(request.getPhone());

        if ("STUDENT".equals(user.getRole())) {
            if (request.getCgpa() != null) {
                user.setCgpa(BigDecimal.valueOf(request.getCgpa()));
            }
            if (request.getSkills() != null) {
                try {
                    user.setSkills(objectMapper.writeValueAsString(request.getSkills()));
                } catch (Exception e) {
                    throw new RuntimeException("Error processing skills", e);
                }
            }
            if (request.getResumeUrl() != null) {
                user.setResumeUrl(request.getResumeUrl());
            }
        }

        if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        return userRepository.save(user);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
