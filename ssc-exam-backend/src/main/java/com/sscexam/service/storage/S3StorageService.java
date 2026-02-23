package com.sscexam.service.storage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3StorageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${app.aws.s3.bucket-name}")
    private String bucketName;

    @Value("${app.aws.s3.cloudfront-domain:}")
    private String cloudfrontDomain;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final String[] ALLOWED_CONTENT_TYPES = {
            "application/pdf",
            "image/jpeg",
            "image/png"
    };

    public String uploadFile(MultipartFile file, String folder) throws IOException {
        // Validate file
        validateFile(file);

        // Generate unique file key
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
        String fileKey = folder + "/" + UUID.randomUUID() + extension;

        // Upload to S3
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));

            log.info("Uploaded file to S3: {}", fileKey);
            return fileKey;
        } catch (S3Exception e) {
            log.error("Failed to upload file to S3: {}", e.getMessage());
            throw new RuntimeException("Failed to upload file to S3", e);
        }
    }

    public String generatePresignedUrl(String fileKey, Duration expiration) {
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(expiration)
                    .getObjectRequest(getObjectRequest)
                    .build();

            PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
            String url = presignedRequest.url().toString();

            log.debug("Generated presigned URL for: {}", fileKey);
            return url;
        } catch (S3Exception e) {
            log.error("Failed to generate presigned URL: {}", e.getMessage());
            throw new RuntimeException("Failed to generate download URL", e);
        }
    }

    public String getPublicUrl(String fileKey) {
        if (cloudfrontDomain != null && !cloudfrontDomain.isEmpty()) {
            return cloudfrontDomain + "/" + fileKey;
        }
        return String.format("https://%s.s3.%s.amazonaws.com/%s",
                bucketName, "ap-south-1", fileKey);
    }

    public void deleteFile(String fileKey) {
        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.info("Deleted file from S3: {}", fileKey);
        } catch (S3Exception e) {
            log.error("Failed to delete file from S3: {}", e.getMessage());
            throw new RuntimeException("Failed to delete file from S3", e);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 10MB");
        }

        String contentType = file.getContentType();
        boolean isAllowed = false;
        for (String allowedType : ALLOWED_CONTENT_TYPES) {
            if (allowedType.equals(contentType)) {
                isAllowed = true;
                break;
            }
        }

        if (!isAllowed) {
            throw new IllegalArgumentException("File type not allowed. Only PDF, JPEG, and PNG files are supported");
        }
    }
}
