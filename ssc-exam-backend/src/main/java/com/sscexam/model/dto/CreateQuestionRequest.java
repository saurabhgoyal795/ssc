package com.sscexam.model.dto;

import com.sscexam.model.enums.DifficultyLevel;
import com.sscexam.model.enums.QuestionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
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
public class CreateQuestionRequest {

    @NotNull(message = "Subject ID is required")
    private Long subjectId;

    private Long topicId;

    @NotBlank(message = "Question text is required")
    @Size(min = 10, message = "Question text must be at least 10 characters")
    private String questionText;

    @NotNull(message = "Question type is required")
    private QuestionType questionType;

    @NotNull(message = "Difficulty level is required")
    private DifficultyLevel difficultyLevel;

    @NotNull(message = "Marks are required")
    @DecimalMin(value = "0.0", message = "Marks must be positive")
    private BigDecimal marks;

    @DecimalMin(value = "0.0", message = "Negative marks must be positive")
    private BigDecimal negativeMarks;

    private String solutionText;

    private String explanation;

    @NotNull(message = "Options are required")
    @Size(min = 2, max = 6, message = "Must have between 2 and 6 options")
    @Valid
    private List<CreateQuestionOptionRequest> options;
}
