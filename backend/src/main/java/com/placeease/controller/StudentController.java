package com.placeease.controller;

import com.placeease.model.Application;
import com.placeease.model.Job;
import com.placeease.model.User;
import com.placeease.repository.ApplicationRepository;
import com.placeease.repository.UserRepository;
import com.placeease.service.ApplicationService;
import com.placeease.service.EligibilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {

    private final EligibilityService eligibilityService;
    private final ApplicationService applicationService;
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;

    @GetMapping("/jobs")
    public ResponseEntity<?> getEligibleJobs(Authentication authentication) {
        try {
            String email = authentication.getName();
            User student = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            List<Job> eligibleJobs = eligibilityService.getEligibleJobs(student);

            List<Long> appliedJobIds = applicationRepository.findByStudentId(student.getId())
                    .stream()
                    .map(Application::getJobId)
                    .collect(Collectors.toList());

            List<Map<String, Object>> jobsWithStatus = eligibleJobs.stream()
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
                        jobMap.put("alreadyApplied", appliedJobIds.contains(job.getId()));
                        return jobMap;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(jobsWithStatus);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/apply/{jobId}")
    public ResponseEntity<?> applyForJob(@PathVariable("jobId") Long jobId, Authentication authentication) {
        try {
            String email = authentication.getName();
            User student = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            Application application = applicationService.applyForJob(student.getId(), jobId);
            return ResponseEntity
                    .ok(Map.of("message", "Application submitted successfully", "applicationId", application.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/applications")
    public ResponseEntity<?> getMyApplications(Authentication authentication) {
        try {
            String email = authentication.getName();
            User student = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            List<Application> applications = applicationService.getApplicationsByStudentId(student.getId());
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
