package com.placeease.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BranchPlacementDTO {
    private String branch;
    private long totalStudents;
    private long placedStudents;
    private double placementRate;
}
