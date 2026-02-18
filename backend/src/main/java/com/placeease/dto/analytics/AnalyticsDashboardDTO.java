package com.placeease.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AnalyticsDashboardDTO {
    private List<BranchPlacementDTO> placementByBranch;
    private List<MonthlyTrendDTO> monthlyTrend;
    private List<TopRecruiterDTO> topRecruiters;
    private List<CtcDistributionDTO> ctcDistribution;
    private OverallStatsDTO overallStats;
}
