package com.spaservice.repository;

import com.spaservice.entity.WorkingStaff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkingStaffRepository extends JpaRepository<WorkingStaff, UUID> {
    List<WorkingStaff> findByBranchIdAndIsActiveTrue(UUID branchId);
    List<WorkingStaff> findByBranchId(UUID branchId);

    @Query("SELECT s FROM WorkingStaff s LEFT JOIN FETCH s.profilePhoto WHERE s.id = :id")
    Optional<WorkingStaff> findByIdWithPhoto(@Param("id") UUID id);
}
