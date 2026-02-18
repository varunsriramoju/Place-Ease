package com.placeease.controller;

import com.placeease.model.Application;
import com.placeease.model.Job;
import com.placeease.model.User;
import com.placeease.repository.ApplicationRepository;
import com.placeease.repository.UserRepository;
import com.placeease.service.ApplicationService;
import com.placeease.service.EligibilityService;
import com.placeease.service.RecommendationService;
import com.placeease.service.SkillGapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

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
    private final RecommendationService recommendationService;
    private final SkillGapService skillGapService;

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

    @Autowired
    private com.placeease.service.FileStorageService fileStorageService;

    @PostMapping("/apply/{jobId}")
    public ResponseEntity<?> applyForJob(
            @PathVariable("jobId") Long jobId,
            @RequestParam("resume") org.springframework.web.multipart.MultipartFile resume,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            User student = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            // Store resume file
            String resumeFilename = fileStorageService.storeFile(resume, student.getId());
            String resumeUrl = "/api/files/resumes/" + resumeFilename;

            // Update student's resume URL
            student.setResumeUrl(resumeUrl);
            userRepository.save(student);

            Application application = applicationService.applyForJob(student.getId(), jobId);
            return ResponseEntity.ok(Map.of(
                    "message", "Application submitted successfully",
                    "applicationId", application.getId(),
                    "resumeUrl", resumeUrl));
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

    @GetMapping("/recommendations")
    public ResponseEntity<?> getRecommendations(Authentication authentication) {
        try {
            String email = authentication.getName();
            User student = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            List<Map<String, Object>> recommendations = recommendationService.getRecommendations(student);
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/skill-gap")
    public ResponseEntity<?> getSkillGapAnalysis(Authentication authentication) {
        try {
            String email = authentication.getName();
            User student = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            Map<String, Object> analysis = skillGapService.analyzeSkillGap(student);
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
