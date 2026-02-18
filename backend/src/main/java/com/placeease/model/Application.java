package com.placeease.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "applications", uniqueConstraints = @UniqueConstraint(columnNames = { "student_id", "job_id" }))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, name = "student_id")
    private Long studentId;

    @Column(nullable = false, name = "job_id")
    private Long jobId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", insertable = false, updatable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", insertable = false, updatable = false)
    private Job job;

    @Column(length = 20, nullable = false)
    private String status = "APPLIED";

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime appliedDate;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedDate;
}
