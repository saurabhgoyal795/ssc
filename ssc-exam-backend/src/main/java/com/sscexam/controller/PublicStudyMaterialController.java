package com.sscexam.controller;

import com.sscexam.model.dto.ApiResponse;
import com.sscexam.model.dto.StudyMaterialResponse;
import com.sscexam.model.enums.MaterialType;
import com.sscexam.service.material.StudyMaterialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/materials")
@RequiredArgsConstructor
@Tag(name = "Study Materials (Public)", description = "Public endpoints for browsing study materials")
public class PublicStudyMaterialController {

    private final StudyMaterialService materialService;

    @GetMapping
    @Operation(summary = "List all published study materials")
    public ResponseEntity<ApiResponse<Page<StudyMaterialResponse>>> list(
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) Long topicId,
            @RequestParam(required = false) MaterialType materialType,
            @RequestParam(required = false) Boolean isPremium,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<StudyMaterialResponse> materials = materialService.list(
                subjectId, topicId, materialType, isPremium, search, page, size);

        return ResponseEntity.ok(ApiResponse.success(materials));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get study material by slug")
    public ResponseEntity<ApiResponse<StudyMaterialResponse>> getBySlug(@PathVariable String slug) {
        StudyMaterialResponse material = materialService.getBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(material));
    }

    @GetMapping("/{slug}/download")
    @Operation(summary = "Get download URL for study material")
    public ResponseEntity<ApiResponse<Map<String, String>>> getDownloadUrl(@PathVariable String slug) {
        String downloadUrl = materialService.generateDownloadUrl(slug);
        return ResponseEntity.ok(ApiResponse.success(Map.of("downloadUrl", downloadUrl)));
    }
}
