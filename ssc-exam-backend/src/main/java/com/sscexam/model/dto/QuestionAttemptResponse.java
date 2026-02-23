package com.sscexam.model.dto;

import com.sscexam.model.enums.QuestionType;
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
public class QuestionAttemptResponse {
    private Long id;
    private String questionText;
    private QuestionType questionType;
    private BigDecimal marks;
    private BigDecimal negativeMarks;
    private List<OptionAttemptResponse> options;
    private Long[] selectedOptionIds;
    private BigDecimal numericalAnswer;
    private Boolean isCorrect;
    private BigDecimal marksObtained;
    private Boolean isBookmarked;
    private Boolean isMarkedForReview;
    private Integer questionOrder;
    private String solutionText;
    private String explanation;
}
