package com.sscexam.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_test_responses",
        uniqueConstraints = @UniqueConstraint(columnNames = {"attempt_id", "question_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserTestResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private UserTestAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "selected_option_ids", columnDefinition = "bigint[]")
    private Long[] selectedOptionIds;

    @Column(name = "numerical_answer", precision = 10, scale = 4)
    private BigDecimal numericalAnswer;

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Column(name = "marks_obtained", precision = 5, scale = 2)
    private BigDecimal marksObtained;

    @Column(name = "time_taken_seconds")
    private Integer timeTakenSeconds;

    @Column(name = "is_bookmarked")
    @Builder.Default
    private Boolean isBookmarked = false;

    @Column(name = "is_marked_for_review")
    @Builder.Default
    private Boolean isMarkedForReview = false;

    @Column(name = "answered_at")
    private LocalDateTime answeredAt;

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
