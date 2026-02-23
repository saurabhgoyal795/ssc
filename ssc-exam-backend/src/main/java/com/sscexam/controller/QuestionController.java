package com.sscexam.controller;

import com.sscexam.model.dto.*;
import com.sscexam.model.enums.DifficultyLevel;
import com.sscexam.model.enums.QuestionType;
import com.sscexam.service.QuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/questions")
@RequiredArgsConstructor
@Tag(name = "Questions (Admin)", description = "Question management endpoints")
@PreAuthorize("hasRole('ADMIN')")
public class QuestionController {

    private final QuestionService questionService;

    @PostMapping
    @Operation(summary = "Create a new question")
    public ResponseEntity<ApiResponse<QuestionResponse>> createQuestion(
            @Valid @RequestBody CreateQuestionRequest request
    ) {
        QuestionResponse response = questionService.createQuestion(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Question created successfully", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a question")
    public ResponseEntity<ApiResponse<QuestionResponse>> updateQuestion(
            @PathVariable Long id,
            @Valid @RequestBody UpdateQuestionRequest request
    ) {
        QuestionResponse response = questionService.updateQuestion(id, request);
        return ResponseEntity.ok(ApiResponse.success("Question updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a question")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.ok(ApiResponse.success("Question deleted successfully", null));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get question by ID")
    public ResponseEntity<ApiResponse<QuestionResponse>> getQuestionById(@PathVariable Long id) {
        QuestionResponse response = questionService.getQuestionById(id, true);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/uuid/{uuid}")
    @Operation(summary = "Get question by UUID")
    public ResponseEntity<ApiResponse<QuestionResponse>> getQuestionByUuid(@PathVariable UUID uuid) {
        QuestionResponse response = questionService.getQuestionByUuid(uuid, true);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @Operation(summary = "Get all questions with filters")
    public ResponseEntity<ApiResponse<Page<QuestionResponse>>> getAllQuestions(
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) Long topicId,
            @RequestParam(required = false) DifficultyLevel difficultyLevel,
            @RequestParam(required = false) QuestionType questionType,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<QuestionResponse> questions;

        if (search != null && !search.trim().isEmpty()) {
            questions = questionService.searchQuestions(search, pageable, true);
        } else if (subjectId != null || topicId != null || difficultyLevel != null || questionType != null) {
            questions = questionService.getQuestionsByFilters(
                    subjectId, topicId, difficultyLevel, questionType, pageable, true
            );
        } else {
            questions = questionService.getAllQuestions(pageable, true);
        }

        return ResponseEntity.ok(ApiResponse.success(questions));
    }
}
