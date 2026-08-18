package com.spaservice.repository;

import com.spaservice.entity.BranchUnlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BranchUnlockRepository extends JpaRepository<BranchUnlock, UUID> {

    @Query("SELECT u FROM BranchUnlock u WHERE u.client.id = :clientId AND u.branch.id = :branchId AND u.expiresAt > :now ORDER BY u.expiresAt DESC")
    List<BranchUnlock> findActiveUnlocks(@Param("clientId") UUID clientId, @Param("branchId") UUID branchId, @Param("now") ZonedDateTime now);

    default boolean isBranchUnlockedForClient(UUID clientId, UUID branchId, ZonedDateTime now) {
        return !findActiveUnlocks(clientId, branchId, now).isEmpty();
    }

    @Query("SELECT u FROM BranchUnlock u WHERE u.client.id = :clientId AND u.expiresAt > :now")
    List<BranchUnlock> findAllActiveClientUnlocks(@Param("clientId") UUID clientId, @Param("now") ZonedDateTime now);

    List<BranchUnlock> findByClientIdOrderByUnlockedAtDesc(UUID clientId);
}
