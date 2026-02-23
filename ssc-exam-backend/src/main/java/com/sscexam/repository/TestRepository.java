package com.sscexam.repository;

import com.sscexam.model.entity.Test;
import com.sscexam.model.enums.DifficultyLevel;
import com.sscexam.model.enums.TestType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TestRepository extends JpaRepository<Test, Long> {

    @EntityGraph(attributePaths = {"testQuestions", "testQuestions.question"})
    Optional<Test> findBySlugAndIsActiveTrue(String slug);

    @EntityGraph(attributePaths = {"testQuestions"})
    Optional<Test> findByUuid(UUID uuid);

    Optional<Test> findByIdAndIsActiveTrue(Long id);

    Page<Test> findByIsActiveTrueAndIsPublishedTrueOrderByPublishedAtDesc(Pageable pageable);

    Page<Test> findByTestTypeAndIsActiveTrueAndIsPublishedTrueOrderByPublishedAtDesc(TestType testType, Pageable pageable);

    Page<Test> findByDifficultyLevelAndIsActiveTrueAndIsPublishedTrueOrderByPublishedAtDesc(DifficultyLevel difficultyLevel, Pageable pageable);

    @Query("SELECT t FROM Test t WHERE t.isActive = true AND t.isPublished = true " +
           "AND (:testType IS NULL OR t.testType = :testType) " +
           "AND (:difficultyLevel IS NULL OR t.difficultyLevel = :difficultyLevel) " +
           "AND (:isPremium IS NULL OR t.isPremium = :isPremium) " +
           "ORDER BY t.publishedAt DESC")
    Page<Test> findByFilters(
        @Param("testType") TestType testType,
        @Param("difficultyLevel") DifficultyLevel difficultyLevel,
        @Param("isPremium") Boolean isPremium,
        Pageable pageable
    );

    @Query("SELECT t FROM Test t WHERE t.isActive = true AND t.isPublished = true " +
           "AND LOWER(t.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "ORDER BY t.publishedAt DESC")
    Page<Test> searchByTitle(@Param("searchTerm") String searchTerm, Pageable pageable);

    Boolean existsBySlug(String slug);

    Long countByTestTypeAndIsActiveTrueAndIsPublishedTrue(TestType testType);

    Long countByIsActiveTrueAndIsPublishedTrue();

    // Admin queries
    Page<Test> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Test> findByIsPublishedFalseOrderByCreatedAtDesc(Pageable pageable);
}
