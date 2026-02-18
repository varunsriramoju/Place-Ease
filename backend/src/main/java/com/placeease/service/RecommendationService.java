package com.placeease.service;

import com.placeease.model.Job;
import com.placeease.model.User;
import com.placeease.repository.ApplicationRepository;
import com.placeease.repository.JobRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final ObjectMapper objectMapper;

    /**
     * Weighted scoring: CGPA match 30%, Skill overlap 50%, Branch match 20%
     */
    public List<Map<String, Object>> getRecommendations(User student) {
        List<Job> approvedJobs = jobRepository.findByStatus("APPROVED");

        // Get already applied job IDs
        Set<Long> appliedJobIds = applicationRepository.findByStudentId(student.getId())
                .stream()
                .map(a -> a.getJobId())
                .collect(Collectors.toSet());

        List<Map<String, Object>> recommendations = new ArrayList<>();

        for (Job job : approvedJobs) {
            if (appliedJobIds.contains(job.getId())) {
                continue; // Skip already applied jobs
            }

            double score = calculateMatchScore(student, job);
            if (score > 0) {
                Map<String, Object> rec = new LinkedHashMap<>();
                rec.put("id", job.getId());
                rec.put("title", job.getTitle());
                rec.put("description", job.getDescription());
                rec.put("companyName", job.getCompanyName());
                rec.put("requiredCgpa", job.getRequiredCgpa());
                rec.put("allowedBranches", job.getAllowedBranches());
                rec.put("ctcMin", job.getCtcMin());
                rec.put("ctcMax", job.getCtcMax());
                rec.put("deadline", job.getDeadline());
                rec.put("numOpenings", job.getNumOpenings());
                rec.put("selectionProcess", job.getSelectionProcess());
                rec.put("matchScore", Math.round(score * 100.0) / 100.0);
                recommendations.add(rec);
            }
        }

        // Sort by match score descending
        recommendations.sort((a, b) -> Double.compare(
                (double) b.get("matchScore"),
                (double) a.get("matchScore")));

        return recommendations;
    }

    private double calculateMatchScore(User student, Job job) {
        double cgpaScore = calculateCgpaScore(student, job);
        double skillScore = calculateSkillScore(student, job);
        double branchScore = calculateBranchScore(student, job);

        // Weighted: CGPA 30%, Skills 50%, Branch 20%
        return (cgpaScore * 0.3) + (skillScore * 0.5) + (branchScore * 0.2);
    }

    private double calculateCgpaScore(User student, Job job) {
        if (student.getCgpa() == null || job.getRequiredCgpa() == null) {
            return 0;
        }
        BigDecimal studentCgpa = student.getCgpa();
        BigDecimal requiredCgpa = job.getRequiredCgpa();

        if (studentCgpa.compareTo(requiredCgpa) < 0) {
            return 0; // Not eligible
        }

        // Score based on how much they exceed the requirement (max 100)
        double excess = studentCgpa.subtract(requiredCgpa).doubleValue();
        return Math.min(100, 60 + (excess * 20)); // Base 60 for meeting, bonus for exceeding
    }

    private double calculateSkillScore(User student, Job job) {
        Set<String> studentSkills = parseSkills(student.getSkills());
        Set<String> jobSkills = extractJobSkills(job);

        if (jobSkills.isEmpty()) {
            return 50; // Neutral score when no skills specified
        }
        if (studentSkills.isEmpty()) {
            return 20; // Low score when student has no skills
        }

        long matchCount = jobSkills.stream()
                .filter(skill -> studentSkills.stream()
                        .anyMatch(ss -> ss.toLowerCase().contains(skill.toLowerCase())
                                || skill.toLowerCase().contains(ss.toLowerCase())))
                .count();

        return (double) matchCount / jobSkills.size() * 100;
    }

    private double calculateBranchScore(User student, Job job) {
        if (student.getBranch() == null || job.getAllowedBranches() == null) {
            return 0;
        }

        List<String> allowedBranches = parseBranches(job.getAllowedBranches());
        return allowedBranches.contains(student.getBranch()) ? 100 : 0;
    }

    private Set<String> parseSkills(String skillsJson) {
        if (skillsJson == null || skillsJson.isBlank()) {
            return new HashSet<>();
        }
        try {
            List<String> skills = objectMapper.readValue(skillsJson, new TypeReference<List<String>>() {
            });
            return new HashSet<>(skills);
        } catch (Exception e) {
            // Try comma-separated fallback
            return Arrays.stream(skillsJson.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toSet());
        }
    }

    private Set<String> extractJobSkills(Job job) {
        // Extract skills from job description using common tech keywords
        Set<String> skills = new HashSet<>();
        String desc = job.getDescription() != null ? job.getDescription().toLowerCase() : "";

        String[] techKeywords = {
                "java", "python", "javascript", "react", "angular", "node", "spring",
                "sql", "mongodb", "aws", "docker", "kubernetes", "git", "html", "css",
                "c++", "c#", "typescript", "vue", "django", "flask", "machine learning",
                "deep learning", "ai", "data science", "excel", "communication",
                "leadership", "problem solving", "teamwork", "analytics",
                "rest api", "microservices", "agile", "scrum", "devops", "linux",
                "cloud", "azure", "gcp", "tensorflow", "pytorch", "tableau", "power bi",
                "hadoop", "spark", "kafka", "redis", "elasticsearch", "golang", "rust",
                "swift", "kotlin", "flutter", "react native", "figma", "ui/ux",
                "blockchain", "cybersecurity", "networking", "embedded systems"
        };

        for (String keyword : techKeywords) {
            if (desc.contains(keyword)) {
                skills.add(keyword);
            }
        }
        return skills;
    }

    private List<String> parseBranches(String branchesJson) {
        try {
            return objectMapper.readValue(branchesJson, new TypeReference<List<String>>() {
            });
        } catch (Exception e) {
            return Arrays.asList(branchesJson.split(","));
        }
    }
}
