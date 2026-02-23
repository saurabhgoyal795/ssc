package com.sscexam.model.dto;

import com.sscexam.model.enums.MaterialType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyMaterialResponse {
    private Long id;
    private UUID uuid;
    private String title;
    private String slug;
    private String description;
    private Long subjectId;
    private String subjectName;
    private Long topicId;
    private String topicName;
    private MaterialType materialType;
    private String fileUrl;
    private Long fileSizeBytes;
    private String thumbnailUrl;
    private Boolean isPremium;
    private Integer downloadCount;
    private Integer viewCount;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
