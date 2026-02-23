package com.sscexam.repository;

import com.sscexam.model.entity.Test;
import com.sscexam.model.entity.TestSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestSectionRepository extends JpaRepository<TestSection, Long> {

    List<TestSection> findByTestOrderBySectionOrderAsc(Test test);

    void deleteByTest(Test test);
}
