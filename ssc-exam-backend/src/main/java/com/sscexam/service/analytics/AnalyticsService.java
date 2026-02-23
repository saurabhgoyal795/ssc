package com.sscexam.service.analytics;

import com.sscexam.model.dto.AnalyticsOverviewResponse;
import com.sscexam.model.dto.ProgressChartResponse;
import com.sscexam.model.entity.*;
import com.sscexam.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final UserSubjectAnalyticsRepository subjectAnalyticsRepository;
    private final UserTopicAnalyticsRepository topicAnalyticsRepository;
    private final DailyActivityLogRepository activityLogRepository;
    private final UserTestAttemptRepository attemptRepository;
    private final UserTestResponseRepository responseRepository;

    @Transactional
    public void updateAnalyticsAfterTest(Long attemptId) {
        UserTestAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        Long userId = attempt.getUser().getId();
        List<UserTestResponse> responses = responseRepository.findByAttemptId(attemptId);

        // Update subject analytics
        updateSubjectAnalytics(userId, responses);

        // Update topic analytics
        updateTopicAnalytics(userId, responses);

        // Update daily activity
        updateDailyActivity(userId, attempt, responses.size());

        log.info("Updated analytics for user: {}, attempt: {}", userId, attemptId);
    }

    private void updateSubjectAnalytics(Long userId, List<UserTestResponse> responses) {
        // Group responses by subject
        Map<Long, List<UserTestResponse>> bySubject = responses.stream()
                .filter(r -> r.getQuestion().getSubject() != null)
                .collect(Collectors.groupingBy(r -> r.getQuestion().getSubject().getId()));

        for (Map.Entry<Long, List<UserTestResponse>> entry : bySubject.entrySet()) {
            Long subjectId = entry.getKey();
            List<UserTestResponse> subjectResponses = entry.getValue();

            UserSubjectAnalytics analytics = subjectAnalyticsRepository
                    .findByUserIdAndSubjectId(userId, subjectId)
                    .orElseGet(() -> UserSubjectAnalytics.builder()
                            .user(subjectResponses.get(0).getAttempt().getUser())
                            .subject(subjectResponses.get(0).getQuestion().getSubject())
                            .build());

            int total = analytics.getTotalQuestionsAttempted() + subjectResponses.size();
            int correct = analytics.getCorrectAnswers() + (int) subjectResponses.stream()
                    .filter(r -> Boolean.TRUE.equals(r.getIsCorrect())).count();
            int incorrect = analytics.getIncorrectAnswers() + (int) subjectResponses.stream()
                    .filter(r -> Boolean.FALSE.equals(r.getIsCorrect())).count();

            analytics.setTotalQuestionsAttempted(total);
            analytics.setCorrectAnswers(correct);
            analytics.setIncorrectAnswers(incorrect);

            if (correct + incorrect > 0) {
                BigDecimal accuracy = BigDecimal.valueOf(correct * 100.0 / (correct + incorrect))
                        .setScale(2, RoundingMode.HALF_UP);
                analytics.setAccuracyPercentage(accuracy);
                analytics.setStrengthScore(accuracy); // Simple strength score for now
            }

            analytics.setLastAttemptedAt(LocalDateTime.now());
            subjectAnalyticsRepository.save(analytics);
        }
    }

    private void updateTopicAnalytics(Long userId, List<UserTestResponse> responses) {
        // Group responses by topic
        Map<Long, List<UserTestResponse>> byTopic = responses.stream()
                .filter(r -> r.getQuestion().getTopic() != null)
                .collect(Collectors.groupingBy(r -> r.getQuestion().getTopic().getId()));

        for (Map.Entry<Long, List<UserTestResponse>> entry : byTopic.entrySet()) {
            Long topicId = entry.getKey();
            List<UserTestResponse> topicResponses = entry.getValue();

            UserTopicAnalytics analytics = topicAnalyticsRepository
                    .findByUserIdAndTopicId(userId, topicId)
                    .orElseGet(() -> UserTopicAnalytics.builder()
                            .user(topicResponses.get(0).getAttempt().getUser())
                            .topic(topicResponses.get(0).getQuestion().getTopic())
                            .build());

            int total = analytics.getTotalQuestionsAttempted() + topicResponses.size();
            int correct = analytics.getCorrectAnswers() + (int) topicResponses.stream()
                    .filter(r -> Boolean.TRUE.equals(r.getIsCorrect())).count();
            int incorrect = analytics.getIncorrectAnswers() + (int) topicResponses.stream()
                    .filter(r -> Boolean.FALSE.equals(r.getIsCorrect())).count();

            analytics.setTotalQuestionsAttempted(total);
            analytics.setCorrectAnswers(correct);
            analytics.setIncorrectAnswers(incorrect);

            if (correct + incorrect > 0) {
                BigDecimal accuracy = BigDecimal.valueOf(correct * 100.0 / (correct + incorrect))
                        .setScale(2, RoundingMode.HALF_UP);
                analytics.setAccuracyPercentage(accuracy);
                analytics.setStrengthScore(accuracy);
            }

            analytics.setLastAttemptedAt(LocalDateTime.now());
            topicAnalyticsRepository.save(analytics);
        }
    }

    private void updateDailyActivity(Long userId, UserTestAttempt attempt, int questionsCount) {
        LocalDate today = LocalDate.now();

        DailyActivityLog activity = activityLogRepository
                .findByUserIdAndActivityDate(userId, today)
                .orElseGet(() -> DailyActivityLog.builder()
                        .user(attempt.getUser())
                        .activityDate(today)
                        .build());

        activity.setTestsTaken(activity.getTestsTaken() + 1);
        activity.setQuestionsAttempted(activity.getQuestionsAttempted() + questionsCount);

        if (attempt.getTimeTakenSeconds() != null) {
            int studyTime = attempt.getTimeTakenSeconds() / 60;
            activity.setStudyTimeMinutes(activity.getStudyTimeMinutes() + studyTime);
        }

        activityLogRepository.save(activity);
    }

    @Transactional(readOnly = true)
    public AnalyticsOverviewResponse getOverview(Long userId) {
        // Get overall stats
        List<UserTestAttempt> allAttempts = attemptRepository.findByUserIdOrderByCreatedAtDesc(userId,
                org.springframework.data.domain.PageRequest.of(0, 1000)).getContent();

        int totalTests = allAttempts.size();
        int totalQuestions = allAttempts.stream()
                .mapToInt(a -> (a.getCorrectAnswers() != null ? a.getCorrectAnswers() : 0) +
                        (a.getIncorrectAnswers() != null ? a.getIncorrectAnswers() : 0))
                .sum();
        int totalCorrect = allAttempts.stream()
                .mapToInt(a -> a.getCorrectAnswers() != null ? a.getCorrectAnswers() : 0)
                .sum();

        BigDecimal overallAccuracy = totalQuestions > 0
                ? BigDecimal.valueOf(totalCorrect * 100.0 / totalQuestions).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal avgScore = !allAttempts.isEmpty()
                ? allAttempts.stream()
                .filter(a -> a.getTotalScore() != null)
                .map(UserTestAttempt::getTotalScore)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(allAttempts.size()), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        Long studyTime = activityLogRepository.getTotalStudyTime(userId, LocalDate.now().minusMonths(1));

        AnalyticsOverviewResponse.OverallStats overallStats = AnalyticsOverviewResponse.OverallStats.builder()
                .totalTestsAttempted(totalTests)
                .totalQuestionsAttempted(totalQuestions)
                .totalCorrectAnswers(totalCorrect)
                .overallAccuracy(overallAccuracy)
                .averageScore(avgScore)
                .totalStudyTimeMinutes(studyTime != null ? studyTime.intValue() : 0)
                .currentStreak(calculateStreak(userId))
                .build();

        // Get subject performance
        List<AnalyticsOverviewResponse.SubjectPerformance> subjectPerformance =
                subjectAnalyticsRepository.findByUserId(userId).stream()
                        .map(sa -> AnalyticsOverviewResponse.SubjectPerformance.builder()
                                .subjectId(sa.getSubject().getId())
                                .subjectName(sa.getSubject().getName())
                                .totalQuestions(sa.getTotalQuestionsAttempted())
                                .correctAnswers(sa.getCorrectAnswers())
                                .accuracyPercentage(sa.getAccuracyPercentage())
                                .strengthScore(sa.getStrengthScore())
                                .build())
                        .collect(Collectors.toList());

        // Get recent activity
        List<DailyActivityLog> recentLogs = activityLogRepository
                .findByUserIdAndActivityDateBetweenOrderByActivityDateAsc(
                        userId, LocalDate.now().minusDays(7), LocalDate.now());

        List<AnalyticsOverviewResponse.RecentActivity> recentActivity = recentLogs.stream()
                .map(log -> AnalyticsOverviewResponse.RecentActivity.builder()
                        .date(log.getActivityDate().toString())
                        .testsAttempted(log.getTestsTaken())
                        .questionsAttempted(log.getQuestionsAttempted())
                        .studyTimeMinutes(log.getStudyTimeMinutes())
                        .build())
                .collect(Collectors.toList());

        // Get weak areas
        List<AnalyticsOverviewResponse.WeakArea> weakAreas = getWeakAreas(userId);

        return AnalyticsOverviewResponse.builder()
                .overallStats(overallStats)
                .subjectPerformance(subjectPerformance)
                .recentActivity(recentActivity)
                .weakAreas(weakAreas)
                .build();
    }

    private List<AnalyticsOverviewResponse.WeakArea> getWeakAreas(Long userId) {
        List<AnalyticsOverviewResponse.WeakArea> weakAreas = new ArrayList<>();

        // Get weak subjects (< 60% accuracy)
        List<UserSubjectAnalytics> weakSubjects = subjectAnalyticsRepository
                .findWeakSubjects(userId, BigDecimal.valueOf(60));

        weakSubjects.stream().limit(3).forEach(sa ->
                weakAreas.add(AnalyticsOverviewResponse.WeakArea.builder()
                        .type("SUBJECT")
                        .id(sa.getSubject().getId())
                        .name(sa.getSubject().getName())
                        .accuracyPercentage(sa.getAccuracyPercentage())
                        .recommendation("Practice more " + sa.getSubject().getName() + " questions")
                        .build())
        );

        // Get weak topics (< 60% accuracy)
        List<UserTopicAnalytics> weakTopics = topicAnalyticsRepository
                .findWeakTopics(userId, BigDecimal.valueOf(60));

        weakTopics.stream().limit(3).forEach(ta ->
                weakAreas.add(AnalyticsOverviewResponse.WeakArea.builder()
                        .type("TOPIC")
                        .id(ta.getTopic().getId())
                        .name(ta.getTopic().getName())
                        .accuracyPercentage(ta.getAccuracyPercentage())
                        .recommendation("Focus on " + ta.getTopic().getName() + " topic")
                        .build())
        );

        return weakAreas;
    }

    private Integer calculateStreak(Long userId) {
        List<DailyActivityLog> recentActivity = activityLogRepository.findRecentActivity(userId);
        int streak = 0;
        LocalDate currentDate = LocalDate.now();

        for (DailyActivityLog log : recentActivity) {
            if (log.getActivityDate().equals(currentDate) || log.getActivityDate().equals(currentDate.minusDays(1))) {
                streak++;
                currentDate = log.getActivityDate().minusDays(1);
            } else {
                break;
            }
        }

        return streak;
    }

    @Transactional(readOnly = true)
    public ProgressChartResponse getProgressChart(Long userId) {
        List<UserTestAttempt> attempts = attemptRepository
                .findByUserIdOrderByCreatedAtDesc(userId, org.springframework.data.domain.PageRequest.of(0, 30))
                .getContent();

        List<ProgressChartResponse.DataPoint> scoreProgress = new ArrayList<>();
        List<ProgressChartResponse.DataPoint> accuracyProgress = new ArrayList<>();

        for (int i = attempts.size() - 1; i >= 0; i--) {
            UserTestAttempt attempt = attempts.get(i);

            scoreProgress.add(ProgressChartResponse.DataPoint.builder()
                    .label("Test " + (attempts.size() - i))
                    .value(attempt.getTotalScore() != null ? attempt.getTotalScore() : BigDecimal.ZERO)
                    .build());

            accuracyProgress.add(ProgressChartResponse.DataPoint.builder()
                    .label("Test " + (attempts.size() - i))
                    .value(attempt.getAccuracyPercentage() != null ? attempt.getAccuracyPercentage() : BigDecimal.ZERO)
                    .build());
        }

        // Activity progress (last 7 days)
        List<DailyActivityLog> activityLogs = activityLogRepository
                .findByUserIdAndActivityDateBetweenOrderByActivityDateAsc(
                        userId, LocalDate.now().minusDays(6), LocalDate.now());

        List<ProgressChartResponse.DataPoint> activityProgress = activityLogs.stream()
                .map(log -> ProgressChartResponse.DataPoint.builder()
                        .label(log.getActivityDate().toString())
                        .value(BigDecimal.valueOf(log.getQuestionsAttempted()))
                        .build())
                .collect(Collectors.toList());

        return ProgressChartResponse.builder()
                .scoreProgress(scoreProgress)
                .accuracyProgress(accuracyProgress)
                .activityProgress(activityProgress)
                .build();
    }
}
