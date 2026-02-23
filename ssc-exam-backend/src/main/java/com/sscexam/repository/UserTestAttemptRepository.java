package com.sscexam.repository;

import com.sscexam.model.entity.UserTestAttempt;
import com.sscexam.model.enums.TestAttemptStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserTestAttemptRepository extends JpaRepository<UserTestAttempt, Long> {

    @EntityGraph(attributePaths = {"user", "test"})
    Optional<UserTestAttempt> findByUuid(UUID uuid);

    @Query("SELECT a FROM UserTestAttempt a WHERE a.uuid = :uuid")
    @EntityGraph(attributePaths = {"user", "test", "responses", "responses.question"})
    Optional<UserTestAttempt> findByUuidWithResponses(@Param("uuid") UUID uuid);

    @Query("SELECT COALESCE(MAX(a.attemptNumber), 0) FROM UserTestAttempt a " +
           "WHERE a.user.id = :userId AND a.test.id = :testId")
    Integer findMaxAttemptNumber(@Param("userId") Long userId, @Param("testId") Long testId);

    @EntityGraph(attributePaths = {"test"})
    Page<UserTestAttempt> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"test"})
    List<UserTestAttempt> findByUserIdAndTestId(Long userId, Long testId);

    @Query("SELECT a FROM UserTestAttempt a WHERE a.status = :status " +
           "AND a.startedAt < :expiryTime")
    List<UserTestAttempt> findExpiredAttempts(@Param("status") TestAttemptStatus status,
                                               @Param("expiryTime") LocalDateTime expiryTime);

    @Query("SELECT COUNT(a) FROM UserTestAttempt a WHERE a.test.id = :testId " +
           "AND a.status = 'SUBMITTED'")
    Long countSubmittedAttempts(@Param("testId") Long testId);

    @Query("SELECT a FROM UserTestAttempt a WHERE a.test.id = :testId " +
           "AND a.status = 'SUBMITTED' ORDER BY a.totalScore DESC")
    List<UserTestAttempt> findByTestIdAndStatusSubmittedOrderByScoreDesc(@Param("testId") Long testId);
}
