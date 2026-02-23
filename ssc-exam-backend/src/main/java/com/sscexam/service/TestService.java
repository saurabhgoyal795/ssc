package com.sscexam.service;

import com.sscexam.exception.BadRequestException;
import com.sscexam.exception.ResourceNotFoundException;
import com.sscexam.model.dto.*;
import com.sscexam.model.entity.*;
import com.sscexam.model.enums.DifficultyLevel;
import com.sscexam.model.enums.TestType;
import com.sscexam.repository.*;
import com.sscexam.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TestService {

    private final TestRepository testRepository;
    private final QuestionRepository questionRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final TestSectionRepository testSectionRepository;
    private final TestQuestionRepository testQuestionRepository;

    @Transactional
    public TestResponse createTest(CreateTestRequest request) {
        // Validate slug uniqueness
        if (testRepository.existsBySlug(request.getSlug())) {
            throw new BadRequestException("Test with slug '" + request.getSlug() + "' already exists");
        }

        // Validate questions exist
        List<Question> questions = questionRepository.findByIdInAndIsActiveTrue(request.getQuestionIds());
        if (questions.size() != request.getQuestionIds().size()) {
            throw new BadRequestException("Some questions not found or inactive");
        }

        // Get current user
        User createdBy = getCurrentUser();

        // Create test
        Test test = Test.builder()
                .uuid(UUID.randomUUID())
                .title(request.getTitle())
                .slug(request.getSlug())
                .description(request.getDescription())
                .testType(request.getTestType())
                .difficultyLevel(request.getDifficultyLevel())
                .durationMinutes(request.getDurationMinutes())
                .totalMarks(request.getTotalMarks())
                .passingMarks(request.getPassingMarks())
                .instructions(request.getInstructions())
                .isPremium(request.getIsPremium() != null ? request.getIsPremium() : false)
                .isActive(true)
                .isPublished(false)
                .createdBy(createdBy)
                .build();

        test = testRepository.save(test);

        // Create sections if provided
        if (request.getSections() != null && !request.getSections().isEmpty()) {
            for (CreateTestSectionRequest sectionReq : request.getSections()) {
                Subject subject = subjectRepository.findById(sectionReq.getSubjectId())
                        .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", sectionReq.getSubjectId()));

                TestSection section = TestSection.builder()
                        .test(test)
                        .subject(subject)
                        .sectionName(sectionReq.getSectionName())
                        .sectionOrder(sectionReq.getSectionOrder())
                        .durationMinutes(sectionReq.getDurationMinutes())
                        .totalMarks(sectionReq.getTotalMarks())
                        .instructions(sectionReq.getInstructions())
                        .build();

                test.addSection(section);
            }
        }

        // Add questions to test
        int order = 1;
        for (Long questionId : request.getQuestionIds()) {
            Question question = questions.stream()
                    .filter(q -> q.getId().equals(questionId))
                    .findFirst()
                    .orElseThrow();

            TestQuestion testQuestion = TestQuestion.builder()
                    .test(test)
                    .question(question)
                    .questionOrder(order++)
                    .marks(question.getMarks())
                    .negativeMarks(question.getNegativeMarks())
                    .build();

            test.addQuestion(testQuestion);
        }

        test = testRepository.save(test);
        log.info("Test created with ID: {}, slug: {}", test.getId(), test.getSlug());

        return mapToResponse(test);
    }

    @Transactional
    public TestResponse updateTest(Long id, CreateTestRequest request) {
        Test test = testRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test", "id", id));

        // Check slug uniqueness if changed
        if (!test.getSlug().equals(request.getSlug()) && testRepository.existsBySlug(request.getSlug())) {
            throw new BadRequestException("Test with slug '" + request.getSlug() + "' already exists");
        }

        // Update basic fields
        test.setTitle(request.getTitle());
        test.setSlug(request.getSlug());
        test.setDescription(request.getDescription());
        test.setTestType(request.getTestType());
        test.setDifficultyLevel(request.getDifficultyLevel());
        test.setDurationMinutes(request.getDurationMinutes());
        test.setTotalMarks(request.getTotalMarks());
        test.setPassingMarks(request.getPassingMarks());
        test.setInstructions(request.getInstructions());
        if (request.getIsPremium() != null) {
            test.setIsPremium(request.getIsPremium());
        }

        // Clear and recreate sections
        if (request.getSections() != null) {
            testSectionRepository.deleteByTest(test);
            test.getSections().clear();

            for (CreateTestSectionRequest sectionReq : request.getSections()) {
                Subject subject = subjectRepository.findById(sectionReq.getSubjectId())
                        .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", sectionReq.getSubjectId()));

                TestSection section = TestSection.builder()
                        .test(test)
                        .subject(subject)
                        .sectionName(sectionReq.getSectionName())
                        .sectionOrder(sectionReq.getSectionOrder())
                        .durationMinutes(sectionReq.getDurationMinutes())
                        .totalMarks(sectionReq.getTotalMarks())
                        .instructions(sectionReq.getInstructions())
                        .build();

                test.addSection(section);
            }
        }

        // Clear and recreate questions
        if (request.getQuestionIds() != null) {
            testQuestionRepository.deleteByTest(test);
            test.getTestQuestions().clear();

            List<Question> questions = questionRepository.findByIdInAndIsActiveTrue(request.getQuestionIds());
            if (questions.size() != request.getQuestionIds().size()) {
                throw new BadRequestException("Some questions not found or inactive");
            }

            int order = 1;
            for (Long questionId : request.getQuestionIds()) {
                Question question = questions.stream()
                        .filter(q -> q.getId().equals(questionId))
                        .findFirst()
                        .orElseThrow();

                TestQuestion testQuestion = TestQuestion.builder()
                        .test(test)
                        .question(question)
                        .questionOrder(order++)
                        .marks(question.getMarks())
                        .negativeMarks(question.getNegativeMarks())
                        .build();

                test.addQuestion(testQuestion);
            }
        }

        test = testRepository.save(test);
        log.info("Test updated with ID: {}", test.getId());

        return mapToResponse(test);
    }

    @Transactional
    public void deleteTest(Long id) {
        Test test = testRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test", "id", id));

        test.setIsActive(false);
        testRepository.save(test);
        log.info("Test soft deleted with ID: {}", id);
    }

    @Transactional
    public TestResponse publishTest(Long id) {
        Test test = testRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test", "id", id));

        if (test.getTestQuestions().isEmpty()) {
            throw new BadRequestException("Cannot publish test without questions");
        }

        test.setIsPublished(true);
        test.setPublishedAt(LocalDateTime.now());
        test = testRepository.save(test);
        log.info("Test published with ID: {}", id);

        return mapToResponse(test);
    }

    @Transactional
    public TestResponse unpublishTest(Long id) {
        Test test = testRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test", "id", id));

        test.setIsPublished(false);
        test = testRepository.save(test);
        log.info("Test unpublished with ID: {}", id);

        return mapToResponse(test);
    }

    @Transactional(readOnly = true)
    public TestResponse getTestById(Long id) {
        Test test = testRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test", "id", id));

        return mapToResponse(test);
    }

    @Transactional(readOnly = true)
    public TestResponse getTestBySlug(String slug) {
        Test test = testRepository.findBySlugAndIsActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Test", "slug", slug));

        if (!test.getIsPublished()) {
            throw new ResourceNotFoundException("Test", "slug", slug);
        }

        return mapToResponse(test);
    }

    @Transactional(readOnly = true)
    public TestDetailResponse getTestDetails(String slug, boolean includeCorrectAnswers) {
        Test test = testRepository.findBySlugAndIsActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Test", "slug", slug));

        if (!test.getIsPublished()) {
            throw new ResourceNotFoundException("Test", "slug", slug);
        }

        TestResponse testResponse = mapToResponse(test);

        // Get questions with options
        List<TestQuestion> testQuestions = testQuestionRepository.findByTestWithQuestionsAndOptions(test);
        List<QuestionResponse> questions = testQuestions.stream()
                .map(tq -> mapQuestionToResponse(tq.getQuestion(), includeCorrectAnswers))
                .collect(Collectors.toList());

        return TestDetailResponse.builder()
                .test(testResponse)
                .questions(questions)
                .build();
    }

    @Transactional(readOnly = true)
    public Page<TestResponse> getAllTests(Pageable pageable) {
        Page<Test> tests = testRepository.findByIsActiveTrueAndIsPublishedTrueOrderByPublishedAtDesc(pageable);
        return tests.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<TestResponse> getTestsByFilters(
            TestType testType,
            DifficultyLevel difficultyLevel,
            Boolean isPremium,
            Pageable pageable
    ) {
        Page<Test> tests = testRepository.findByFilters(testType, difficultyLevel, isPremium, pageable);
        return tests.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<TestResponse> searchTests(String searchTerm, Pageable pageable) {
        Page<Test> tests = testRepository.searchByTitle(searchTerm, pageable);
        return tests.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<TestResponse> getAllTestsAdmin(Pageable pageable) {
        Page<Test> tests = testRepository.findAllByOrderByCreatedAtDesc(pageable);
        return tests.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<TestResponse> getDraftTests(Pageable pageable) {
        Page<Test> tests = testRepository.findByIsPublishedFalseOrderByCreatedAtDesc(pageable);
        return tests.map(this::mapToResponse);
    }

    private TestResponse mapToResponse(Test test) {
        List<TestSectionDto> sectionDtos = test.getSections().stream()
                .map(section -> TestSectionDto.builder()
                        .id(section.getId())
                        .subjectId(section.getSubject().getId())
                        .subjectName(section.getSubject().getName())
                        .sectionName(section.getSectionName())
                        .sectionOrder(section.getSectionOrder())
                        .durationMinutes(section.getDurationMinutes())
                        .totalMarks(section.getTotalMarks())
                        .instructions(section.getInstructions())
                        .build())
                .collect(Collectors.toList());

        return TestResponse.builder()
                .id(test.getId())
                .uuid(test.getUuid())
                .title(test.getTitle())
                .slug(test.getSlug())
                .description(test.getDescription())
                .testType(test.getTestType())
                .difficultyLevel(test.getDifficultyLevel())
                .durationMinutes(test.getDurationMinutes())
                .totalMarks(test.getTotalMarks())
                .passingMarks(test.getPassingMarks())
                .instructions(test.getInstructions())
                .isPremium(test.getIsPremium())
                .isPublished(test.getIsPublished())
                .publishedAt(test.getPublishedAt())
                .totalQuestions(test.getTestQuestions().size())
                .sections(sectionDtos)
                .createdAt(test.getCreatedAt())
                .build();
    }

    private QuestionResponse mapQuestionToResponse(Question question, boolean includeCorrectAnswers) {
        return QuestionResponse.builder()
                .id(question.getId())
                .uuid(question.getUuid())
                .subjectId(question.getSubject().getId())
                .subjectName(question.getSubject().getName())
                .topicId(question.getTopic() != null ? question.getTopic().getId() : null)
                .topicName(question.getTopic() != null ? question.getTopic().getName() : null)
                .questionText(question.getQuestionText())
                .questionType(question.getQuestionType())
                .difficultyLevel(question.getDifficultyLevel())
                .marks(question.getMarks())
                .negativeMarks(question.getNegativeMarks())
                .solutionText(includeCorrectAnswers ? question.getSolutionText() : null)
                .explanation(includeCorrectAnswers ? question.getExplanation() : null)
                .options(question.getOptions().stream()
                        .map(option -> QuestionOptionDto.builder()
                                .id(option.getId())
                                .optionText(option.getOptionText())
                                .optionOrder(option.getOptionOrder())
                                .isCorrect(includeCorrectAnswers ? option.getIsCorrect() : null)
                                .build())
                        .collect(Collectors.toList()))
                .createdAt(question.getCreatedAt())
                .build();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            return userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));
        }
        return null;
    }
}
