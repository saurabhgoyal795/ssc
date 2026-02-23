package com.sscexam.repository;

import com.sscexam.model.entity.Test;
import com.sscexam.model.entity.TestQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestQuestionRepository extends JpaRepository<TestQuestion, Long> {

    List<TestQuestion> findByTestOrderByQuestionOrderAsc(Test test);

    List<TestQuestion> findByTestIdOrderByQuestionOrder(Long testId);

    @Query("SELECT tq FROM TestQuestion tq JOIN FETCH tq.question q JOIN FETCH q.options " +
           "WHERE tq.test = :test ORDER BY tq.questionOrder ASC")
    List<TestQuestion> findByTestWithQuestionsAndOptions(@Param("test") Test test);

    Long countByTest(Test test);

    void deleteByTest(Test test);

    Boolean existsByTestAndQuestionId(Test test, Long questionId);
}
