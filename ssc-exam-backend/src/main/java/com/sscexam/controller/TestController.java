package com.sscexam.controller;

import com.sscexam.model.dto.*;
import com.sscexam.model.enums.DifficultyLevel;
import com.sscexam.model.enums.TestType;
import com.sscexam.service.TestService;
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

@RestController
@RequestMapping("/api/v1/admin/tests")
@RequiredArgsConstructor
@Tag(name = "Tests (Admin)", description = "Test management endpoints")
@PreAuthorize("hasRole('ADMIN')")
public class TestController {

    private final TestService testService;

    @PostMapping
    @Operation(summary = "Create a new test")
    public ResponseEntity<ApiResponse<TestResponse>> createTest(
            @Valid @RequestBody CreateTestRequest request
    ) {
        TestResponse response = testService.createTest(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Test created successfully", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a test")
    public ResponseEntity<ApiResponse<TestResponse>> updateTest(
            @PathVariable Long id,
            @Valid @RequestBody CreateTestRequest request
    ) {
        TestResponse response = testService.updateTest(id, request);
        return ResponseEntity.ok(ApiResponse.success("Test updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a test")
    public ResponseEntity<ApiResponse<Void>> deleteTest(@PathVariable Long id) {
        testService.deleteTest(id);
        return ResponseEntity.ok(ApiResponse.success("Test deleted successfully", null));
    }

    @PostMapping("/{id}/publish")
    @Operation(summary = "Publish a test")
    public ResponseEntity<ApiResponse<TestResponse>> publishTest(@PathVariable Long id) {
        TestResponse response = testService.publishTest(id);
        return ResponseEntity.ok(ApiResponse.success("Test published successfully", response));
    }

    @PostMapping("/{id}/unpublish")
    @Operation(summary = "Unpublish a test")
    public ResponseEntity<ApiResponse<TestResponse>> unpublishTest(@PathVariable Long id) {
        TestResponse response = testService.unpublishTest(id);
        return ResponseEntity.ok(ApiResponse.success("Test unpublished successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get test by ID")
    public ResponseEntity<ApiResponse<TestResponse>> getTestById(@PathVariable Long id) {
        TestResponse response = testService.getTestById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @Operation(summary = "Get all tests (admin view)")
    public ResponseEntity<ApiResponse<Page<TestResponse>>> getAllTests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<TestResponse> tests = testService.getAllTestsAdmin(pageable);
        return ResponseEntity.ok(ApiResponse.success(tests));
    }

    @GetMapping("/drafts")
    @Operation(summary = "Get draft tests (unpublished)")
    public ResponseEntity<ApiResponse<Page<TestResponse>>> getDraftTests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<TestResponse> tests = testService.getDraftTests(pageable);
        return ResponseEntity.ok(ApiResponse.success(tests));
    }
}
