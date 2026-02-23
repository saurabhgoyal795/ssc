package com.sscexam.controller;

import com.sscexam.model.dto.ApiResponse;
import com.sscexam.model.dto.TestDetailResponse;
import com.sscexam.model.dto.TestResponse;
import com.sscexam.model.enums.DifficultyLevel;
import com.sscexam.model.enums.TestType;
import com.sscexam.service.TestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tests")
@RequiredArgsConstructor
@Tag(name = "Tests (Public)", description = "Public test browsing endpoints")
public class PublicTestController {

    private final TestService testService;

    @GetMapping
    @Operation(summary = "Get all published tests")
    public ResponseEntity<ApiResponse<Page<TestResponse>>> getAllTests(
            @RequestParam(required = false) TestType testType,
            @RequestParam(required = false) DifficultyLevel difficultyLevel,
            @RequestParam(required = false) Boolean isPremium,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<TestResponse> tests;

        if (search != null && !search.trim().isEmpty()) {
            tests = testService.searchTests(search, pageable);
        } else if (testType != null || difficultyLevel != null || isPremium != null) {
            tests = testService.getTestsByFilters(testType, difficultyLevel, isPremium, pageable);
        } else {
            tests = testService.getAllTests(pageable);
        }

        return ResponseEntity.ok(ApiResponse.success(tests));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get test details by slug")
    public ResponseEntity<ApiResponse<TestResponse>> getTestBySlug(@PathVariable String slug) {
        TestResponse response = testService.getTestBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{slug}/details")
    @Operation(summary = "Get full test details with questions (for test preview)")
    public ResponseEntity<ApiResponse<TestDetailResponse>> getTestDetails(@PathVariable String slug) {
        // Don't include correct answers for preview
        TestDetailResponse response = testService.getTestDetails(slug, false);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
