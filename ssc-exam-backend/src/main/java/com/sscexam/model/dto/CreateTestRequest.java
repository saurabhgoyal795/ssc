package com.sscexam.model.dto;

import com.sscexam.model.enums.DifficultyLevel;
import com.sscexam.model.enums.TestType;
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
public class CreateTestRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 255, message = "Title must be between 5 and 255 characters")
    private String title;

    @NotBlank(message = "Slug is required")
    @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug must contain only lowercase letters, numbers, and hyphens")
    private String slug;

    private String description;

    @NotNull(message = "Test type is required")
    private TestType testType;

    @NotNull(message = "Difficulty level is required")
    private DifficultyLevel difficultyLevel;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;

    @NotNull(message = "Total marks are required")
    @DecimalMin(value = "0.0", message = "Total marks must be positive")
    private BigDecimal totalMarks;

    @DecimalMin(value = "0.0", message = "Passing marks must be positive")
    private BigDecimal passingMarks;

    private String instructions;

    private Boolean isPremium;

    @Valid
    private List<CreateTestSectionRequest> sections;

    @NotNull(message = "Question IDs are required")
    @Size(min = 1, message = "Test must have at least one question")
    private List<Long> questionIds;
}
