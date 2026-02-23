package com.sscexam.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileUploadResponse {
    private String s3Key;
    private String fileUrl;
    private Long fileSizeBytes;
    private String fileName;
}
