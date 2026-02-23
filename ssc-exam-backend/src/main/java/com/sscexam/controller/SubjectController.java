package com.sscexam.controller;

import com.sscexam.model.dto.ApiResponse;
import com.sscexam.model.entity.Subject;
import com.sscexam.repository.SubjectRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/subjects")
@RequiredArgsConstructor
@Tag(name = "Subjects", description = "Subject endpoints")
public class SubjectController {

    private final SubjectRepository subjectRepository;

    @GetMapping
    @Operation(summary = "Get all active subjects")
    public ResponseEntity<ApiResponse<List<Subject>>> getAllSubjects() {
        List<Subject> subjects = subjectRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
        return ResponseEntity.ok(ApiResponse.success(subjects));
    }
}
