package com.placeease.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

@Data
public class UpdateProfileRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be 10 digits")
    private String phone;

    @DecimalMin(value = "0.0", message = "CGPA must be at least 0.0")
    @DecimalMax(value = "10.0", message = "CGPA must be at most 10.0")
    private Double cgpa;

    private List<String> skills;

    private String resumeUrl;

    @Size(min = 8, message = "Password must be at least 8 characters")
    private String newPassword;
}
