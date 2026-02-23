package com.sscexam.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitAnswerRequest {
    private Long questionId;
    private Long[] selectedOptionIds;  // For MCQs
    private BigDecimal numericalAnswer;  // For numerical questions
    private Boolean isBookmarked;
    private Boolean isMarkedForReview;
    private Integer timeTakenSeconds;
}
