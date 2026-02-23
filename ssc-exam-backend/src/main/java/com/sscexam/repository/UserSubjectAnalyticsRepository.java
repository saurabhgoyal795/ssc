package com.sscexam.repository;

import com.sscexam.model.entity.UserSubjectAnalytics;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSubjectAnalyticsRepository extends JpaRepository<UserSubjectAnalytics, Long> {

    @EntityGraph(attributePaths = {"subject"})
    Optional<UserSubjectAnalytics> findByUserIdAndSubjectId(Long userId, Long subjectId);

    @EntityGraph(attributePaths = {"subject"})
    List<UserSubjectAnalytics> findByUserId(Long userId);

    @EntityGraph(attributePaths = {"subject"})
    List<UserSubjectAnalytics> findByUserIdOrderByAccuracyPercentageAsc(Long userId);

    @Query("SELECT sa FROM UserSubjectAnalytics sa WHERE sa.user.id = :userId " +
           "AND sa.accuracyPercentage < :threshold ORDER BY sa.accuracyPercentage ASC")
    @EntityGraph(attributePaths = {"subject"})
    List<UserSubjectAnalytics> findWeakSubjects(@Param("userId") Long userId,
                                                 @Param("threshold") java.math.BigDecimal threshold);

    @Query("SELECT sa FROM UserSubjectAnalytics sa WHERE sa.user.id = :userId " +
           "ORDER BY sa.strengthScore DESC")
    @EntityGraph(attributePaths = {"subject"})
    List<UserSubjectAnalytics> findStrongestSubjects(@Param("userId") Long userId);
}
