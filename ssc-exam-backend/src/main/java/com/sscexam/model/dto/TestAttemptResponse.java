package com.sscexam.model.dto;

import com.sscexam.model.enums.TestAttemptStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestAttemptResponse {
    private Long id;
    private UUID uuid;
    private Long testId;
    private String testTitle;
    private Integer attemptNumber;
    private TestAttemptStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Integer timeTakenSeconds;
    private BigDecimal totalScore;
    private Integer correctAnswers;
    private Integer incorrectAnswers;
    private Integer unanswered;
    private BigDecimal accuracyPercentage;
    private BigDecimal percentile;
    private Integer rank;
    private Integer durationMinutes;
    private Integer totalQuestions;
    private List<QuestionAttemptResponse> questions;
}
