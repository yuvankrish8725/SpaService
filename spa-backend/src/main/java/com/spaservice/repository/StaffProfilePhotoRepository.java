package com.spaservice.repository;

import com.spaservice.entity.StaffProfilePhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StaffProfilePhotoRepository extends JpaRepository<StaffProfilePhoto, UUID> {
    Optional<StaffProfilePhoto> findByStaffId(UUID staffId);
    void deleteByStaffId(UUID staffId);
}
