package com.spaservice.repository;

import com.spaservice.entity.SpaServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpaServiceRepository extends JpaRepository<SpaServiceEntity, UUID> {
    List<SpaServiceEntity> findByIsActiveTrue();

    @Query("SELECT s FROM SpaServiceEntity s WHERE s.isActive = true AND (s.branch.id = :branchId OR s.branch IS NULL)")
    List<SpaServiceEntity> findAvailableForBranch(@Param("branchId") UUID branchId);

    List<SpaServiceEntity> findByBranchId(UUID branchId);
}
