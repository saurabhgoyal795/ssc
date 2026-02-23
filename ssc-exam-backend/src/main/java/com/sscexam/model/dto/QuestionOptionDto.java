package com.sscexam.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionOptionDto {

    private Long id;
    private String optionText;
    private Integer optionOrder;
    private Boolean isCorrect; // Only included for admin/creator
}
