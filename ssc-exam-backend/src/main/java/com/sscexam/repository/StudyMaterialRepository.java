package com.sscexam.repository;

import com.sscexam.model.entity.StudyMaterial;
import com.sscexam.model.enums.MaterialType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudyMaterialRepository extends JpaRepository<StudyMaterial, Long> {

    @EntityGraph(attributePaths = {"subject", "topic", "createdBy"})
    Optional<StudyMaterial> findByUuid(UUID uuid);

    @EntityGraph(attributePaths = {"subject", "topic", "createdBy"})
    Optional<StudyMaterial> findBySlug(String slug);

    @EntityGraph(attributePaths = {"subject", "topic"})
    Page<StudyMaterial> findByIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT m FROM StudyMaterial m WHERE m.isActive = true " +
           "AND (:subjectId IS NULL OR m.subject.id = :subjectId) " +
           "AND (:topicId IS NULL OR m.topic.id = :topicId) " +
           "AND (:materialType IS NULL OR m.materialType = :materialType) " +
           "AND (:isPremium IS NULL OR m.isPremium = :isPremium) " +
           "ORDER BY m.createdAt DESC")
    @EntityGraph(attributePaths = {"subject", "topic"})
    Page<StudyMaterial> findByFilters(
            @Param("subjectId") Long subjectId,
            @Param("topicId") Long topicId,
            @Param("materialType") MaterialType materialType,
            @Param("isPremium") Boolean isPremium,
            Pageable pageable);

    @Query("SELECT m FROM StudyMaterial m WHERE m.isActive = true " +
           "AND (LOWER(m.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(m.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY m.createdAt DESC")
    @EntityGraph(attributePaths = {"subject", "topic"})
    Page<StudyMaterial> searchMaterials(@Param("search") String search, Pageable pageable);

    @Query("SELECT m FROM StudyMaterial m WHERE m.isActive = true " +
           "AND (:subjectId IS NULL OR m.subject.id = :subjectId) " +
           "AND (:topicId IS NULL OR m.topic.id = :topicId) " +
           "AND (:materialType IS NULL OR m.materialType = :materialType) " +
           "AND (:isPremium IS NULL OR m.isPremium = :isPremium) " +
           "AND (:search IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(m.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY m.createdAt DESC")
    @EntityGraph(attributePaths = {"subject", "topic"})
    Page<StudyMaterial> findByFiltersAndSearch(
            @Param("subjectId") Long subjectId,
            @Param("topicId") Long topicId,
            @Param("materialType") MaterialType materialType,
            @Param("isPremium") Boolean isPremium,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT COUNT(m) FROM StudyMaterial m WHERE m.isActive = true")
    Long countActiveMaterials();

    @Query("SELECT COUNT(m) FROM StudyMaterial m WHERE m.isActive = true AND m.subject.id = :subjectId")
    Long countBySubject(@Param("subjectId") Long subjectId);
}
