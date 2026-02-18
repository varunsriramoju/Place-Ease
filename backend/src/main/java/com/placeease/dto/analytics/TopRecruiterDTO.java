package com.placeease.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopRecruiterDTO {
    private String companyName;
    private long hiresCount;
}
