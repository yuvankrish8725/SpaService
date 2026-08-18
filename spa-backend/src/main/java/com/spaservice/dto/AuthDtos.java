package com.spaservice.dto;

import com.spaservice.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

public class AuthDtos {

    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        public LoginRequest() {}
        public LoginRequest(String email, String password) {
            this.email = email;
            this.password = password;
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 100)
        private String fullName;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        private String phone;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        public RegisterRequest() {}
        public RegisterRequest(String fullName, String email, String phone, String password) {
            this.fullName = fullName;
            this.email = email;
            this.phone = phone;
            this.password = password;
        }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class UserDto {
        private UUID id;
        private String fullName;
        private String email;
        private String phone;
        private Role role;
        private UUID assignedBranchId;
        private String assignedBranchName;

        public UserDto() {}
        public UserDto(UUID id, String fullName, String email, String phone, Role role, UUID assignedBranchId, String assignedBranchName) {
            this.id = id;
            this.fullName = fullName;
            this.email = email;
            this.phone = phone;
            this.role = role;
            this.assignedBranchId = assignedBranchId;
            this.assignedBranchName = assignedBranchName;
        }

        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private UUID id;
            private String fullName;
            private String email;
            private String phone;
            private Role role;
            private UUID assignedBranchId;
            private String assignedBranchName;

            public Builder id(UUID id) { this.id = id; return this; }
            public Builder fullName(String fullName) { this.fullName = fullName; return this; }
            public Builder email(String email) { this.email = email; return this; }
            public Builder phone(String phone) { this.phone = phone; return this; }
            public Builder role(Role role) { this.role = role; return this; }
            public Builder assignedBranchId(UUID assignedBranchId) { this.assignedBranchId = assignedBranchId; return this; }
            public Builder assignedBranchName(String assignedBranchName) { this.assignedBranchName = assignedBranchName; return this; }

            public UserDto build() {
                return new UserDto(id, fullName, email, phone, role, assignedBranchId, assignedBranchName);
            }
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }
        public UUID getAssignedBranchId() { return assignedBranchId; }
        public void setAssignedBranchId(UUID assignedBranchId) { this.assignedBranchId = assignedBranchId; }
        public String getAssignedBranchName() { return assignedBranchName; }
        public void setAssignedBranchName(String assignedBranchName) { this.assignedBranchName = assignedBranchName; }
    }

    public static class BranchUnlockDto {
        private UUID branchId;
        private String branchName;
        private ZonedDateTime expiresAt;

        public BranchUnlockDto() {}
        public BranchUnlockDto(UUID branchId, String branchName, ZonedDateTime expiresAt) {
            this.branchId = branchId;
            this.branchName = branchName;
            this.expiresAt = expiresAt;
        }

        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private UUID branchId;
            private String branchName;
            private ZonedDateTime expiresAt;

            public Builder branchId(UUID branchId) { this.branchId = branchId; return this; }
            public Builder branchName(String branchName) { this.branchName = branchName; return this; }
            public Builder expiresAt(ZonedDateTime expiresAt) { this.expiresAt = expiresAt; return this; }

            public BranchUnlockDto build() {
                return new BranchUnlockDto(branchId, branchName, expiresAt);
            }
        }

        public UUID getBranchId() { return branchId; }
        public void setBranchId(UUID branchId) { this.branchId = branchId; }
        public String getBranchName() { return branchName; }
        public void setBranchName(String branchName) { this.branchName = branchName; }
        public ZonedDateTime getExpiresAt() { return expiresAt; }
        public void setExpiresAt(ZonedDateTime expiresAt) { this.expiresAt = expiresAt; }
    }

    public static class AuthResponse {
        private String accessToken;
        private String refreshToken;
        private String tokenType;
        private long expiresIn;
        private UserDto user;
        private List<BranchUnlockDto> activeUnlocks;

        public AuthResponse() {}
        public AuthResponse(String accessToken, String refreshToken, String tokenType, long expiresIn, UserDto user, List<BranchUnlockDto> activeUnlocks) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.tokenType = tokenType;
            this.expiresIn = expiresIn;
            this.user = user;
            this.activeUnlocks = activeUnlocks;
        }

        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private String accessToken;
            private String refreshToken;
            private String tokenType;
            private long expiresIn;
            private UserDto user;
            private List<BranchUnlockDto> activeUnlocks;

            public Builder accessToken(String accessToken) { this.accessToken = accessToken; return this; }
            public Builder refreshToken(String refreshToken) { this.refreshToken = refreshToken; return this; }
            public Builder tokenType(String tokenType) { this.tokenType = tokenType; return this; }
            public Builder expiresIn(long expiresIn) { this.expiresIn = expiresIn; return this; }
            public Builder user(UserDto user) { this.user = user; return this; }
            public Builder activeUnlocks(List<BranchUnlockDto> activeUnlocks) { this.activeUnlocks = activeUnlocks; return this; }

            public AuthResponse build() {
                return new AuthResponse(accessToken, refreshToken, tokenType, expiresIn, user, activeUnlocks);
            }
        }

        public String getAccessToken() { return accessToken; }
        public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
        public String getRefreshToken() { return refreshToken; }
        public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
        public String getTokenType() { return tokenType; }
        public void setTokenType(String tokenType) { this.tokenType = tokenType; }
        public long getExpiresIn() { return expiresIn; }
        public void setExpiresIn(long expiresIn) { this.expiresIn = expiresIn; }
        public UserDto getUser() { return user; }
        public void setUser(UserDto user) { this.user = user; }
        public List<BranchUnlockDto> getActiveUnlocks() { return activeUnlocks; }
        public void setActiveUnlocks(List<BranchUnlockDto> activeUnlocks) { this.activeUnlocks = activeUnlocks; }
    }
}
