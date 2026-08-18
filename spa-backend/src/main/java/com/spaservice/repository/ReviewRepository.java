package com.spaservice.repository;

import com.spaservice.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findByStaffIdOrderByCreatedAtDesc(UUID staffId);
    List<Review> findByClientIdOrderByCreatedAtDesc(UUID clientId);
}
