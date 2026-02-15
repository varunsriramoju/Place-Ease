package com.placeease.service;

import com.placeease.dto.AuthResponse;
import com.placeease.dto.LoginRequest;
import com.placeease.dto.RegisterRequest;
import com.placeease.model.User;
import com.placeease.repository.UserRepository;
import com.placeease.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        user.setBranch(request.getBranch());
        user.setCgpa(request.getCgpa());
        user.setSkills(request.getSkills());
        user.setIsActive(true);
        
        User savedUser = userRepository.save(user);
        
        String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getId(), savedUser.getRole());
        
        return new AuthResponse(token, mapToUserInfo(savedUser));
    }
    
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole());
        
        return new AuthResponse(token, mapToUserInfo(user));
    }
    
    private AuthResponse.UserInfo mapToUserInfo(User user) {
        return new AuthResponse.UserInfo(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getName(),
                user.getBranch(),
                user.getCgpa()
        );
    }
}
