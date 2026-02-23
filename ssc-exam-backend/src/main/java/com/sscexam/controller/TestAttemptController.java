package com.sscexam.controller;

import com.sscexam.model.dto.ApiResponse;
import com.sscexam.model.dto.SubmitAnswerRequest;
import com.sscexam.model.dto.TestAttemptResponse;
import com.sscexam.model.dto.TestResultResponse;
import com.sscexam.security.UserPrincipal;
import com.sscexam.service.test.TestAttemptService;
import com.sscexam.service.test.TestEvaluationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tests")
@RequiredArgsConstructor
@Tag(name = "Test Attempts", description = "Test taking and attempt management")
public class TestAttemptController {

    private final TestAttemptService testAttemptService;
    private final TestEvaluationService evaluationService;

    @PostMapping("/{testId}/start")
    @Operation(summary = "Start a new test attempt")
    public ResponseEntity<ApiResponse<TestAttemptResponse>> startTest(
            @PathVariable Long testId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        TestAttemptResponse response = testAttemptService.startTest(testId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Test started successfully", response));
    }

    @GetMapping("/attempts/{attemptUuid}")
    @Operation(summary = "Get test attempt details")
    public ResponseEntity<ApiResponse<TestAttemptResponse>> getAttemptDetails(
            @PathVariable UUID attemptUuid,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        TestAttemptResponse response = testAttemptService.getAttemptDetails(attemptUuid, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/attempts/{attemptUuid}/answers")
    @Operation(summary = "Submit answer for a question (auto-save)")
    public ResponseEntity<ApiResponse<Void>> submitAnswer(
            @PathVariable UUID attemptUuid,
            @Valid @RequestBody SubmitAnswerRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        testAttemptService.saveAnswer(attemptUuid, request, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Answer saved successfully", null));
    }

    @PostMapping("/attempts/{attemptUuid}/submit")
    @Operation(summary = "Submit entire test")
    public ResponseEntity<ApiResponse<TestAttemptResponse>> submitTest(
            @PathVariable UUID attemptUuid,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        TestAttemptResponse response = testAttemptService.submitTest(attemptUuid, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Test submitted successfully", response));
    }

    @GetMapping("/attempts/{attemptUuid}/result")
    @Operation(summary = "Get test result with score and analytics")
    public ResponseEntity<ApiResponse<TestResultResponse>> getTestResult(
            @PathVariable UUID attemptUuid,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        TestResultResponse response = evaluationService.getTestResult(attemptUuid, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
