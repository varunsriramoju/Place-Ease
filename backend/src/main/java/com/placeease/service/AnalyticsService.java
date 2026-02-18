package com.placeease.service;

import com.placeease.dto.analytics.*;
import com.placeease.repository.ApplicationRepository;
import com.placeease.repository.JobRepository;
import com.placeease.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;

    public AnalyticsDashboardDTO getDashboardAnalytics() {
        AnalyticsDashboardDTO dashboard = new AnalyticsDashboardDTO();
        dashboard.setPlacementByBranch(getPlacementByBranch());
        dashboard.setMonthlyTrend(getMonthlyPlacementTrend());
        dashboard.setTopRecruiters(getTopRecruiters());
        dashboard.setCtcDistribution(getCtcDistribution());
        dashboard.setOverallStats(getOverallStats());
        return dashboard;
    }

    private List<BranchPlacementDTO> getPlacementByBranch() {
        List<String> branches = List.of("CS", "IT", "ECE", "EEE", "MECH", "CIVIL");
        List<BranchPlacementDTO> stats = new ArrayList<>();

        for (String branch : branches) {
            long total = userRepository.countByRoleAndBranch("STUDENT", branch);
            long placed = applicationRepository.countPlacedStudentsByBranch(branch);
            double rate = total > 0 ? ((double) placed / total) * 100 : 0.0;
            rate = Math.round(rate * 100.0) / 100.0;
            stats.add(new BranchPlacementDTO(branch, total, placed, rate));
        }
        return stats;
    }

    private List<MonthlyTrendDTO> getMonthlyPlacementTrend() {
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
        List<Object[]> results = applicationRepository.getMonthlyPlacements(sixMonthsAgo);

        return results.stream().map(row -> {
            Integer monthIdx = (Integer) row[0];
            Integer year = (Integer) row[1];
            Long count = (Long) row[2];
            String monthName = java.time.Month.of(monthIdx).name();
            monthName = monthName.substring(0, 1) + monthName.substring(1).toLowerCase();
            return new MonthlyTrendDTO(monthName, year, count);
        }).collect(Collectors.toList());
    }

    private List<TopRecruiterDTO> getTopRecruiters() {
        List<Object[]> results = applicationRepository.getTopRecruiters();
        return results.stream().limit(5).map(row -> {
            String company = (String) row[0];
            Long count = (Long) row[1];
            return new TopRecruiterDTO(company, count);
        }).collect(Collectors.toList());
    }

    private List<CtcDistributionDTO> getCtcDistribution() {
        List<BigDecimal> ctcValues = applicationRepository.getPlacedCtcValues();
        if (ctcValues.isEmpty()) {
            return new ArrayList<>();
        }

        long below5 = ctcValues.stream().filter(v -> v.compareTo(BigDecimal.valueOf(5)) < 0).count();
        long from5to10 = ctcValues.stream()
                .filter(v -> v.compareTo(BigDecimal.valueOf(5)) >= 0 && v.compareTo(BigDecimal.valueOf(10)) < 0)
                .count();
        long from10to15 = ctcValues.stream()
                .filter(v -> v.compareTo(BigDecimal.valueOf(10)) >= 0 && v.compareTo(BigDecimal.valueOf(15)) < 0)
                .count();
        long from15to25 = ctcValues.stream()
                .filter(v -> v.compareTo(BigDecimal.valueOf(15)) >= 0 && v.compareTo(BigDecimal.valueOf(25)) < 0)
                .count();
        long above25 = ctcValues.stream().filter(v -> v.compareTo(BigDecimal.valueOf(25)) >= 0).count();

        List<CtcDistributionDTO> distribution = new ArrayList<>();
        distribution.add(new CtcDistributionDTO("< 5 LPA", below5));
        distribution.add(new CtcDistributionDTO("5-10 LPA", from5to10));
        distribution.add(new CtcDistributionDTO("10-15 LPA", from10to15));
        distribution.add(new CtcDistributionDTO("15-25 LPA", from15to25));
        distribution.add(new CtcDistributionDTO("> 25 LPA", above25));
        return distribution;
    }

    private OverallStatsDTO getOverallStats() {
        long totalStudents = userRepository.findByRole("STUDENT").size();
        long placedStudents = applicationRepository.countTotalPlacedStudents();
        long activeJobs = jobRepository.countByStatus("APPROVED");
        Double avgCtc = applicationRepository.getAverageCtc();

        double placementPercentage = totalStudents > 0 ? ((double) placedStudents / totalStudents) * 100 : 0.0;
        placementPercentage = Math.round(placementPercentage * 100.0) / 100.0;

        return new OverallStatsDTO(
                totalStudents,
                placedStudents,
                placementPercentage,
                avgCtc != null ? Math.round(avgCtc * 100.0) / 100.0 : 0.0,
                activeJobs);
    }
}
