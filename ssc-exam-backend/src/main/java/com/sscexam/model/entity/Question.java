package com.sscexam.model.entity;

import com.sscexam.model.enums.DifficultyLevel;
import com.sscexam.model.enums.QuestionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "questions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, updatable = false)
    private UUID uuid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id")
    private Topic topic;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false, length = 50)
    private QuestionType questionType;

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty_level", nullable = false, length = 50)
    private DifficultyLevel difficultyLevel;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal marks;

    @Column(name = "negative_marks", precision = 5, scale = 2)
    private BigDecimal negativeMarks;

    @Column(name = "solution_text", columnDefinition = "TEXT")
    private String solutionText;

    @Column(name = "solution_video_url", length = 500)
    private String solutionVideoUrl;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("optionOrder ASC")
    @Builder.Default
    private List<QuestionOption> options = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (uuid == null) {
            uuid = UUID.randomUUID();
        }
        if (isActive == null) {
            isActive = true;
        }
        if (questionType == null) {
            questionType = QuestionType.SINGLE_CHOICE;
        }
        if (difficultyLevel == null) {
            difficultyLevel = DifficultyLevel.MEDIUM;
        }
        if (marks == null) {
            marks = BigDecimal.ONE;
        }
        if (negativeMarks == null) {
            negativeMarks = new BigDecimal("0.25");
        }
    }

    // Helper methods
    public void addOption(QuestionOption option) {
        options.add(option);
        option.setQuestion(this);
    }

    public void removeOption(QuestionOption option) {
        options.remove(option);
        option.setQuestion(null);
    }
}
