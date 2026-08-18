package com.spaservice.repository;

import com.spaservice.entity.Agent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AgentRepository extends JpaRepository<Agent, UUID> {
    Optional<Agent> findByUserId(UUID userId);
    List<Agent> findByAssignedBranchId(UUID branchId);
    List<Agent> findByIsActiveTrue();
}
