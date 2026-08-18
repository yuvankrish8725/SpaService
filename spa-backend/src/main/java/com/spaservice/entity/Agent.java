package com.spaservice.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "agents")
public class Agent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_branch_id", nullable = false)
    private Branch assignedBranch;

    @Column(name = "created_by_admin_id")
    private UUID createdByAdminId;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    public Agent() {}

    public Agent(UUID id, User user, Branch assignedBranch, UUID createdByAdminId, Boolean isActive, ZonedDateTime createdAt) {
        this.id = id;
        this.user = user;
        this.assignedBranch = assignedBranch;
        this.createdByAdminId = createdByAdminId;
        this.isActive = isActive != null ? isActive : true;
        this.createdAt = createdAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private User user;
        private Branch assignedBranch;
        private UUID createdByAdminId;
        private Boolean isActive = true;
        private ZonedDateTime createdAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder user(User user) { this.user = user; return this; }
        public Builder assignedBranch(Branch assignedBranch) { this.assignedBranch = assignedBranch; return this; }
        public Builder createdByAdminId(UUID createdByAdminId) { this.createdByAdminId = createdByAdminId; return this; }
        public Builder isActive(Boolean isActive) { this.isActive = isActive; return this; }
        public Builder createdAt(ZonedDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Agent build() {
            return new Agent(id, user, assignedBranch, createdByAdminId, isActive, createdAt);
        }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Branch getAssignedBranch() { return assignedBranch; }
    public void setAssignedBranch(Branch assignedBranch) { this.assignedBranch = assignedBranch; }
    public UUID getCreatedByAdminId() { return createdByAdminId; }
    public void setCreatedByAdminId(UUID createdByAdminId) { this.createdByAdminId = createdByAdminId; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
}
