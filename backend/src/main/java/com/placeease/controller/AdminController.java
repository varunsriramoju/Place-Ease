package com.placeease.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placeease.model.Job;
import com.placeease.model.User;
import com.placeease.repository.UserRepository;
import com.placeease.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final JobService jobService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping("/jobs/pending")
    public ResponseEntity<?> getPendingJobs() {
        try {
            List<Job> pendingJobs = jobService.getPendingJobs();

            List<Map<String, Object>> jobsWithEligibility = pendingJobs.stream()
                    .map(job -> {
                        Map<String, Object> jobMap = new HashMap<>();
                        jobMap.put("id", job.getId());
                        jobMap.put("title", job.getTitle());
                        jobMap.put("description", job.getDescription());
                        jobMap.put("companyName", job.getCompanyName());
                        jobMap.put("requiredCgpa", job.getRequiredCgpa());
                        jobMap.put("allowedBranches", job.getAllowedBranches());
                        jobMap.put("ctcMin", job.getCtcMin());
                        jobMap.put("ctcMax", job.getCtcMax());
                        jobMap.put("deadline", job.getDeadline());
                        jobMap.put("numOpenings", job.getNumOpenings());
                        jobMap.put("selectionProcess", job.getSelectionProcess());
                        jobMap.put("status", job.getStatus());
                        jobMap.put("createdAt", job.getCreatedAt());

                        Map<String, Object> eligibility = calculateEligibility(job);
                        jobMap.put("eligibleStudents", eligibility);

                        return jobMap;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(jobsWithEligibility);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/jobs/{jobId}/approve")
    public ResponseEntity<?> approveOrRejectJob(@PathVariable("jobId") Long jobId,
            @RequestBody Map<String, Boolean> request,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            User admin = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));

            Boolean approved = request.get("approved");

            Job job;
            if (Boolean.TRUE.equals(approved)) {
                job = jobService.approveJob(jobId, admin.getId());
                return ResponseEntity.ok(Map.of("message", "Job approved successfully", "job", job));
            } else {
                job = jobService.rejectJob(jobId);
                return ResponseEntity.ok(Map.of("message", "Job rejected successfully", "job", job));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        try {
            List<User> allUsers = userRepository.findAll();
            List<Job> allJobs = jobService.getAllJobs();

            long totalStudents = allUsers.stream().filter(u -> "STUDENT".equals(u.getRole())).count();
            long totalRecruiters = allUsers.stream().filter(u -> "RECRUITER".equals(u.getRole())).count();
            long totalJobs = allJobs.size();
            long approvedJobs = allJobs.stream().filter(j -> "APPROVED".equals(j.getStatus())).count();
            long pendingJobs = allJobs.stream().filter(j -> "PENDING".equals(j.getStatus())).count();

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalStudents", totalStudents);
            stats.put("totalRecruiters", totalRecruiters);
            stats.put("totalJobs", totalJobs);
            stats.put("approvedJobs", approvedJobs);
            stats.put("pendingJobs", pendingJobs);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private Map<String, Object> calculateEligibility(Job job) {
        List<User> students = userRepository.findByRole("STUDENT");

        List<String> allowedBranches;
        try {
            allowedBranches = objectMapper.readValue(
                    job.getAllowedBranches(),
                    new TypeReference<List<String>>() {
                    });
        } catch (Exception e) {
            allowedBranches = new ArrayList<>();
        }

        BigDecimal requiredCgpa = job.getRequiredCgpa();
        final List<String> finalAllowedBranches = allowedBranches;

        List<User> eligibleStudents = students.stream()
                .filter(s -> s.getCgpa() != null && s.getCgpa().compareTo(requiredCgpa) >= 0)
                .filter(s -> s.getBranch() != null && finalAllowedBranches.contains(s.getBranch()))
                .collect(Collectors.toList());

        Map<String, Long> branchBreakdown = eligibleStudents.stream()
                .collect(Collectors.groupingBy(User::getBranch, Collectors.counting()));

        Map<String, Object> result = new HashMap<>();
        result.put("total", eligibleStudents.size());
        result.put("breakdown", branchBreakdown);

        return result;
    }

    @GetMapping("/students")
    public ResponseEntity<?> getAllStudents(
            @RequestParam(value = "branch", required = false) String branch,
            @RequestParam(value = "minCgpa", required = false) Double minCgpa,
            @RequestParam(value = "maxCgpa", required = false) Double maxCgpa,
            @RequestParam(value = "sortBy", required = false) String sortBy) {
        try {
            BigDecimal min = minCgpa != null ? BigDecimal.valueOf(minCgpa) : null;
            BigDecimal max = maxCgpa != null ? BigDecimal.valueOf(maxCgpa) : null;

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
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                    "students", studentDTOs,
                    "totalCount", students.size()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/students/{studentId}")
    public ResponseEntity<?> deleteStudent(@PathVariable("studentId") Long studentId) {
        try {
            User student = userRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            if (!"STUDENT".equals(student.getRole())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Only students can be deleted through this endpoint"));
            }

            userRepository.delete(student);

            return ResponseEntity.ok(Map.of(
                    "message", "Student deleted successfully",
                    "deletedStudent", student.getName()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to delete student: " + e.getMessage()));
        }
    }

    private Map<String, Object> convertToDTO(User user) {
        Map<String, Object> dto = new HashMap<>();
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
