package com.sscexam.service.material;

import com.sscexam.exception.ResourceNotFoundException;
import com.sscexam.model.dto.CreateStudyMaterialRequest;
import com.sscexam.model.dto.FileUploadResponse;
import com.sscexam.model.dto.StudyMaterialResponse;
import com.sscexam.model.entity.StudyMaterial;
import com.sscexam.model.entity.Subject;
import com.sscexam.model.entity.Topic;
import com.sscexam.model.entity.User;
import com.sscexam.model.enums.MaterialType;
import com.sscexam.repository.StudyMaterialRepository;
import com.sscexam.repository.SubjectRepository;
import com.sscexam.repository.TopicRepository;
import com.sscexam.repository.UserRepository;
import com.sscexam.service.storage.S3StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudyMaterialService {

    private final StudyMaterialRepository materialRepository;
    private final SubjectRepository subjectRepository;
    private final TopicRepository topicRepository;
    private final UserRepository userRepository;
    private final S3StorageService s3StorageService;

    @Transactional
    public StudyMaterialResponse create(CreateStudyMaterialRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Auto-generate slug if not provided
        String slug = request.getSlug();
        if (slug == null || slug.isEmpty()) {
            slug = generateSlug(request.getTitle());
        }

        Subject subject = null;
        if (request.getSubjectId() != null) {
            subject = subjectRepository.findById(request.getSubjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        }

        Topic topic = null;
        if (request.getTopicId() != null) {
            topic = topicRepository.findById(request.getTopicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Topic not found"));
        }

        StudyMaterial material = StudyMaterial.builder()
                .uuid(UUID.randomUUID())
                .title(request.getTitle())
                .slug(slug)
                .description(request.getDescription())
                .subject(subject)
                .topic(topic)
                .materialType(request.getMaterialType())
                .isPremium(request.getIsPremium() != null ? request.getIsPremium() : false)
                .isActive(true)
                .downloadCount(0)
                .viewCount(0)
                .createdBy(user)
                .build();

        material = materialRepository.save(material);

        log.info("Created study material: {} by user: {}", material.getTitle(), userId);

        return mapToResponse(material);
    }

    @Transactional
    public FileUploadResponse uploadFile(Long materialId, MultipartFile file, Long userId) throws IOException {
        StudyMaterial material = materialRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Study material not found"));

        // Delete old file if exists
        if (material.getS3Key() != null) {
            try {
                s3StorageService.deleteFile(material.getS3Key());
            } catch (Exception e) {
                log.warn("Failed to delete old file: {}", e.getMessage());
            }
        }

        // Upload new file
        String s3Key = s3StorageService.uploadFile(file, "study-materials");
        String fileUrl = s3StorageService.getPublicUrl(s3Key);

        material.setS3Key(s3Key);
        material.setFileUrl(fileUrl);
        material.setFileSizeBytes(file.getSize());

        materialRepository.save(material);

        log.info("Uploaded file for material: {}, S3 key: {}", materialId, s3Key);

        return FileUploadResponse.builder()
                .s3Key(s3Key)
                .fileUrl(fileUrl)
                .fileSizeBytes(file.getSize())
                .fileName(file.getOriginalFilename())
                .build();
    }

    @Transactional
    public StudyMaterialResponse update(Long id, CreateStudyMaterialRequest request, Long userId) {
        StudyMaterial material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Study material not found"));

        if (request.getTitle() != null) {
            material.setTitle(request.getTitle());
        }

        if (request.getSlug() != null) {
            material.setSlug(request.getSlug());
        }

        if (request.getDescription() != null) {
            material.setDescription(request.getDescription());
        }

        if (request.getSubjectId() != null) {
            Subject subject = subjectRepository.findById(request.getSubjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
            material.setSubject(subject);
        }

        if (request.getTopicId() != null) {
            Topic topic = topicRepository.findById(request.getTopicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Topic not found"));
            material.setTopic(topic);
        }

        if (request.getMaterialType() != null) {
            material.setMaterialType(request.getMaterialType());
        }

        if (request.getIsPremium() != null) {
            material.setIsPremium(request.getIsPremium());
        }

        material = materialRepository.save(material);

        log.info("Updated study material: {}", id);

        return mapToResponse(material);
    }

    @Transactional
    public void delete(Long id) {
        StudyMaterial material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Study material not found"));

        material.setIsActive(false);
        materialRepository.save(material);

        log.info("Deleted (soft) study material: {}", id);
    }

    @Transactional(readOnly = true)
    public StudyMaterialResponse getBySlug(String slug) {
        StudyMaterial material = materialRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Study material not found"));

        if (!material.getIsActive()) {
            throw new ResourceNotFoundException("Study material not found");
        }

        // Increment view count (in a separate transaction)
        incrementViewCount(material.getId());

        return mapToResponse(material);
    }

    @Transactional(readOnly = true)
    public Page<StudyMaterialResponse> list(Long subjectId, Long topicId, MaterialType materialType,
                                             Boolean isPremium, String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<StudyMaterial> materials;

        if (search != null && !search.isEmpty()) {
            materials = materialRepository.findByFiltersAndSearch(
                    subjectId, topicId, materialType, isPremium, search, pageable);
        } else {
            materials = materialRepository.findByFilters(
                    subjectId, topicId, materialType, isPremium, pageable);
        }

        return materials.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public String generateDownloadUrl(String slug) {
        StudyMaterial material = materialRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Study material not found"));

        if (!material.getIsActive()) {
            throw new ResourceNotFoundException("Study material not found");
        }

        if (material.getS3Key() == null) {
            throw new IllegalStateException("No file uploaded for this material");
        }

        // Increment download count
        incrementDownloadCount(material.getId());

        // Generate presigned URL (1 hour expiry)
        return s3StorageService.generatePresignedUrl(material.getS3Key(), Duration.ofHours(1));
    }

    @Transactional
    public void incrementViewCount(Long materialId) {
        StudyMaterial material = materialRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Study material not found"));
        material.incrementViewCount();
        materialRepository.save(material);
    }

    @Transactional
    public void incrementDownloadCount(Long materialId) {
        StudyMaterial material = materialRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Study material not found"));
        material.incrementDownloadCount();
        materialRepository.save(material);
    }

    private String generateSlug(String title) {
        String slug = title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();

        // Check if slug exists
        int counter = 1;
        String originalSlug = slug;
        while (materialRepository.findBySlug(slug).isPresent()) {
            slug = originalSlug + "-" + counter++;
        }

        return slug;
    }

    private StudyMaterialResponse mapToResponse(StudyMaterial material) {
        return StudyMaterialResponse.builder()
                .id(material.getId())
                .uuid(material.getUuid())
                .title(material.getTitle())
                .slug(material.getSlug())
                .description(material.getDescription())
                .subjectId(material.getSubject() != null ? material.getSubject().getId() : null)
                .subjectName(material.getSubject() != null ? material.getSubject().getName() : null)
                .topicId(material.getTopic() != null ? material.getTopic().getId() : null)
                .topicName(material.getTopic() != null ? material.getTopic().getName() : null)
                .materialType(material.getMaterialType())
                .fileUrl(material.getFileUrl())
                .fileSizeBytes(material.getFileSizeBytes())
                .thumbnailUrl(material.getThumbnailUrl())
                .isPremium(material.getIsPremium())
                .downloadCount(material.getDownloadCount())
                .viewCount(material.getViewCount())
                .createdByName(material.getCreatedBy() != null ? material.getCreatedBy().getFullName() : null)
                .createdAt(material.getCreatedAt())
                .updatedAt(material.getUpdatedAt())
                .build();
    }
}
