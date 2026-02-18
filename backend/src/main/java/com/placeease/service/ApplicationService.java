package com.placeease.service;

import com.placeease.model.Application;
import com.placeease.model.Job;
import com.placeease.model.User;
import com.placeease.repository.ApplicationRepository;
import com.placeease.repository.JobRepository;
import com.placeease.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final EligibilityService eligibilityService;
    private final NotificationService notificationService;

    @Transactional
    public Application applyForJob(Long studentId, Long jobId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (applicationRepository.existsByStudentIdAndJobId(studentId, jobId)) {
            throw new RuntimeException("You have already applied for this job");
        }

        if (!eligibilityService.isEligible(student, job)) {
            throw new RuntimeException("You are not eligible for this job");
        }

        Application application = new Application();
        application.setStudentId(studentId);
        application.setJobId(jobId);
        application.setStatus("APPLIED");

        Application saved = applicationRepository.save(application);

        // Notify the student
        notificationService.sendNotification(studentId,
                "✅ You have successfully applied for " + job.getTitle() + " at " + job.getCompanyName(),
                "APPLICATION_UPDATE");

        // Notify the recruiter
        notificationService.sendNotification(job.getRecruiterId(),
                "📥 New application received for " + job.getTitle() + " from " + student.getName(),
                "APPLICATION_UPDATE");

        return saved;
    }

    @Transactional(readOnly = true)
    public List<Application> getApplicationsByStudentId(Long studentId) {
        return applicationRepository.findByStudentId(studentId);
    }

    @Transactional(readOnly = true)
    public List<Application> getApplicationsByJobId(Long jobId) {
        return applicationRepository.findByJobId(jobId);
    }

    @Transactional
    public Application updateApplicationStatus(Long applicationId, String status) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        String oldStatus = application.getStatus();
        application.setStatus(status);
        Application updated = applicationRepository.save(application);

        // Notify the student about status change
        Job job = jobRepository.findById(application.getJobId()).orElse(null);
        String jobTitle = job != null ? job.getTitle() : "Job #" + application.getJobId();
        String companyName = job != null ? job.getCompanyName() : "";

        String emoji = switch (status) {
            case "SHORTLISTED" -> "🌟";
            case "OFFERED" -> "🎉";
            case "REJECTED" -> "❌";
            default -> "📋";
        };

        notificationService.sendNotification(application.getStudentId(),
                emoji + " Your application for " + jobTitle + " at " + companyName +
                        " has been updated: " + oldStatus + " → " + status,
                "APPLICATION_UPDATE");

        return updated;
    }
}
