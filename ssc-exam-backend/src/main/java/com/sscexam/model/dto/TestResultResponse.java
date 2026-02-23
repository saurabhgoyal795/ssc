package com.sscexam.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestResultResponse {
    private UUID attemptUuid;
    private String testTitle;
    private LocalDateTime submittedAt;
    private Integer timeTakenSeconds;
    private BigDecimal totalScore;
    private BigDecimal maxScore;
    private Integer correctAnswers;
    private Integer incorrectAnswers;
    private Integer unanswered;
    private BigDecimal accuracyPercentage;
    private BigDecimal percentile;
    private Integer rank;
    private Integer totalAttempts;
    private String performanceSummary;
}
