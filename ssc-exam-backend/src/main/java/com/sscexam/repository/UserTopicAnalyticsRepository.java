package com.sscexam.repository;

import com.sscexam.model.entity.UserTopicAnalytics;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserTopicAnalyticsRepository extends JpaRepository<UserTopicAnalytics, Long> {

    @EntityGraph(attributePaths = {"topic", "topic.subject"})
    Optional<UserTopicAnalytics> findByUserIdAndTopicId(Long userId, Long topicId);

    @EntityGraph(attributePaths = {"topic", "topic.subject"})
    List<UserTopicAnalytics> findByUserId(Long userId);

    @EntityGraph(attributePaths = {"topic", "topic.subject"})
    List<UserTopicAnalytics> findByUserIdOrderByAccuracyPercentageAsc(Long userId);

    @Query("SELECT ta FROM UserTopicAnalytics ta WHERE ta.user.id = :userId " +
           "AND ta.accuracyPercentage < :threshold ORDER BY ta.accuracyPercentage ASC")
    @EntityGraph(attributePaths = {"topic", "topic.subject"})
    List<UserTopicAnalytics> findWeakTopics(@Param("userId") Long userId,
                                             @Param("threshold") java.math.BigDecimal threshold);

    @Query("SELECT ta FROM UserTopicAnalytics ta WHERE ta.user.id = :userId " +
           "AND ta.topic.subject.id = :subjectId")
    @EntityGraph(attributePaths = {"topic"})
    List<UserTopicAnalytics> findByUserIdAndSubjectId(@Param("userId") Long userId,
                                                        @Param("subjectId") Long subjectId);
}
