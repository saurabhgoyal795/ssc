package com.sscexam.model.dto;

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
public class CreateQuestionOptionRequest {

    @NotBlank(message = "Option text is required")
    private String optionText;

    @NotNull(message = "Option order is required")
    private Integer optionOrder;

    @NotNull(message = "Must specify if option is correct")
    private Boolean isCorrect;
}
