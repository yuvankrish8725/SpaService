package com.spaservice.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "staff_profile_photos")
public class StaffProfilePhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false, unique = true)
    private WorkingStaff staff;

    @Column(name = "photo_url", nullable = false, columnDefinition = "TEXT")
    private String photoUrl;

    @Column(name = "uploaded_by")
    private UUID uploadedBy;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    public StaffProfilePhoto() {}

    public StaffProfilePhoto(UUID id, WorkingStaff staff, String photoUrl, UUID uploadedBy, ZonedDateTime updatedAt) {
        this.id = id;
        this.staff = staff;
        this.photoUrl = photoUrl;
        this.uploadedBy = uploadedBy;
        this.updatedAt = updatedAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private WorkingStaff staff;
        private String photoUrl;
        private UUID uploadedBy;
        private ZonedDateTime updatedAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder staff(WorkingStaff staff) { this.staff = staff; return this; }
        public Builder photoUrl(String photoUrl) { this.photoUrl = photoUrl; return this; }
        public Builder uploadedBy(UUID uploadedBy) { this.uploadedBy = uploadedBy; return this; }
        public Builder updatedAt(ZonedDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public StaffProfilePhoto build() {
            return new StaffProfilePhoto(id, staff, photoUrl, uploadedBy, updatedAt);
        }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public WorkingStaff getStaff() { return staff; }
    public void setStaff(WorkingStaff staff) { this.staff = staff; }
    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
    public UUID getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(UUID uploadedBy) { this.uploadedBy = uploadedBy; }
    public ZonedDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(ZonedDateTime updatedAt) { this.updatedAt = updatedAt; }
}
