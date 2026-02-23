package com.sscexam.repository;

import com.sscexam.model.entity.UserTestResponse;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserTestResponseRepository extends JpaRepository<UserTestResponse, Long> {

    @EntityGraph(attributePaths = {"question", "question.options"})
    List<UserTestResponse> findByAttemptId(Long attemptId);

    @EntityGraph(attributePaths = {"question", "question.options"})
    Optional<UserTestResponse> findByAttemptIdAndQuestionId(Long attemptId, Long questionId);

    @Query("SELECT COUNT(r) FROM UserTestResponse r WHERE r.attempt.id = :attemptId " +
           "AND r.selectedOptionIds IS NOT NULL OR r.numericalAnswer IS NOT NULL")
    Long countAnsweredQuestions(@Param("attemptId") Long attemptId);

    @Query("SELECT r FROM UserTestResponse r WHERE r.attempt.id = :attemptId " +
           "AND r.isBookmarked = true")
    List<UserTestResponse> findBookmarkedByAttemptId(@Param("attemptId") Long attemptId);

    @Query("SELECT r FROM UserTestResponse r WHERE r.attempt.id = :attemptId " +
           "AND r.isMarkedForReview = true")
    List<UserTestResponse> findMarkedForReviewByAttemptId(@Param("attemptId") Long attemptId);
}
