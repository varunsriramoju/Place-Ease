package com.placeease.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OverallStatsDTO {
    private long totalStudents;
    private long placedStudents;
    private double placementPercentage;
    private double averageCtc;
    private long activeJobs;
}
