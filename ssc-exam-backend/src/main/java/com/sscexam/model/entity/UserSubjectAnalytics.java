package com.sscexam.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_subject_analytics",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "subject_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSubjectAnalytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(name = "total_questions_attempted")
    @Builder.Default
    private Integer totalQuestionsAttempted = 0;

    @Column(name = "correct_answers")
    @Builder.Default
    private Integer correctAnswers = 0;

    @Column(name = "incorrect_answers")
    @Builder.Default
    private Integer incorrectAnswers = 0;

    @Column(name = "accuracy_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal accuracyPercentage = BigDecimal.ZERO;

    @Column(name = "average_time_per_question_seconds")
    @Builder.Default
    private Integer averageTimePerQuestionSeconds = 0;

    @Column(name = "strength_score", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal strengthScore = BigDecimal.ZERO;

    @Column(name = "last_attempted_at")
    private LocalDateTime lastAttemptedAt;

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
