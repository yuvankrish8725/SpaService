package com.spaservice.repository;

import com.spaservice.entity.StaffDailyCheckin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StaffDailyCheckinRepository extends JpaRepository<StaffDailyCheckin, UUID> {
    Optional<StaffDailyCheckin> findByStaffIdAndBranchIdAndCheckinDate(UUID staffId, UUID branchId, LocalDate checkinDate);
    List<StaffDailyCheckin> findByBranchIdAndCheckinDate(UUID branchId, LocalDate checkinDate);
    List<StaffDailyCheckin> findByCheckinDate(LocalDate checkinDate);
}
