package com.sscexam.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_activity_log",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "activity_date"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "activity_date", nullable = false)
    private LocalDate activityDate;

    @Column(name = "study_time_minutes")
    @Builder.Default
    private Integer studyTimeMinutes = 0;

    @Column(name = "questions_attempted")
    @Builder.Default
    private Integer questionsAttempted = 0;

    @Column(name = "tests_taken")
    @Builder.Default
    private Integer testsTaken = 0;

    @Column(name = "videos_watched")
    @Builder.Default
    private Integer videosWatched = 0;

    @Column(name = "materials_read")
    @Builder.Default
    private Integer materialsRead = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
