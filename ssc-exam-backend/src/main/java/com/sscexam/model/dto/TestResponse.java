package com.sscexam.model.dto;

import com.sscexam.model.enums.DifficultyLevel;
import com.sscexam.model.enums.TestType;
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
public class TestResponse {

    private Long id;
    private UUID uuid;
    private String title;
    private String slug;
    private String description;
    private TestType testType;
    private DifficultyLevel difficultyLevel;
    private Integer durationMinutes;
    private BigDecimal totalMarks;
    private BigDecimal passingMarks;
    private String instructions;
    private Boolean isPremium;
    private Boolean isPublished;
    private LocalDateTime publishedAt;
    private Integer totalQuestions;
    private List<TestSectionDto> sections;
    private LocalDateTime createdAt;
}
