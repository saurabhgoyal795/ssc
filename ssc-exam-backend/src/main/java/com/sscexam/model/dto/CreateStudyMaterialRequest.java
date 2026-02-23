package com.sscexam.model.dto;

import com.sscexam.model.enums.MaterialType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateStudyMaterialRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String slug;

    private String description;

    private Long subjectId;

    private Long topicId;

    @NotNull(message = "Material type is required")
    private MaterialType materialType;

    private Boolean isPremium;
}
