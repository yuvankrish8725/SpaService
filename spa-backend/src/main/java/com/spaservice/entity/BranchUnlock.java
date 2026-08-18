package com.spaservice.entity;

import jakarta.persistence.*;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "branch_unlocks", indexes = {
        @Index(name = "idx_branch_unlocks_client_branch_exp", columnList = "client_id, branch_id, expires_at")
})
public class BranchUnlock {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private User client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    private Payment payment;

    @Column(name = "unlocked_at", nullable = false)
    private ZonedDateTime unlockedAt;

    @Column(name = "expires_at", nullable = false)
    private ZonedDateTime expiresAt;

    public BranchUnlock() {}

    public BranchUnlock(UUID id, User client, Branch branch, Payment payment, ZonedDateTime unlockedAt, ZonedDateTime expiresAt) {
        this.id = id;
        this.client = client;
        this.branch = branch;
        this.payment = payment;
        this.unlockedAt = unlockedAt;
        this.expiresAt = expiresAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private User client;
        private Branch branch;
        private Payment payment;
        private ZonedDateTime unlockedAt;
        private ZonedDateTime expiresAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder client(User client) { this.client = client; return this; }
        public Builder branch(Branch branch) { this.branch = branch; return this; }
        public Builder payment(Payment payment) { this.payment = payment; return this; }
        public Builder unlockedAt(ZonedDateTime unlockedAt) { this.unlockedAt = unlockedAt; return this; }
        public Builder expiresAt(ZonedDateTime expiresAt) { this.expiresAt = expiresAt; return this; }

        public BranchUnlock build() {
            return new BranchUnlock(id, client, branch, payment, unlockedAt, expiresAt);
        }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public User getClient() { return client; }
    public void setClient(User client) { this.client = client; }
    public Branch getBranch() { return branch; }
    public void setBranch(Branch branch) { this.branch = branch; }
    public Payment getPayment() { return payment; }
    public void setPayment(Payment payment) { this.payment = payment; }
    public ZonedDateTime getUnlockedAt() { return unlockedAt; }
    public void setUnlockedAt(ZonedDateTime unlockedAt) { this.unlockedAt = unlockedAt; }
    public ZonedDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(ZonedDateTime expiresAt) { this.expiresAt = expiresAt; }
}
