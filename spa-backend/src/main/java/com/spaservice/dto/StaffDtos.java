package com.spaservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.ZonedDateTime;
import java.util.UUID;

public class StaffDtos {

    public static class StaffRequest {
        @NotNull(message = "Branch ID is required")
        private UUID branchId;

        @NotBlank(message = "Staff name is required")
        private String name;

        @NotBlank(message = "Specialization is required")
        private String specialization;

        private String bio;
        private String profilePhotoUrl;

        public StaffRequest() {}
        public StaffRequest(UUID branchId, String name, String specialization, String bio, String profilePhotoUrl) {
            this.branchId = branchId;
            this.name = name;
            this.specialization = specialization;
            this.bio = bio;
            this.profilePhotoUrl = profilePhotoUrl;
        }

        public UUID getBranchId() { return branchId; }
        public void setBranchId(UUID branchId) { this.branchId = branchId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getSpecialization() { return specialization; }
        public void setSpecialization(String specialization) { this.specialization = specialization; }
        public String getBio() { return bio; }
        public void setBio(String bio) { this.bio = bio; }
        public String getProfilePhotoUrl() { return profilePhotoUrl; }
        public void setProfilePhotoUrl(String profilePhotoUrl) { this.profilePhotoUrl = profilePhotoUrl; }
    }

    public static class ProfilePhotoUpdateRequest {
        @NotBlank(message = "Photo URL is required")
        private String photoUrl;

        public ProfilePhotoUpdateRequest() {}
        public ProfilePhotoUpdateRequest(String photoUrl) {
            this.photoUrl = photoUrl;
        }

        public String getPhotoUrl() { return photoUrl; }
        public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
    }

    public static class StaffCardResponse {
        private UUID id;
        private UUID branchId;
        private String branchName;
        private String name;
        private String specialization;
        private String bio;
        private String profilePhotoUrl;
        private String todayCheckinStatus;
        private ZonedDateTime checkinConfirmedAt;
        private boolean isBookable;
        private boolean isActive;

        public StaffCardResponse() {}
        public StaffCardResponse(UUID id, UUID branchId, String branchName, String name, String specialization, String bio, String profilePhotoUrl, String todayCheckinStatus, ZonedDateTime checkinConfirmedAt, boolean isBookable, boolean isActive) {
            this.id = id;
            this.branchId = branchId;
            this.branchName = branchName;
            this.name = name;
            this.specialization = specialization;
            this.bio = bio;
            this.profilePhotoUrl = profilePhotoUrl;
            this.todayCheckinStatus = todayCheckinStatus;
            this.checkinConfirmedAt = checkinConfirmedAt;
            this.isBookable = isBookable;
            this.isActive = isActive;
        }

        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private UUID id;
            private UUID branchId;
            private String branchName;
            private String name;
            private String specialization;
            private String bio;
            private String profilePhotoUrl;
            private String todayCheckinStatus;
            private ZonedDateTime checkinConfirmedAt;
            private boolean isBookable;
            private boolean isActive;

            public Builder id(UUID id) { this.id = id; return this; }
            public Builder branchId(UUID branchId) { this.branchId = branchId; return this; }
            public Builder branchName(String branchName) { this.branchName = branchName; return this; }
            public Builder name(String name) { this.name = name; return this; }
            public Builder specialization(String specialization) { this.specialization = specialization; return this; }
            public Builder bio(String bio) { this.bio = bio; return this; }
            public Builder profilePhotoUrl(String profilePhotoUrl) { this.profilePhotoUrl = profilePhotoUrl; return this; }
            public Builder todayCheckinStatus(String todayCheckinStatus) { this.todayCheckinStatus = todayCheckinStatus; return this; }
            public Builder checkinConfirmedAt(ZonedDateTime checkinConfirmedAt) { this.checkinConfirmedAt = checkinConfirmedAt; return this; }
            public Builder isBookable(boolean isBookable) { this.isBookable = isBookable; return this; }
            public Builder isActive(boolean isActive) { this.isActive = isActive; return this; }

            public StaffCardResponse build() {
                return new StaffCardResponse(id, branchId, branchName, name, specialization, bio, profilePhotoUrl, todayCheckinStatus, checkinConfirmedAt, isBookable, isActive);
            }
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public UUID getBranchId() { return branchId; }
        public void setBranchId(UUID branchId) { this.branchId = branchId; }
        public String getBranchName() { return branchName; }
        public void setBranchName(String branchName) { this.branchName = branchName; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getSpecialization() { return specialization; }
        public void setSpecialization(String specialization) { this.specialization = specialization; }
        public String getBio() { return bio; }
        public void setBio(String bio) { this.bio = bio; }
        public String getProfilePhotoUrl() { return profilePhotoUrl; }
        public void setProfilePhotoUrl(String profilePhotoUrl) { this.profilePhotoUrl = profilePhotoUrl; }
        public String getTodayCheckinStatus() { return todayCheckinStatus; }
        public void setTodayCheckinStatus(String todayCheckinStatus) { this.todayCheckinStatus = todayCheckinStatus; }
        public ZonedDateTime getCheckinConfirmedAt() { return checkinConfirmedAt; }
        public void setCheckinConfirmedAt(ZonedDateTime checkinConfirmedAt) { this.checkinConfirmedAt = checkinConfirmedAt; }
        public boolean isBookable() { return isBookable; }
        public void setBookable(boolean isBookable) { this.isBookable = isBookable; }
        public boolean isActive() { return isActive; }
        public void setActive(boolean isActive) { this.isActive = isActive; }
    }
}
