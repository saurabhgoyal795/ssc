package com.sscexam.repository;

import com.sscexam.model.entity.Subject;
import com.sscexam.model.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {

    Optional<Topic> findBySlugAndSubject(String slug, Subject subject);

    List<Topic> findBySubjectAndIsActiveTrueOrderByDisplayOrderAsc(Subject subject);

    List<Topic> findByParentTopicAndIsActiveTrueOrderByDisplayOrderAsc(Topic parentTopic);

    List<Topic> findBySubjectAndParentTopicIsNullAndIsActiveTrueOrderByDisplayOrderAsc(Subject subject);

    Boolean existsBySlugAndSubject(String slug, Subject subject);
}
