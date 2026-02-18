package com.placeease.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.placeease.dto.UpdateProfileRequest;
import com.placeease.model.User;
import com.placeease.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final ObjectMapper objectMapper;

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            User updatedUser = userService.updateUserProfile(email, request);

            return ResponseEntity.ok(Map.of(
                    "message", "Profile updated successfully",
                    "user", convertToDTO(updatedUser)));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email);
        return ResponseEntity.ok(convertToDTO(user));
    }

    private Map<String, Object> convertToDTO(User user) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", user.getId());
        dto.put("name", user.getName());
        dto.put("email", user.getEmail());
        dto.put("role", user.getRole());
        dto.put("phone", user.getPhone());

        if ("STUDENT".equals(user.getRole())) {
            dto.put("branch", user.getBranch());
            dto.put("cgpa", user.getCgpa());
            dto.put("resumeUrl", user.getResumeUrl());
            try {
                if (user.getSkills() != null) {
                    dto.put("skills", objectMapper.readValue(user.getSkills(), List.class));
                } else {
                    dto.put("skills", List.of());
                }
            } catch (Exception e) {
                dto.put("skills", List.of());
            }
        }

        return dto;
    }
}
