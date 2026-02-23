package com.sscexam.model.entity;

import com.sscexam.model.enums.TestAttemptStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "user_test_attempts",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "test_id", "attempt_number"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserTestAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, updatable = false)
    private UUID uuid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id", nullable = false)
    private Test test;

    @Column(name = "attempt_number", nullable = false)
    private Integer attemptNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TestAttemptStatus status = TestAttemptStatus.IN_PROGRESS;

    @Column(name = "started_at", nullable = false)
    @Builder.Default
    private LocalDateTime startedAt = LocalDateTime.now();

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "time_taken_seconds")
    private Integer timeTakenSeconds;

    @Column(name = "total_score", precision = 10, scale = 2)
    private BigDecimal totalScore;

    @Column(name = "correct_answers")
    @Builder.Default
    private Integer correctAnswers = 0;

    @Column(name = "incorrect_answers")
    @Builder.Default
    private Integer incorrectAnswers = 0;

    @Column(name = "unanswered")
    @Builder.Default
    private Integer unanswered = 0;

    @Column(name = "accuracy_percentage", precision = 5, scale = 2)
    private BigDecimal accuracyPercentage;

    @Column(precision = 5, scale = 2)
    private BigDecimal percentile;

    @Column(name = "rank")
    private Integer rank;

    @Column(name = "session_data", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String sessionData;

    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<UserTestResponse> responses = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (uuid == null) {
            uuid = UUID.randomUUID();
        }
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
