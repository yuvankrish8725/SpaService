package com.spaservice.dto;

import com.spaservice.entity.CheckinStatus;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

public class CheckinDtos {

    public static class CheckinRequest {
        @NotNull(message = "Status is required")
        private CheckinStatus status;

        public CheckinRequest() {}
        public CheckinRequest(CheckinStatus status) {
            this.status = status;
        }

        public CheckinStatus getStatus() { return status; }
        public void setStatus(CheckinStatus status) { this.status = status; }
    }

    public static class StaffCheckinStatusItem {
        private UUID staffId;
        private String staffName;
        private String specialization;
        private String profilePhotoUrl;
        private String status;
        private ZonedDateTime confirmedAt;
        private String confirmedByAgentName;

        public StaffCheckinStatusItem() {}
        public StaffCheckinStatusItem(UUID staffId, String staffName, String specialization, String profilePhotoUrl, String status, ZonedDateTime confirmedAt, String confirmedByAgentName) {
            this.staffId = staffId;
            this.staffName = staffName;
            this.specialization = specialization;
            this.profilePhotoUrl = profilePhotoUrl;
            this.status = status;
            this.confirmedAt = confirmedAt;
            this.confirmedByAgentName = confirmedByAgentName;
        }

        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private UUID staffId;
            private String staffName;
            private String specialization;
            private String profilePhotoUrl;
            private String status;
            private ZonedDateTime confirmedAt;
            private String confirmedByAgentName;

            public Builder staffId(UUID staffId) { this.staffId = staffId; return this; }
            public Builder staffName(String staffName) { this.staffName = staffName; return this; }
            public Builder specialization(String specialization) { this.specialization = specialization; return this; }
            public Builder profilePhotoUrl(String profilePhotoUrl) { this.profilePhotoUrl = profilePhotoUrl; return this; }
            public Builder status(String status) { this.status = status; return this; }
            public Builder confirmedAt(ZonedDateTime confirmedAt) { this.confirmedAt = confirmedAt; return this; }
            public Builder confirmedByAgentName(String confirmedByAgentName) { this.confirmedByAgentName = confirmedByAgentName; return this; }

            public StaffCheckinStatusItem build() {
                return new StaffCheckinStatusItem(staffId, staffName, specialization, profilePhotoUrl, status, confirmedAt, confirmedByAgentName);
            }
        }

        public UUID getStaffId() { return staffId; }
        public void setStaffId(UUID staffId) { this.staffId = staffId; }
        public String getStaffName() { return staffName; }
        public void setStaffName(String staffName) { this.staffName = staffName; }
        public String getSpecialization() { return specialization; }
        public void setSpecialization(String specialization) { this.specialization = specialization; }
        public String getProfilePhotoUrl() { return profilePhotoUrl; }
        public void setProfilePhotoUrl(String profilePhotoUrl) { this.profilePhotoUrl = profilePhotoUrl; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public ZonedDateTime getConfirmedAt() { return confirmedAt; }
        public void setConfirmedAt(ZonedDateTime confirmedAt) { this.confirmedAt = confirmedAt; }
        public String getConfirmedByAgentName() { return confirmedByAgentName; }
        public void setConfirmedByAgentName(String confirmedByAgentName) { this.confirmedByAgentName = confirmedByAgentName; }
    }

    public static class BranchCheckinStatusResponse {
        private UUID branchId;
        private String branchName;
        private LocalDate date;
        private int totalStaff;
        private int presentCount;
        private int onLeaveCount;
        private int pendingCount;
        private List<StaffCheckinStatusItem> staffCheckins;

        public BranchCheckinStatusResponse() {}
        public BranchCheckinStatusResponse(UUID branchId, String branchName, LocalDate date, int totalStaff, int presentCount, int onLeaveCount, int pendingCount, List<StaffCheckinStatusItem> staffCheckins) {
            this.branchId = branchId;
            this.branchName = branchName;
            this.date = date;
            this.totalStaff = totalStaff;
            this.presentCount = presentCount;
            this.onLeaveCount = onLeaveCount;
            this.pendingCount = pendingCount;
            this.staffCheckins = staffCheckins;
        }

        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private UUID branchId;
            private String branchName;
            private LocalDate date;
            private int totalStaff;
            private int presentCount;
            private int onLeaveCount;
            private int pendingCount;
            private List<StaffCheckinStatusItem> staffCheckins;

            public Builder branchId(UUID branchId) { this.branchId = branchId; return this; }
            public Builder branchName(String branchName) { this.branchName = branchName; return this; }
            public Builder date(LocalDate date) { this.date = date; return this; }
            public Builder totalStaff(int totalStaff) { this.totalStaff = totalStaff; return this; }
            public Builder presentCount(int presentCount) { this.presentCount = presentCount; return this; }
            public Builder onLeaveCount(int onLeaveCount) { this.onLeaveCount = onLeaveCount; return this; }
            public Builder pendingCount(int pendingCount) { this.pendingCount = pendingCount; return this; }
            public Builder staffCheckins(List<StaffCheckinStatusItem> staffCheckins) { this.staffCheckins = staffCheckins; return this; }

            public BranchCheckinStatusResponse build() {
                return new BranchCheckinStatusResponse(branchId, branchName, date, totalStaff, presentCount, onLeaveCount, pendingCount, staffCheckins);
            }
        }

        public UUID getBranchId() { return branchId; }
        public void setBranchId(UUID branchId) { this.branchId = branchId; }
        public String getBranchName() { return branchName; }
        public void setBranchName(String branchName) { this.branchName = branchName; }
        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }
        public int getTotalStaff() { return totalStaff; }
        public void setTotalStaff(int totalStaff) { this.totalStaff = totalStaff; }
        public int getPresentCount() { return presentCount; }
        public void setPresentCount(int presentCount) { this.presentCount = presentCount; }
        public int getOnLeaveCount() { return onLeaveCount; }
        public void setOnLeaveCount(int onLeaveCount) { this.onLeaveCount = onLeaveCount; }
        public int getPendingCount() { return pendingCount; }
        public void setPendingCount(int pendingCount) { this.pendingCount = pendingCount; }
        public List<StaffCheckinStatusItem> getStaffCheckins() { return staffCheckins; }
        public void setStaffCheckins(List<StaffCheckinStatusItem> staffCheckins) { this.staffCheckins = staffCheckins; }
    }
}
