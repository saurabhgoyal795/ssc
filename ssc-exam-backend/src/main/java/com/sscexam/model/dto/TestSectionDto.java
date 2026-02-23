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
public class TestSectionDto {

    private Long id;
    private Long subjectId;
    private String subjectName;
    private String sectionName;
    private Integer sectionOrder;
    private Integer durationMinutes;
    private BigDecimal totalMarks;
    private String instructions;
    private Integer questionCount;
}
