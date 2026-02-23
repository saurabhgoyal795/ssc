package com.sscexam.repository;

import com.sscexam.model.entity.Question;
import com.sscexam.model.entity.Subject;
import com.sscexam.model.entity.Topic;
import com.sscexam.model.enums.DifficultyLevel;
import com.sscexam.model.enums.QuestionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    @EntityGraph(attributePaths = {"options", "subject", "topic"})
    Optional<Question> findByUuid(UUID uuid);

    @EntityGraph(attributePaths = {"options", "subject", "topic"})
    Optional<Question> findByIdAndIsActiveTrue(Long id);

    Page<Question> findByIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);

    Page<Question> findBySubjectAndIsActiveTrueOrderByCreatedAtDesc(Subject subject, Pageable pageable);

    Page<Question> findByTopicAndIsActiveTrueOrderByCreatedAtDesc(Topic topic, Pageable pageable);

    Page<Question> findByDifficultyLevelAndIsActiveTrueOrderByCreatedAtDesc(DifficultyLevel difficultyLevel, Pageable pageable);

    Page<Question> findByQuestionTypeAndIsActiveTrueOrderByCreatedAtDesc(QuestionType questionType, Pageable pageable);

    @Query("SELECT q FROM Question q WHERE q.isActive = true " +
           "AND (:subjectId IS NULL OR q.subject.id = :subjectId) " +
           "AND (:topicId IS NULL OR q.topic.id = :topicId) " +
           "AND (:difficultyLevel IS NULL OR q.difficultyLevel = :difficultyLevel) " +
           "AND (:questionType IS NULL OR q.questionType = :questionType) " +
           "ORDER BY q.createdAt DESC")
    Page<Question> findByFilters(
        @Param("subjectId") Long subjectId,
        @Param("topicId") Long topicId,
        @Param("difficultyLevel") DifficultyLevel difficultyLevel,
        @Param("questionType") QuestionType questionType,
        Pageable pageable
    );

    @Query("SELECT q FROM Question q WHERE q.isActive = true " +
           "AND LOWER(q.questionText) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "ORDER BY q.createdAt DESC")
    Page<Question> searchByQuestionText(@Param("searchTerm") String searchTerm, Pageable pageable);

    Long countBySubjectAndIsActiveTrue(Subject subject);

    Long countByTopicAndIsActiveTrue(Topic topic);

    Long countByDifficultyLevelAndIsActiveTrue(DifficultyLevel difficultyLevel);

    @Query("SELECT q FROM Question q WHERE q.id IN :ids AND q.isActive = true")
    @EntityGraph(attributePaths = {"options"})
    List<Question> findByIdInAndIsActiveTrue(@Param("ids") List<Long> ids);
}
