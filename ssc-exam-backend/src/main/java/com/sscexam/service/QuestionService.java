package com.sscexam.service;

import com.sscexam.exception.BadRequestException;
import com.sscexam.exception.ResourceNotFoundException;
import com.sscexam.model.dto.*;
import com.sscexam.model.entity.*;
import com.sscexam.model.enums.DifficultyLevel;
import com.sscexam.model.enums.QuestionType;
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

import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final SubjectRepository subjectRepository;
    private final TopicRepository topicRepository;
    private final UserRepository userRepository;

    @Transactional
    public QuestionResponse createQuestion(CreateQuestionRequest request) {
        // Validate subject
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", request.getSubjectId()));

        // Validate topic if provided
        Topic topic = null;
        if (request.getTopicId() != null) {
            topic = topicRepository.findById(request.getTopicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", request.getTopicId()));
        }

        // Validate at least one correct option for MCQ
        if (request.getQuestionType() != QuestionType.NUMERICAL) {
            long correctCount = request.getOptions().stream()
                    .filter(CreateQuestionOptionRequest::getIsCorrect)
                    .count();

            if (correctCount == 0) {
                throw new BadRequestException("At least one option must be marked as correct");
            }

            if (request.getQuestionType() == QuestionType.SINGLE_CHOICE && correctCount > 1) {
                throw new BadRequestException("Single choice questions can have only one correct option");
            }
        }

        // Get current user
        User createdBy = getCurrentUser();

        // Create question
        Question question = Question.builder()
                .uuid(UUID.randomUUID())
                .subject(subject)
                .topic(topic)
                .questionText(request.getQuestionText())
                .questionType(request.getQuestionType())
                .difficultyLevel(request.getDifficultyLevel())
                .marks(request.getMarks())
                .negativeMarks(request.getNegativeMarks())
                .solutionText(request.getSolutionText())
                .explanation(request.getExplanation())
                .createdBy(createdBy)
                .isActive(true)
                .build();

        // Add options
        for (CreateQuestionOptionRequest optionReq : request.getOptions()) {
            QuestionOption option = QuestionOption.builder()
                    .optionText(optionReq.getOptionText())
                    .optionOrder(optionReq.getOptionOrder())
                    .isCorrect(optionReq.getIsCorrect())
                    .build();
            question.addOption(option);
        }

        question = questionRepository.save(question);
        log.info("Question created with ID: {}", question.getId());

        return mapToResponse(question, true);
    }

    @Transactional
    public QuestionResponse updateQuestion(Long id, UpdateQuestionRequest request) {
        Question question = questionRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id", id));

        // Update fields if provided
        if (request.getTopicId() != null) {
            Topic topic = topicRepository.findById(request.getTopicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", request.getTopicId()));
            question.setTopic(topic);
        }

        if (request.getQuestionText() != null) {
            question.setQuestionText(request.getQuestionText());
        }

        if (request.getQuestionType() != null) {
            question.setQuestionType(request.getQuestionType());
        }

        if (request.getDifficultyLevel() != null) {
            question.setDifficultyLevel(request.getDifficultyLevel());
        }

        if (request.getMarks() != null) {
            question.setMarks(request.getMarks());
        }

        if (request.getNegativeMarks() != null) {
            question.setNegativeMarks(request.getNegativeMarks());
        }

        if (request.getSolutionText() != null) {
            question.setSolutionText(request.getSolutionText());
        }

        if (request.getExplanation() != null) {
            question.setExplanation(request.getExplanation());
        }

        // Update options if provided
        if (request.getOptions() != null && !request.getOptions().isEmpty()) {
            // Remove old options
            question.getOptions().clear();

            // Add new options
            for (CreateQuestionOptionRequest optionReq : request.getOptions()) {
                QuestionOption option = QuestionOption.builder()
                        .optionText(optionReq.getOptionText())
                        .optionOrder(optionReq.getOptionOrder())
                        .isCorrect(optionReq.getIsCorrect())
                        .build();
                question.addOption(option);
            }
        }

        question = questionRepository.save(question);
        log.info("Question updated with ID: {}", question.getId());

        return mapToResponse(question, true);
    }

    @Transactional
    public void deleteQuestion(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id", id));

        question.setIsActive(false);
        questionRepository.save(question);
        log.info("Question soft deleted with ID: {}", id);
    }

    @Transactional(readOnly = true)
    public QuestionResponse getQuestionById(Long id, boolean includeCorrectAnswers) {
        Question question = questionRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id", id));

        return mapToResponse(question, includeCorrectAnswers);
    }

    @Transactional(readOnly = true)
    public QuestionResponse getQuestionByUuid(UUID uuid, boolean includeCorrectAnswers) {
        Question question = questionRepository.findByUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Question", "uuid", uuid));

        if (!question.getIsActive()) {
            throw new ResourceNotFoundException("Question", "uuid", uuid);
        }

        return mapToResponse(question, includeCorrectAnswers);
    }

    @Transactional(readOnly = true)
    public Page<QuestionResponse> getAllQuestions(Pageable pageable, boolean includeCorrectAnswers) {
        Page<Question> questions = questionRepository.findByIsActiveTrueOrderByCreatedAtDesc(pageable);
        return questions.map(q -> mapToResponse(q, includeCorrectAnswers));
    }

    @Transactional(readOnly = true)
    public Page<QuestionResponse> getQuestionsByFilters(
            Long subjectId,
            Long topicId,
            DifficultyLevel difficultyLevel,
            QuestionType questionType,
            Pageable pageable,
            boolean includeCorrectAnswers
    ) {
        Page<Question> questions = questionRepository.findByFilters(
                subjectId, topicId, difficultyLevel, questionType, pageable
        );
        return questions.map(q -> mapToResponse(q, includeCorrectAnswers));
    }

    @Transactional(readOnly = true)
    public Page<QuestionResponse> searchQuestions(String searchTerm, Pageable pageable, boolean includeCorrectAnswers) {
        Page<Question> questions = questionRepository.searchByQuestionText(searchTerm, pageable);
        return questions.map(q -> mapToResponse(q, includeCorrectAnswers));
    }

    private QuestionResponse mapToResponse(Question question, boolean includeCorrectAnswers) {
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
                .solutionText(question.getSolutionText())
                .explanation(question.getExplanation())
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
