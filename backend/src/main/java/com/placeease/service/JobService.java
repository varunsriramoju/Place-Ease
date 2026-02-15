package com.placeease.service;

import com.placeease.model.Job;
import com.placeease.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;

    @Transactional
    public Job createJob(Job job) {
        job.setStatus("PENDING");
        return jobRepository.save(job);
    }

    @Transactional(readOnly = true)
    public List<Job> getJobsByRecruiterId(Long recruiterId) {
        return jobRepository.findByRecruiterId(recruiterId);
    }

    @Transactional(readOnly = true)
    public List<Job> getPendingJobs() {
        return jobRepository.findByStatus("PENDING");
    }

    @Transactional(readOnly = true)
    public Job getJobById(Long jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));
    }

    @Transactional
    public Job approveJob(Long jobId, Long adminId) {
        Job job = getJobById(jobId);
        job.setStatus("APPROVED");
        job.setApprovedBy(adminId);
        job.setApprovedAt(LocalDateTime.now());
        return jobRepository.save(job);
    }

    @Transactional
    public Job rejectJob(Long jobId) {
        Job job = getJobById(jobId);
        job.setStatus("REJECTED");
        return jobRepository.save(job);
    }

    @Transactional(readOnly = true)
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }
}
