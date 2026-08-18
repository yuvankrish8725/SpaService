package com.spaservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.ZonedDateTime;
import java.util.UUID;

public class AgentDtos {

    public static class AgentCreateRequest {
        @NotBlank(message = "Agent full name is required")
        private String fullName;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email")
        private String email;

        private String phone;

        @NotBlank(message = "Password is required")
        @Size(min = 6)
        private String password;

        @NotNull(message = "Assigned Branch ID is required")
        private UUID assignedBranchId;

        public AgentCreateRequest() {}
        public AgentCreateRequest(String fullName, String email, String phone, String password, UUID assignedBranchId) {
            this.fullName = fullName;
            this.email = email;
            this.phone = phone;
            this.password = password;
            this.assignedBranchId = assignedBranchId;
        }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public UUID getAssignedBranchId() { return assignedBranchId; }
        public void setAssignedBranchId(UUID assignedBranchId) { this.assignedBranchId = assignedBranchId; }
    }

    public static class AgentResponse {
        private UUID id;
        private UUID userId;
        private String fullName;
        private String email;
        private String phone;
        private UUID assignedBranchId;
        private String assignedBranchName;
        private boolean isActive;
        private ZonedDateTime createdAt;

        public AgentResponse() {}
        public AgentResponse(UUID id, UUID userId, String fullName, String email, String phone, UUID assignedBranchId, String assignedBranchName, boolean isActive, ZonedDateTime createdAt) {
            this.id = id;
            this.userId = userId;
            this.fullName = fullName;
            this.email = email;
            this.phone = phone;
            this.assignedBranchId = assignedBranchId;
            this.assignedBranchName = assignedBranchName;
            this.isActive = isActive;
            this.createdAt = createdAt;
        }

        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private UUID id;
            private UUID userId;
            private String fullName;
            private String email;
            private String phone;
            private UUID assignedBranchId;
            private String assignedBranchName;
            private boolean isActive;
            private ZonedDateTime createdAt;

            public Builder id(UUID id) { this.id = id; return this; }
            public Builder userId(UUID userId) { this.userId = userId; return this; }
            public Builder fullName(String fullName) { this.fullName = fullName; return this; }
            public Builder email(String email) { this.email = email; return this; }
            public Builder phone(String phone) { this.phone = phone; return this; }
            public Builder assignedBranchId(UUID assignedBranchId) { this.assignedBranchId = assignedBranchId; return this; }
            public Builder assignedBranchName(String assignedBranchName) { this.assignedBranchName = assignedBranchName; return this; }
            public Builder isActive(boolean isActive) { this.isActive = isActive; return this; }
            public Builder createdAt(ZonedDateTime createdAt) { this.createdAt = createdAt; return this; }

            public AgentResponse build() {
                return new AgentResponse(id, userId, fullName, email, phone, assignedBranchId, assignedBranchName, isActive, createdAt);
            }
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public UUID getAssignedBranchId() { return assignedBranchId; }
        public void setAssignedBranchId(UUID assignedBranchId) { this.assignedBranchId = assignedBranchId; }
        public String getAssignedBranchName() { return assignedBranchName; }
        public void setAssignedBranchName(String assignedBranchName) { this.assignedBranchName = assignedBranchName; }
        public boolean getIsActive() { return isActive; }
        public void setIsActive(boolean isActive) { this.isActive = isActive; }
        public ZonedDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
    }
}
