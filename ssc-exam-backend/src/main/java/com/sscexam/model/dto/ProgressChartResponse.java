package com.sscexam.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressChartResponse {
    private List<DataPoint> scoreProgress;
    private List<DataPoint> accuracyProgress;
    private List<DataPoint> activityProgress;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DataPoint {
        private String label; // Date or category
        private BigDecimal value;
        private String category; // Optional category name
    }
}
