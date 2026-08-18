package com.spaservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public class ServiceDtos {

    public static class SpaServiceRequest {
        private UUID branchId;

        @NotBlank(message = "Service name is required")
        private String name;

        @NotBlank(message = "Category is required")
        private String category;

        @NotNull(message = "Duration in minutes is required")
        private Integer durationMinutes;

        @NotNull(message = "Price is required")
        private BigDecimal price;

        private String description;
        private String imageUrl;

        public SpaServiceRequest() {}
        public SpaServiceRequest(UUID branchId, String name, String category, Integer durationMinutes, BigDecimal price, String description, String imageUrl) {
            this.branchId = branchId;
            this.name = name;
            this.category = category;
            this.durationMinutes = durationMinutes;
            this.price = price;
            this.description = description;
            this.imageUrl = imageUrl;
        }

        public UUID getBranchId() { return branchId; }
        public void setBranchId(UUID branchId) { this.branchId = branchId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public Integer getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }

    public static class SpaServiceResponse {
        private UUID id;
        private UUID branchId;
        private String branchName;
        private String name;
        private String category;
        private Integer durationMinutes;
        private BigDecimal price;
        private String description;
        private String imageUrl;
        private boolean isActive;

        public SpaServiceResponse() {}
        public SpaServiceResponse(UUID id, UUID branchId, String branchName, String name, String category, Integer durationMinutes, BigDecimal price, String description, String imageUrl, boolean isActive) {
            this.id = id;
            this.branchId = branchId;
            this.branchName = branchName;
            this.name = name;
            this.category = category;
            this.durationMinutes = durationMinutes;
            this.price = price;
            this.description = description;
            this.imageUrl = imageUrl;
            this.isActive = isActive;
        }

        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private UUID id;
            private UUID branchId;
            private String branchName;
            private String name;
            private String category;
            private Integer durationMinutes;
            private BigDecimal price;
            private String description;
            private String imageUrl;
            private boolean isActive;

            public Builder id(UUID id) { this.id = id; return this; }
            public Builder branchId(UUID branchId) { this.branchId = branchId; return this; }
            public Builder branchName(String branchName) { this.branchName = branchName; return this; }
            public Builder name(String name) { this.name = name; return this; }
            public Builder category(String category) { this.category = category; return this; }
            public Builder durationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; return this; }
            public Builder price(BigDecimal price) { this.price = price; return this; }
            public Builder description(String description) { this.description = description; return this; }
            public Builder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
            public Builder isActive(boolean isActive) { this.isActive = isActive; return this; }

            public SpaServiceResponse build() {
                return new SpaServiceResponse(id, branchId, branchName, name, category, durationMinutes, price, description, imageUrl, isActive);
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
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public Integer getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public boolean getIsActive() { return isActive; }
        public void setIsActive(boolean isActive) { this.isActive = isActive; }
    }
}
