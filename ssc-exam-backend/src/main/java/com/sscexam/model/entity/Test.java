package com.sscexam.model.entity;

import com.sscexam.model.enums.DifficultyLevel;
import com.sscexam.model.enums.TestType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "tests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Test {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, updatable = false)
    private UUID uuid;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, unique = true, length = 255)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "test_type", nullable = false, length = 50)
    private TestType testType;

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty_level", length = 50)
    private DifficultyLevel difficultyLevel;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "total_marks", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalMarks;

    @Column(name = "passing_marks", precision = 10, scale = 2)
    private BigDecimal passingMarks;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "is_premium", nullable = false)
    private Boolean isPremium;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "is_published", nullable = false)
    private Boolean isPublished;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @OneToMany(mappedBy = "test", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sectionOrder ASC")
    @Fetch(FetchMode.SUBSELECT)
    @Builder.Default
    private List<TestSection> sections = new ArrayList<>();

    @OneToMany(mappedBy = "test", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("questionOrder ASC")
    @Fetch(FetchMode.SUBSELECT)
    @Builder.Default
    private List<TestQuestion> testQuestions = new ArrayList<>();

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
        if (isPremium == null) {
            isPremium = false;
        }
        if (isActive == null) {
            isActive = true;
        }
        if (isPublished == null) {
            isPublished = false;
        }
        if (difficultyLevel == null) {
            difficultyLevel = DifficultyLevel.MEDIUM;
        }
    }

    // Helper methods
    public Integer getTotalQuestions() {
        return testQuestions != null ? testQuestions.size() : 0;
    }

    public void addSection(TestSection section) {
        sections.add(section);
        section.setTest(this);
    }

    public void removeSection(TestSection section) {
        sections.remove(section);
        section.setTest(null);
    }

    public void addQuestion(TestQuestion testQuestion) {
        testQuestions.add(testQuestion);
        testQuestion.setTest(this);
    }

    public void removeQuestion(TestQuestion testQuestion) {
        testQuestions.remove(testQuestion);
        testQuestion.setTest(null);
    }
}
