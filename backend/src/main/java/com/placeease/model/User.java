package com.placeease.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;
    
    @Column(nullable = false)
    @NotBlank(message = "Password is required")
    private String password;
    
    @Column(nullable = false, length = 20)
    @NotBlank(message = "Role is required")
    @Pattern(regexp = "STUDENT|RECRUITER|ADMIN", message = "Role must be STUDENT, RECRUITER, or ADMIN")
    private String role;
    
    @Column(nullable = false)
    @NotBlank(message = "Name is required")
    private String name;
    
    @Column(length = 15)
    private String phone;
    
    @Column(length = 50)
    private String branch;
    
    @Column(precision = 3, scale = 2)
    @DecimalMin(value = "0.00", message = "CGPA must be between 0.00 and 10.00")
    @DecimalMax(value = "10.00", message = "CGPA must be between 0.00 and 10.00")
    private BigDecimal cgpa;
    
    @Column(length = 500)
    private String resumeUrl;
    
    @Column(length = 1000)
    private String skills;
    
    @Column(nullable = false)
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
