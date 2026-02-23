package com.sscexam.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptionAttemptResponse {
    private Long id;
    private String optionText;
    private Integer optionOrder;
    private Boolean isCorrect;  // Only shown after submission or to admin
}
