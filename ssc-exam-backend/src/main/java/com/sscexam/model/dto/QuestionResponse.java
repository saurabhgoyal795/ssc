package com.sscexam.model.dto;

import com.sscexam.model.enums.DifficultyLevel;
import com.sscexam.model.enums.QuestionType;
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
public class QuestionResponse {

    private Long id;
    private UUID uuid;
    private Long subjectId;
    private String subjectName;
    private Long topicId;
    private String topicName;
    private String questionText;
    private QuestionType questionType;
    private DifficultyLevel difficultyLevel;
    private BigDecimal marks;
    private BigDecimal negativeMarks;
    private String solutionText;
    private String explanation;
    private List<QuestionOptionDto> options;
    private LocalDateTime createdAt;
}
