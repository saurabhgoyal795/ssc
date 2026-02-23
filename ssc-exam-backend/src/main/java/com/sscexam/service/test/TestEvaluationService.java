package com.sscexam.service.test;

import com.sscexam.exception.ResourceNotFoundException;
import com.sscexam.model.dto.TestResultResponse;
import com.sscexam.model.entity.*;
import com.sscexam.model.enums.QuestionType;
import com.sscexam.model.enums.TestAttemptStatus;
import com.sscexam.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TestEvaluationService {

    private final UserTestAttemptRepository attemptRepository;
    private final UserTestResponseRepository responseRepository;
    private final TestQuestionRepository testQuestionRepository;

    @Transactional
    public void evaluateTest(Long attemptId) {
        UserTestAttempt attempt = attemptRepository.findByUuidWithResponses(
                attemptRepository.findById(attemptId)
                        .orElseThrow(() -> new ResourceNotFoundException("Test attempt not found"))
                        .getUuid()
        ).orElseThrow(() -> new ResourceNotFoundException("Test attempt not found"));

        if (attempt.getStatus() != TestAttemptStatus.SUBMITTED) {
            log.warn("Cannot evaluate test - Status: {}", attempt.getStatus());
            return;
        }

        List<UserTestResponse> responses = attempt.getResponses();
        List<TestQuestion> testQuestions = testQuestionRepository
                .findByTestIdOrderByQuestionOrder(attempt.getTest().getId());

        int correctCount = 0;
        int incorrectCount = 0;
        int unansweredCount = 0;
        BigDecimal totalScore = BigDecimal.ZERO;

        // Evaluate each response
        for (UserTestResponse response : responses) {
            TestQuestion tq = testQuestions.stream()
                    .filter(q -> q.getQuestion().getId().equals(response.getQuestion().getId()))
                    .findFirst()
                    .orElse(null);

            if (tq == null) {
                continue;
            }

            boolean isAnswered = isResponseAnswered(response);

            if (!isAnswered) {
                unansweredCount++;
                response.setIsCorrect(false);
                response.setMarksObtained(BigDecimal.ZERO);
            } else {
                boolean isCorrect = checkAnswer(response);
                response.setIsCorrect(isCorrect);

                if (isCorrect) {
                    correctCount++;
                    response.setMarksObtained(tq.getMarks());
                    totalScore = totalScore.add(tq.getMarks());
                } else {
                    incorrectCount++;
                    BigDecimal negativeMarks = tq.getNegativeMarks() != null ?
                            tq.getNegativeMarks() : BigDecimal.ZERO;
                    response.setMarksObtained(negativeMarks.negate());
                    totalScore = totalScore.subtract(negativeMarks);
                }
            }

            responseRepository.save(response);
        }

        // Update attempt with results
        attempt.setCorrectAnswers(correctCount);
        attempt.setIncorrectAnswers(incorrectCount);
        attempt.setUnanswered(unansweredCount);
        attempt.setTotalScore(totalScore);

        // Calculate accuracy
        int totalAnswered = correctCount + incorrectCount;
        if (totalAnswered > 0) {
            BigDecimal accuracy = BigDecimal.valueOf(correctCount)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(totalAnswered), 2, RoundingMode.HALF_UP);
            attempt.setAccuracyPercentage(accuracy);
        }

        // Calculate rank and percentile
        calculateRankAndPercentile(attempt);

        attemptRepository.save(attempt);

        log.info("Evaluated test - Attempt: {}, Score: {}/{}, Correct: {}, Incorrect: {}, Unanswered: {}",
                attempt.getUuid(), totalScore, attempt.getTest().getTotalMarks(),
                correctCount, incorrectCount, unansweredCount);
    }

    @Transactional(readOnly = true)
    public TestResultResponse getTestResult(UUID attemptUuid, Long userId) {
        UserTestAttempt attempt = attemptRepository.findByUuid(attemptUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Test attempt not found"));

        // Verify user owns this attempt
        if (!attempt.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Unauthorized access to test result");
        }

        if (attempt.getStatus() != TestAttemptStatus.SUBMITTED) {
            throw new IllegalStateException("Test has not been submitted yet");
        }

        Long totalAttempts = attemptRepository.countSubmittedAttempts(attempt.getTest().getId());

        String performanceSummary = generatePerformanceSummary(attempt);

        return TestResultResponse.builder()
                .attemptUuid(attempt.getUuid())
                .testTitle(attempt.getTest().getTitle())
                .submittedAt(attempt.getSubmittedAt())
                .timeTakenSeconds(attempt.getTimeTakenSeconds())
                .totalScore(attempt.getTotalScore())
                .maxScore(attempt.getTest().getTotalMarks())
                .correctAnswers(attempt.getCorrectAnswers())
                .incorrectAnswers(attempt.getIncorrectAnswers())
                .unanswered(attempt.getUnanswered())
                .accuracyPercentage(attempt.getAccuracyPercentage())
                .percentile(attempt.getPercentile())
                .rank(attempt.getRank())
                .totalAttempts(totalAttempts.intValue())
                .performanceSummary(performanceSummary)
                .build();
    }

    private boolean isResponseAnswered(UserTestResponse response) {
        if (response.getQuestion().getQuestionType() == QuestionType.NUMERICAL) {
            return response.getNumericalAnswer() != null;
        } else {
            return response.getSelectedOptionIds() != null &&
                    response.getSelectedOptionIds().length > 0;
        }
    }

    private boolean checkAnswer(UserTestResponse response) {
        Question question = response.getQuestion();

        if (question.getQuestionType() == QuestionType.NUMERICAL) {
            // For numerical questions, compare the answer with tolerance
            if (response.getNumericalAnswer() == null) {
                return false;
            }
            // Find the correct answer from options (stored in first correct option)
            BigDecimal correctAnswer = question.getOptions().stream()
                    .filter(QuestionOption::getIsCorrect)
                    .map(opt -> new BigDecimal(opt.getOptionText()))
                    .findFirst()
                    .orElse(null);

            if (correctAnswer == null) {
                return false;
            }

            // Allow small tolerance for floating point comparison
            BigDecimal diff = response.getNumericalAnswer().subtract(correctAnswer).abs();
            return diff.compareTo(BigDecimal.valueOf(0.01)) < 0;
        } else {
            // For MCQs, check if selected options match correct options
            Long[] correctOptionIds = question.getOptions().stream()
                    .filter(QuestionOption::getIsCorrect)
                    .map(QuestionOption::getId)
                    .sorted()
                    .toArray(Long[]::new);

            Long[] selectedOptionIds = response.getSelectedOptionIds();
            if (selectedOptionIds == null || selectedOptionIds.length == 0) {
                return false;
            }

            Arrays.sort(selectedOptionIds);

            return Arrays.equals(correctOptionIds, selectedOptionIds);
        }
    }

    private void calculateRankAndPercentile(UserTestAttempt attempt) {
        // Get all submitted attempts for this test, ordered by score descending
        List<UserTestAttempt> allAttempts = attemptRepository
                .findByTestIdAndStatusSubmittedOrderByScoreDesc(attempt.getTest().getId());

        if (allAttempts.isEmpty()) {
            attempt.setRank(1);
            attempt.setPercentile(BigDecimal.valueOf(100));
            return;
        }

        // Find rank
        int rank = 1;
        for (int i = 0; i < allAttempts.size(); i++) {
            if (allAttempts.get(i).getId().equals(attempt.getId())) {
                rank = i + 1;
                break;
            }
        }
        attempt.setRank(rank);

        // Calculate percentile
        int totalAttempts = allAttempts.size();
        int attemptsBelowOrEqual = totalAttempts - rank + 1;
        BigDecimal percentile = BigDecimal.valueOf(attemptsBelowOrEqual)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(totalAttempts), 2, RoundingMode.HALF_UP);
        attempt.setPercentile(percentile);
    }

    private String generatePerformanceSummary(UserTestAttempt attempt) {
        BigDecimal accuracy = attempt.getAccuracyPercentage() != null ?
                attempt.getAccuracyPercentage() : BigDecimal.ZERO;

        if (accuracy.compareTo(BigDecimal.valueOf(80)) >= 0) {
            return "Excellent performance! You're well prepared for the exam.";
        } else if (accuracy.compareTo(BigDecimal.valueOf(60)) >= 0) {
            return "Good effort! Focus on your weak areas to improve further.";
        } else if (accuracy.compareTo(BigDecimal.valueOf(40)) >= 0) {
            return "Average performance. More practice needed in key topics.";
        } else {
            return "Needs improvement. Strengthen your fundamentals and practice regularly.";
        }
    }
}
