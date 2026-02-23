package com.sscexam.model.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTestSectionRequest {

    @NotNull(message = "Subject ID is required")
    private Long subjectId;

    @NotBlank(message = "Section name is required")
    private String sectionName;

    @NotNull(message = "Section order is required")
    private Integer sectionOrder;

    private Integer durationMinutes;

    @NotNull(message = "Total marks are required")
    @DecimalMin(value = "0.0", message = "Total marks must be positive")
    private BigDecimal totalMarks;

    private String instructions;
}
