package com.spaservice.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "working_staff")
public class WorkingStaff {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 255)
    private String specialization;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @OneToOne(mappedBy = "staff", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private StaffProfilePhoto profilePhoto;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    public WorkingStaff() {}

    public WorkingStaff(UUID id, Branch branch, String name, String specialization, String bio, Boolean isActive, StaffProfilePhoto profilePhoto, ZonedDateTime createdAt, ZonedDateTime updatedAt) {
        this.id = id;
        this.branch = branch;
        this.name = name;
        this.specialization = specialization;
        this.bio = bio;
        this.isActive = isActive != null ? isActive : true;
        this.profilePhoto = profilePhoto;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private Branch branch;
        private String name;
        private String specialization;
        private String bio;
        private Boolean isActive = true;
        private StaffProfilePhoto profilePhoto;
        private ZonedDateTime createdAt;
        private ZonedDateTime updatedAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder branch(Branch branch) { this.branch = branch; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder specialization(String specialization) { this.specialization = specialization; return this; }
        public Builder bio(String bio) { this.bio = bio; return this; }
        public Builder isActive(Boolean isActive) { this.isActive = isActive; return this; }
        public Builder profilePhoto(StaffProfilePhoto profilePhoto) { this.profilePhoto = profilePhoto; return this; }
        public Builder createdAt(ZonedDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(ZonedDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public WorkingStaff build() {
            return new WorkingStaff(id, branch, name, specialization, bio, isActive, profilePhoto, createdAt, updatedAt);
        }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Branch getBranch() { return branch; }
    public void setBranch(Branch branch) { this.branch = branch; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public StaffProfilePhoto getProfilePhoto() { return profilePhoto; }
    public void setProfilePhoto(StaffProfilePhoto profilePhoto) { this.profilePhoto = profilePhoto; }
    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
    public ZonedDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(ZonedDateTime updatedAt) { this.updatedAt = updatedAt; }
}
