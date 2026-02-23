package com.sscexam.model.dto;

import com.sscexam.model.enums.DifficultyLevel;
import com.sscexam.model.enums.QuestionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
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
public class UpdateQuestionRequest {

    private Long topicId;

    @Size(min = 10, message = "Question text must be at least 10 characters")
    private String questionText;

    private QuestionType questionType;

    private DifficultyLevel difficultyLevel;

    @DecimalMin(value = "0.0", message = "Marks must be positive")
    private BigDecimal marks;

    @DecimalMin(value = "0.0", message = "Negative marks must be positive")
    private BigDecimal negativeMarks;

    private String solutionText;

    private String explanation;

    @Size(min = 2, max = 6, message = "Must have between 2 and 6 options")
    @Valid
    private List<CreateQuestionOptionRequest> options;
}
