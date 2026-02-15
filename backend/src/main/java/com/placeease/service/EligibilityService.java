package com.placeease.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placeease.model.Job;
import com.placeease.model.User;
import com.placeease.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EligibilityService {
    
    private final JobRepository jobRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    public List<Job> getEligibleJobs(User student) {
        return jobRepository.findAll().stream()
                .filter(job -> "APPROVED".equals(job.getStatus()))
                .filter(job -> job.getDeadline().isAfter(LocalDate.now()) || job.getDeadline().equals(LocalDate.now()))
                .filter(job -> student.getCgpa().compareTo(job.getRequiredCgpa()) >= 0)
                .filter(job -> isEligibleByBranch(student.getBranch(), job.getAllowedBranches()))
                .collect(Collectors.toList());
    }
    
    public boolean isEligible(User student, Job job) {
        if (!"APPROVED".equals(job.getStatus())) {
            return false;
        }
        
        if (job.getDeadline().isBefore(LocalDate.now())) {
            return false;
        }
        
        if (student.getCgpa().compareTo(job.getRequiredCgpa()) < 0) {
            return false;
        }
        
        return isEligibleByBranch(student.getBranch(), job.getAllowedBranches());
    }
    
    private boolean isEligibleByBranch(String studentBranch, String allowedBranchesJson) {
        try {
            List<String> allowedBranches = objectMapper.readValue(
                    allowedBranchesJson, 
                    new TypeReference<List<String>>() {}
            );
            return allowedBranches.contains(studentBranch);
        } catch (Exception e) {
            return false;
        }
    }
    
    public List<String> parseAllowedBranches(String allowedBranchesJson) {
        try {
            return objectMapper.readValue(allowedBranchesJson, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }
}
