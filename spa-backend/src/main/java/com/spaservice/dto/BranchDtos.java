package com.spaservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.UUID;

public class BranchDtos {

    public static class BranchRequest {
        @NotBlank(message = "Branch name is required")
        private String name;

        @NotBlank(message = "Address is required")
        private String address;

        @NotBlank(message = "City is required")
        private String city;

        @NotBlank(message = "State is required")
        private String state;

        @NotBlank(message = "Pincode is required")
        private String pincode;

        private String phone;

        @NotNull(message = "Latitude is required")
        private BigDecimal latitude;

        @NotNull(message = "Longitude is required")
        private BigDecimal longitude;

        private String mapsUrl;
        private LocalTime openTime;
        private LocalTime closeTime;

        public BranchRequest() {}
        public BranchRequest(String name, String address, String city, String state, String pincode, String phone, BigDecimal latitude, BigDecimal longitude, String mapsUrl, LocalTime openTime, LocalTime closeTime) {
            this.name = name;
            this.address = address;
            this.city = city;
            this.state = state;
            this.pincode = pincode;
            this.phone = phone;
            this.latitude = latitude;
            this.longitude = longitude;
            this.mapsUrl = mapsUrl;
            this.openTime = openTime;
            this.closeTime = closeTime;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getState() { return state; }
        public void setState(String state) { this.state = state; }
        public String getPincode() { return pincode; }
        public void setPincode(String pincode) { this.pincode = pincode; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public BigDecimal getLatitude() { return latitude; }
        public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }
        public BigDecimal getLongitude() { return longitude; }
        public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }
        public String getMapsUrl() { return mapsUrl; }
        public void setMapsUrl(String mapsUrl) { this.mapsUrl = mapsUrl; }
        public LocalTime getOpenTime() { return openTime; }
        public void setOpenTime(LocalTime openTime) { this.openTime = openTime; }
        public LocalTime getCloseTime() { return closeTime; }
        public void setCloseTime(LocalTime closeTime) { this.closeTime = closeTime; }
    }

    public static class BranchResponse {
        private UUID id;
        private String name;
        private String address;
        private String city;
        private String state;
        private String pincode;
        private String phone;
        private BigDecimal latitude;
        private BigDecimal longitude;
        private String mapsUrl;
        private LocalTime openTime;
        private LocalTime closeTime;
        private boolean isActive;
        private int staffCount;
        private int serviceCount;

        public BranchResponse() {}
        public BranchResponse(UUID id, String name, String address, String city, String state, String pincode, String phone, BigDecimal latitude, BigDecimal longitude, String mapsUrl, LocalTime openTime, LocalTime closeTime, boolean isActive, int staffCount, int serviceCount) {
            this.id = id;
            this.name = name;
            this.address = address;
            this.city = city;
            this.state = state;
            this.pincode = pincode;
            this.phone = phone;
            this.latitude = latitude;
            this.longitude = longitude;
            this.mapsUrl = mapsUrl;
            this.openTime = openTime;
            this.closeTime = closeTime;
            this.isActive = isActive;
            this.staffCount = staffCount;
            this.serviceCount = serviceCount;
        }

        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private UUID id;
            private String name;
            private String address;
            private String city;
            private String state;
            private String pincode;
            private String phone;
            private BigDecimal latitude;
            private BigDecimal longitude;
            private String mapsUrl;
            private LocalTime openTime;
            private LocalTime closeTime;
            private boolean isActive;
            private int staffCount;
            private int serviceCount;

            public Builder id(UUID id) { this.id = id; return this; }
            public Builder name(String name) { this.name = name; return this; }
            public Builder address(String address) { this.address = address; return this; }
            public Builder city(String city) { this.city = city; return this; }
            public Builder state(String state) { this.state = state; return this; }
            public Builder pincode(String pincode) { this.pincode = pincode; return this; }
            public Builder phone(String phone) { this.phone = phone; return this; }
            public Builder latitude(BigDecimal latitude) { this.latitude = latitude; return this; }
            public Builder longitude(BigDecimal longitude) { this.longitude = longitude; return this; }
            public Builder mapsUrl(String mapsUrl) { this.mapsUrl = mapsUrl; return this; }
            public Builder openTime(LocalTime openTime) { this.openTime = openTime; return this; }
            public Builder closeTime(LocalTime closeTime) { this.closeTime = closeTime; return this; }
            public Builder isActive(boolean isActive) { this.isActive = isActive; return this; }
            public Builder staffCount(int staffCount) { this.staffCount = staffCount; return this; }
            public Builder serviceCount(int serviceCount) { this.serviceCount = serviceCount; return this; }

            public BranchResponse build() {
                return new BranchResponse(id, name, address, city, state, pincode, phone, latitude, longitude, mapsUrl, openTime, closeTime, isActive, staffCount, serviceCount);
            }
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getState() { return state; }
        public void setState(String state) { this.state = state; }
        public String getPincode() { return pincode; }
        public void setPincode(String pincode) { this.pincode = pincode; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public BigDecimal getLatitude() { return latitude; }
        public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }
        public BigDecimal getLongitude() { return longitude; }
        public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }
        public String getMapsUrl() { return mapsUrl; }
        public void setMapsUrl(String mapsUrl) { this.mapsUrl = mapsUrl; }
        public LocalTime getOpenTime() { return openTime; }
        public void setOpenTime(LocalTime openTime) { this.openTime = openTime; }
        public LocalTime getCloseTime() { return closeTime; }
        public void setCloseTime(LocalTime closeTime) { this.closeTime = closeTime; }
        public boolean getIsActive() { return isActive; }
        public void setIsActive(boolean isActive) { this.isActive = isActive; }
        public int getStaffCount() { return staffCount; }
        public void setStaffCount(int staffCount) { this.staffCount = staffCount; }
        public int getServiceCount() { return serviceCount; }
        public void setServiceCount(int serviceCount) { this.serviceCount = serviceCount; }
    }
}
