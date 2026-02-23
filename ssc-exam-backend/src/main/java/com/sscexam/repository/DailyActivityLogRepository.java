package com.sscexam.repository;

import com.sscexam.model.entity.DailyActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyActivityLogRepository extends JpaRepository<DailyActivityLog, Long> {

    Optional<DailyActivityLog> findByUserIdAndActivityDate(Long userId, LocalDate activityDate);

    List<DailyActivityLog> findByUserIdAndActivityDateBetweenOrderByActivityDateAsc(
            Long userId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT dal FROM DailyActivityLog dal WHERE dal.user.id = :userId " +
           "ORDER BY dal.activityDate DESC")
    List<DailyActivityLog> findRecentActivity(@Param("userId") Long userId);

    @Query("SELECT SUM(dal.studyTimeMinutes) FROM DailyActivityLog dal " +
           "WHERE dal.user.id = :userId AND dal.activityDate >= :startDate")
    Long getTotalStudyTime(@Param("userId") Long userId, @Param("startDate") LocalDate startDate);

    @Query("SELECT SUM(dal.questionsAttempted) FROM DailyActivityLog dal " +
           "WHERE dal.user.id = :userId AND dal.activityDate >= :startDate")
    Long getTotalQuestionsAttempted(@Param("userId") Long userId, @Param("startDate") LocalDate startDate);
}
