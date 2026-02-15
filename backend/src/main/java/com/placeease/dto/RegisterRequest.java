package com.placeease.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    @NotBlank(message = "Role is required")
    @Pattern(regexp = "STUDENT|RECRUITER|ADMIN", message = "Role must be STUDENT, RECRUITER, or ADMIN")
    private String role;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    private String phone;
    
    private String branch;
    
    @DecimalMin(value = "0.00", message = "CGPA must be between 0.00 and 10.00")
    @DecimalMax(value = "10.00", message = "CGPA must be between 0.00 and 10.00")
    private BigDecimal cgpa;
    
    private String skills;
}
