package com.sscexam.controller;

import com.sscexam.model.dto.ApiResponse;
import com.sscexam.model.dto.CreateStudyMaterialRequest;
import com.sscexam.model.dto.FileUploadResponse;
import com.sscexam.model.dto.StudyMaterialResponse;
import com.sscexam.model.enums.MaterialType;
import com.sscexam.security.UserPrincipal;
import com.sscexam.service.material.StudyMaterialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/admin/materials")
@RequiredArgsConstructor
@Tag(name = "Study Materials (Admin)", description = "Admin endpoints for managing study materials")
@SecurityRequirement(name = "Bearer Authentication")
@PreAuthorize("hasRole('ADMIN')")
public class StudyMaterialController {

    private final StudyMaterialService materialService;

    @PostMapping
    @Operation(summary = "Create a new study material")
    public ResponseEntity<ApiResponse<StudyMaterialResponse>> create(
            @Valid @RequestBody CreateStudyMaterialRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        StudyMaterialResponse response = materialService.create(request, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Study material created successfully", response));
    }

    @PostMapping("/{id}/upload")
    @Operation(summary = "Upload file for study material")
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadFile(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal userPrincipal) throws IOException {

        FileUploadResponse response = materialService.uploadFile(id, file, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update study material")
    public ResponseEntity<ApiResponse<StudyMaterialResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody CreateStudyMaterialRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        StudyMaterialResponse response = materialService.update(id, request, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Study material updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete study material")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        materialService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Study material deleted successfully", null));
    }

    @GetMapping
    @Operation(summary = "List all study materials (admin view)")
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
}
