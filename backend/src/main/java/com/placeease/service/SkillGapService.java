package com.placeease.service;

import com.placeease.model.Job;
import com.placeease.model.User;
import com.placeease.repository.JobRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SkillGapService {

    private final JobRepository jobRepository;
    private final ObjectMapper objectMapper;

    /**
     * Analyze job descriptions vs student skills to identify the most in-demand
     * skills the student is missing.
     */
    public Map<String, Object> analyzeSkillGap(User student) {
        Set<String> studentSkills = parseSkills(student.getSkills());
        List<Job> approvedJobs = jobRepository.findByStatus("APPROVED");

        // Count demand frequency for each skill across all jobs
        Map<String, Integer> skillDemand = new LinkedHashMap<>();
        for (Job job : approvedJobs) {
            Set<String> jobSkills = extractJobSkills(job);
            for (String skill : jobSkills) {
                skillDemand.merge(skill, 1, (a, b) -> a + b);
            }
        }

        // Separate into matching and missing skills
        List<Map<String, Object>> matchingSkills = new ArrayList<>();
        List<Map<String, Object>> missingSkills = new ArrayList<>();

        for (Map.Entry<String, Integer> entry : skillDemand.entrySet()) {
            String skill = entry.getKey();
            int demand = entry.getValue();

            boolean hasSkill = studentSkills.stream()
                    .anyMatch(ss -> ss.toLowerCase().contains(skill.toLowerCase())
                            || skill.toLowerCase().contains(ss.toLowerCase()));

            Map<String, Object> skillInfo = new LinkedHashMap<>();
            skillInfo.put("skill", capitalize(skill));
            skillInfo.put("demand", demand);
            skillInfo.put("demandLevel", getDemandLevel(demand, approvedJobs.size()));

            if (hasSkill) {
                matchingSkills.add(skillInfo);
            } else {
                missingSkills.add(skillInfo);
            }
        }

        // Sort missing skills by demand (highest first)
        missingSkills.sort((a, b) -> Integer.compare((int) b.get("demand"), (int) a.get("demand")));
        matchingSkills.sort((a, b) -> Integer.compare((int) b.get("demand"), (int) a.get("demand")));

        // Limit to top 15 missing skills
        if (missingSkills.size() > 15) {
            missingSkills = missingSkills.subList(0, 15);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("studentSkills", studentSkills.stream().map(this::capitalize).collect(Collectors.toList()));
        result.put("matchingSkills", matchingSkills);
        result.put("missingSkills", missingSkills);
        result.put("totalJobsAnalyzed", approvedJobs.size());
        result.put("coveragePercentage", calculateCoverage(matchingSkills.size(),
                matchingSkills.size() + missingSkills.size()));

        return result;
    }

    private double calculateCoverage(int matching, int total) {
        if (total == 0)
            return 0;
        return Math.round(((double) matching / total) * 10000.0) / 100.0;
    }

    private String getDemandLevel(int demand, int totalJobs) {
        if (totalJobs == 0)
            return "LOW";
        double ratio = (double) demand / totalJobs;
        if (ratio >= 0.5)
            return "HIGH";
        if (ratio >= 0.2)
            return "MEDIUM";
        return "LOW";
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty())
            return s;
        if (s.length() <= 3)
            return s.toUpperCase(); // e.g. SQL, CSS, AI
        return s.substring(0, 1).toUpperCase() + s.substring(1);
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
            return Arrays.stream(skillsJson.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toSet());
        }
    }

    private Set<String> extractJobSkills(Job job) {
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
}
