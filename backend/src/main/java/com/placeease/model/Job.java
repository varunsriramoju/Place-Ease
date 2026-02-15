package com.placeease.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long recruiterId;

    @Column(nullable = false)
    @NotBlank(message = "Title is required")
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    @NotBlank(message = "Description is required")
    private String description;

    @Column(nullable = false)
    @NotBlank(message = "Company name is required")
    private String companyName;

    @Column(nullable = false, precision = 3, scale = 2)
    @NotNull(message = "Required CGPA is required")
    @DecimalMin(value = "0.00", message = "Required CGPA must be between 0.00 and 10.00")
    @DecimalMax(value = "10.00", message = "Required CGPA must be between 0.00 and 10.00")
    private BigDecimal requiredCgpa;

    @Column(nullable = false, length = 500)
    @NotBlank(message = "Allowed branches are required")
    private String allowedBranches;

    @Column(precision = 5, scale = 2)
    private BigDecimal ctcMin;

    @Column(precision = 5, scale = 2)
    private BigDecimal ctcMax;

    @Column(nullable = false)
    @NotNull(message = "Deadline is required")
    @Future(message = "Deadline must be in the future")
    private LocalDate deadline;

    @Column(nullable = false)
    private Integer numOpenings = 1;

    @Column(length = 20, nullable = false)
    private String status = "PENDING";

    @Column(columnDefinition = "TEXT")
    private String selectionProcess;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private Long approvedBy;

    private LocalDateTime approvedAt;
}
