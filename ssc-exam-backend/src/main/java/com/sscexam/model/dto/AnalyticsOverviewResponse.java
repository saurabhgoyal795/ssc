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
public class AnalyticsOverviewResponse {
    private OverallStats overallStats;
    private List<SubjectPerformance> subjectPerformance;
    private List<RecentActivity> recentActivity;
    private List<WeakArea> weakAreas;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OverallStats {
        private Integer totalTestsAttempted;
        private Integer totalQuestionsAttempted;
        private Integer totalCorrectAnswers;
        private BigDecimal overallAccuracy;
        private BigDecimal averageScore;
        private Integer totalStudyTimeMinutes;
        private Integer currentStreak;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubjectPerformance {
        private Long subjectId;
        private String subjectName;
        private Integer totalQuestions;
        private Integer correctAnswers;
        private BigDecimal accuracyPercentage;
        private BigDecimal strengthScore;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivity {
        private String date;
        private Integer testsAttempted;
        private Integer questionsAttempted;
        private Integer studyTimeMinutes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeakArea {
        private String type; // SUBJECT or TOPIC
        private Long id;
        private String name;
        private BigDecimal accuracyPercentage;
        private String recommendation;
    }
}
