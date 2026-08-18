package com.spaservice.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "staff_daily_checkins", uniqueConstraints = {
        @UniqueConstraint(name = "uq_staff_branch_checkin", columnNames = {"staff_id", "branch_id", "checkin_date"})
})
public class StaffDailyCheckin {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    private WorkingStaff staff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(name = "checkin_date", nullable = false)
    private LocalDate checkinDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CheckinStatus status = CheckinStatus.PRESENT;

    @Column(name = "confirmed_by_agent_id")
    private UUID confirmedByAgentId;

    @CreationTimestamp
    @Column(name = "confirmed_at", updatable = false)
    private ZonedDateTime confirmedAt;

    public StaffDailyCheckin() {}

    public StaffDailyCheckin(UUID id, WorkingStaff staff, Branch branch, LocalDate checkinDate, CheckinStatus status, UUID confirmedByAgentId, ZonedDateTime confirmedAt) {
        this.id = id;
        this.staff = staff;
        this.branch = branch;
        this.checkinDate = checkinDate;
        this.status = status != null ? status : CheckinStatus.PRESENT;
        this.confirmedByAgentId = confirmedByAgentId;
        this.confirmedAt = confirmedAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private WorkingStaff staff;
        private Branch branch;
        private LocalDate checkinDate;
        private CheckinStatus status = CheckinStatus.PRESENT;
        private UUID confirmedByAgentId;
        private ZonedDateTime confirmedAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder staff(WorkingStaff staff) { this.staff = staff; return this; }
        public Builder branch(Branch branch) { this.branch = branch; return this; }
        public Builder checkinDate(LocalDate checkinDate) { this.checkinDate = checkinDate; return this; }
        public Builder status(CheckinStatus status) { this.status = status; return this; }
        public Builder confirmedByAgentId(UUID confirmedByAgentId) { this.confirmedByAgentId = confirmedByAgentId; return this; }
        public Builder confirmedAt(ZonedDateTime confirmedAt) { this.confirmedAt = confirmedAt; return this; }

        public StaffDailyCheckin build() {
            return new StaffDailyCheckin(id, staff, branch, checkinDate, status, confirmedByAgentId, confirmedAt);
        }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public WorkingStaff getStaff() { return staff; }
    public void setStaff(WorkingStaff staff) { this.staff = staff; }
    public Branch getBranch() { return branch; }
    public void setBranch(Branch branch) { this.branch = branch; }
    public LocalDate getCheckinDate() { return checkinDate; }
    public void setCheckinDate(LocalDate checkinDate) { this.checkinDate = checkinDate; }
    public CheckinStatus getStatus() { return status; }
    public void setStatus(CheckinStatus status) { this.status = status; }
    public UUID getConfirmedByAgentId() { return confirmedByAgentId; }
    public void setConfirmedByAgentId(UUID confirmedByAgentId) { this.confirmedByAgentId = confirmedByAgentId; }
    public ZonedDateTime getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(ZonedDateTime confirmedAt) { this.confirmedAt = confirmedAt; }
}
