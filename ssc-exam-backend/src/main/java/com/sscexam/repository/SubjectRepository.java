package com.sscexam.repository;

import com.sscexam.model.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {

    Optional<Subject> findBySlug(String slug);

    List<Subject> findByIsActiveTrueOrderByDisplayOrderAsc();

    Boolean existsByName(String name);

    Boolean existsBySlug(String slug);
}
