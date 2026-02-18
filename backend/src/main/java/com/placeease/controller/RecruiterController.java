package com.placeease.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.placeease.model.Application;
import com.placeease.model.Job;
import com.placeease.model.User;
import com.placeease.repository.UserRepository;
import com.placeease.service.ApplicationService;
import com.placeease.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recruiter")
@RequiredArgsConstructor
public class RecruiterController {

    private final JobService jobService;
    private final ApplicationService applicationService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/jobs")
    public ResponseEntity<?> createJob(@Valid @RequestBody Job job, Authentication authentication) {
        try {
            String email = authentication.getName();
            User recruiter = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Recruiter not found"));

            job.setRecruiterId(recruiter.getId());

            if (job.getAllowedBranches() != null) {
                objectMapper.readTree(job.getAllowedBranches());
            }

            Job createdJob = jobService.createJob(job);
            return ResponseEntity.ok(Map.of("message", "Job created successfully", "jobId", createdJob.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/jobs")
    public ResponseEntity<?> getMyJobs(Authentication authentication) {
        try {
            String email = authentication.getName();
            User recruiter = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Recruiter not found"));

            List<Job> jobs = jobService.getJobsByRecruiterId(recruiter.getId());
            return ResponseEntity.ok(jobs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/jobs/{jobId}/applications")
    public ResponseEntity<?> getJobApplications(@PathVariable("jobId") Long jobId, Authentication authentication) {
        try {
            String email = authentication.getName();
            User recruiter = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Recruiter not found"));

            Job job = jobService.getJobById(jobId);
            if (!job.getRecruiterId().equals(recruiter.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            List<Application> applications = applicationService.getApplicationsByJobId(jobId);
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/applications/{applicationId}/status")
    public ResponseEntity<?> updateApplicationStatus(@PathVariable("applicationId") Long applicationId,
            @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            Application application = applicationService.updateApplicationStatus(applicationId, status);
            return ResponseEntity.ok(Map.of("message", "Application status updated", "application", application));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/students")
    public ResponseEntity<?> getAllStudents(
            @RequestParam(value = "branch", required = false) String branch,
            @RequestParam(value = "minCgpa", required = false) Double minCgpa,
            @RequestParam(value = "maxCgpa", required = false) Double maxCgpa,
            @RequestParam(value = "sortBy", required = false) String sortBy) {
        try {
            java.math.BigDecimal min = minCgpa != null ? java.math.BigDecimal.valueOf(minCgpa) : null;
            java.math.BigDecimal max = maxCgpa != null ? java.math.BigDecimal.valueOf(maxCgpa) : null;

            List<User> students = userRepository.findStudentsWithFilters(
                    (branch != null && !branch.isEmpty()) ? branch : null,
                    min,
                    max);

            // Sort
            if ("cgpa".equalsIgnoreCase(sortBy)) {
                students.sort((a, b) -> b.getCgpa().compareTo(a.getCgpa())); // Descending
            } else if ("name".equalsIgnoreCase(sortBy)) {
                students.sort((a, b) -> a.getName().compareTo(b.getName()));
            }

            List<Map<String, Object>> studentDTOs = students.stream()
                    .map(this::convertToDTO)
                    .toList();

            return ResponseEntity.ok(Map.of(
                    "students", studentDTOs,
                    "totalCount", students.size()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private Map<String, Object> convertToDTO(User user) {
        java.util.Map<String, Object> dto = new java.util.HashMap<>();
        dto.put("id", user.getId());
        dto.put("name", user.getName());
        dto.put("email", user.getEmail());
        dto.put("branch", user.getBranch());
        dto.put("cgpa", user.getCgpa());
        dto.put("phone", user.getPhone());
        dto.put("resumeUrl", user.getResumeUrl());
        dto.put("createdAt", user.getCreatedAt());
        try {
            if (user.getSkills() != null) {
                dto.put("skills", objectMapper.readValue(user.getSkills(), List.class));
            } else {
                dto.put("skills", List.of());
            }
        } catch (Exception e) {
            dto.put("skills", List.of());
        }
        return dto;
    }
}
