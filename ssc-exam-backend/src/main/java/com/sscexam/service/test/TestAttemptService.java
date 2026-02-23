package com.sscexam.service.test;

import com.sscexam.exception.ResourceNotFoundException;
import com.sscexam.exception.TestTimeExpiredException;
import com.sscexam.model.dto.*;
import com.sscexam.model.entity.*;
import com.sscexam.model.enums.QuestionType;
import com.sscexam.model.enums.TestAttemptStatus;
import com.sscexam.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TestAttemptService {

    private final UserTestAttemptRepository attemptRepository;
    private final UserTestResponseRepository responseRepository;
    private final TestRepository testRepository;
    private final TestQuestionRepository testQuestionRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final TestEvaluationService evaluationService;

    @Transactional
    public TestAttemptResponse startTest(Long testId, Long userId) {
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new ResourceNotFoundException("Test not found"));

        if (!test.getIsPublished()) {
            throw new IllegalStateException("Test is not published");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Get next attempt number
        Integer maxAttemptNumber = attemptRepository.findMaxAttemptNumber(userId, testId);
        Integer nextAttemptNumber = (maxAttemptNumber == null ? 0 : maxAttemptNumber) + 1;

        // Create new attempt
        UserTestAttempt attempt = UserTestAttempt.builder()
                .uuid(UUID.randomUUID())
                .user(user)
                .test(test)
                .attemptNumber(nextAttemptNumber)
                .status(TestAttemptStatus.IN_PROGRESS)
                .startedAt(LocalDateTime.now())
                .correctAnswers(0)
                .incorrectAnswers(0)
                .unanswered(test.getTotalQuestions())
                .build();

        attempt = attemptRepository.save(attempt);

        // Create empty responses for all questions
        List<TestQuestion> testQuestions = testQuestionRepository.findByTestIdOrderByQuestionOrder(testId);
        List<UserTestResponse> responses = new ArrayList<>();

        for (TestQuestion tq : testQuestions) {
            UserTestResponse response = UserTestResponse.builder()
                    .attempt(attempt)
                    .question(tq.getQuestion())
                    .isBookmarked(false)
                    .isMarkedForReview(false)
                    .build();
            responses.add(response);
        }

        responseRepository.saveAll(responses);

        log.info("Started test attempt - User: {}, Test: {}, Attempt: {}",
                userId, testId, attempt.getUuid());

        return mapToAttemptResponse(attempt, testQuestions, responses);
    }

    @Transactional
    public void saveAnswer(UUID attemptUuid, SubmitAnswerRequest request, Long userId) {
        UserTestAttempt attempt = attemptRepository.findByUuid(attemptUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Test attempt not found"));

        // Verify user owns this attempt
        if (!attempt.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Unauthorized access to test attempt");
        }

        // Verify attempt is still in progress
        if (attempt.getStatus() != TestAttemptStatus.IN_PROGRESS) {
            throw new IllegalStateException("Test attempt is not in progress");
        }

        // Validate time hasn't expired
        validateTimeNotExpired(attempt);

        // Find or create response
        UserTestResponse response = responseRepository
                .findByAttemptIdAndQuestionId(attempt.getId(), request.getQuestionId())
                .orElseGet(() -> {
                    Question question = questionRepository.findById(request.getQuestionId())
                            .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
                    return UserTestResponse.builder()
                            .attempt(attempt)
                            .question(question)
                            .build();
                });

        // Update response
        response.setSelectedOptionIds(request.getSelectedOptionIds());
        response.setNumericalAnswer(request.getNumericalAnswer());
        response.setIsBookmarked(request.getIsBookmarked() != null ? request.getIsBookmarked() : response.getIsBookmarked());
        response.setIsMarkedForReview(request.getIsMarkedForReview() != null ? request.getIsMarkedForReview() : response.getIsMarkedForReview());
        response.setTimeTakenSeconds(request.getTimeTakenSeconds());
        response.setAnsweredAt(LocalDateTime.now());

        responseRepository.save(response);

        log.info("Saved answer - Attempt: {}, Question: {}", attemptUuid, request.getQuestionId());
    }

    @Transactional(readOnly = true)
    public TestAttemptResponse getAttemptDetails(UUID attemptUuid, Long userId) {
        UserTestAttempt attempt = attemptRepository.findByUuidWithResponses(attemptUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Test attempt not found"));

        // Verify user owns this attempt
        if (!attempt.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Unauthorized access to test attempt");
        }

        List<TestQuestion> testQuestions = testQuestionRepository
                .findByTestIdOrderByQuestionOrder(attempt.getTest().getId());

        return mapToAttemptResponse(attempt, testQuestions, attempt.getResponses());
    }

    @Transactional
    public TestAttemptResponse submitTest(UUID attemptUuid, Long userId) {
        UserTestAttempt attempt = attemptRepository.findByUuidWithResponses(attemptUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Test attempt not found"));

        // Verify user owns this attempt
        if (!attempt.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Unauthorized access to test attempt");
        }

        // Verify attempt is still in progress
        if (attempt.getStatus() != TestAttemptStatus.IN_PROGRESS) {
            throw new IllegalStateException("Test attempt already submitted");
        }

        // Validate time (with 1 minute grace period)
        long elapsedSeconds = ChronoUnit.SECONDS.between(attempt.getStartedAt(), LocalDateTime.now());
        long allowedSeconds = attempt.getTest().getDurationMinutes() * 60L;

        if (elapsedSeconds > allowedSeconds + 60) {
            attempt.setStatus(TestAttemptStatus.EXPIRED);
        } else {
            attempt.setStatus(TestAttemptStatus.SUBMITTED);
        }

        attempt.setSubmittedAt(LocalDateTime.now());
        attempt.setTimeTakenSeconds((int) elapsedSeconds);

        attemptRepository.save(attempt);

        log.info("Submitted test - Attempt: {}, Status: {}", attemptUuid, attempt.getStatus());

        // Trigger evaluation
        if (attempt.getStatus() == TestAttemptStatus.SUBMITTED) {
            evaluationService.evaluateTest(attempt.getId());
        }

        List<TestQuestion> testQuestions = testQuestionRepository
                .findByTestIdOrderByQuestionOrder(attempt.getTest().getId());

        return mapToAttemptResponse(attempt, testQuestions, attempt.getResponses());
    }

    private void validateTimeNotExpired(UserTestAttempt attempt) {
        long elapsedSeconds = ChronoUnit.SECONDS.between(attempt.getStartedAt(), LocalDateTime.now());
        long allowedSeconds = attempt.getTest().getDurationMinutes() * 60L;

        // Allow 1 minute grace period for network delays
        if (elapsedSeconds > allowedSeconds + 60) {
            throw new TestTimeExpiredException("Test time has expired");
        }
    }

    private TestAttemptResponse mapToAttemptResponse(UserTestAttempt attempt,
                                                       List<TestQuestion> testQuestions,
                                                       List<UserTestResponse> responses) {
        // Create a map of question ID to response
        var responseMap = responses.stream()
                .collect(Collectors.toMap(
                        r -> r.getQuestion().getId(),
                        r -> r,
                        (r1, r2) -> r1
                ));

        // Map questions with responses
        List<QuestionAttemptResponse> questionResponses = testQuestions.stream()
                .map(tq -> {
                    Question q = tq.getQuestion();
                    UserTestResponse response = responseMap.get(q.getId());

                    return QuestionAttemptResponse.builder()
                            .id(q.getId())
                            .questionText(q.getQuestionText())
                            .questionType(q.getQuestionType())
                            .marks(tq.getMarks())
                            .negativeMarks(tq.getNegativeMarks())
                            .options(q.getOptions().stream()
                                    .map(opt -> OptionAttemptResponse.builder()
                                            .id(opt.getId())
                                            .optionText(opt.getOptionText())
                                            .optionOrder(opt.getOptionOrder())
                                            // Hide correct answer until submitted
                                            .isCorrect(attempt.getStatus() == TestAttemptStatus.SUBMITTED ?
                                                    opt.getIsCorrect() : null)
                                            .build())
                                    .sorted((o1, o2) -> o1.getOptionOrder().compareTo(o2.getOptionOrder()))
                                    .collect(Collectors.toList()))
                            .selectedOptionIds(response != null ? response.getSelectedOptionIds() : null)
                            .numericalAnswer(response != null ? response.getNumericalAnswer() : null)
                            .isCorrect(response != null ? response.getIsCorrect() : null)
                            .marksObtained(response != null ? response.getMarksObtained() : null)
                            .isBookmarked(response != null ? response.getIsBookmarked() : false)
                            .isMarkedForReview(response != null ? response.getIsMarkedForReview() : false)
                            .questionOrder(tq.getQuestionOrder())
                            // Show solution only after submission
                            .solutionText(attempt.getStatus() == TestAttemptStatus.SUBMITTED ?
                                    q.getSolutionText() : null)
                            .explanation(attempt.getStatus() == TestAttemptStatus.SUBMITTED ?
                                    q.getExplanation() : null)
                            .build();
                })
                .collect(Collectors.toList());

        return TestAttemptResponse.builder()
                .id(attempt.getId())
                .uuid(attempt.getUuid())
                .testId(attempt.getTest().getId())
                .testTitle(attempt.getTest().getTitle())
                .attemptNumber(attempt.getAttemptNumber())
                .status(attempt.getStatus())
                .startedAt(attempt.getStartedAt())
                .submittedAt(attempt.getSubmittedAt())
                .timeTakenSeconds(attempt.getTimeTakenSeconds())
                .totalScore(attempt.getTotalScore())
                .correctAnswers(attempt.getCorrectAnswers())
                .incorrectAnswers(attempt.getIncorrectAnswers())
                .unanswered(attempt.getUnanswered())
                .accuracyPercentage(attempt.getAccuracyPercentage())
                .percentile(attempt.getPercentile())
                .rank(attempt.getRank())
                .durationMinutes(attempt.getTest().getDurationMinutes())
                .totalQuestions(attempt.getTest().getTotalQuestions())
                .questions(questionResponses)
                .build();
    }
}
