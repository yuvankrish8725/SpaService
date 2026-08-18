package com.spaservice.dto;

import com.spaservice.entity.AppointmentStatus;
import com.spaservice.entity.PaymentMode;
import com.spaservice.entity.PaymentStatus;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.UUID;

public class AppointmentDtos {

    public static class AppointmentCreateRequest {
        @NotNull(message = "Branch ID is required")
        private UUID branchId;

        @NotNull(message = "Staff ID is required")
        private UUID staffId;

        @NotNull(message = "Service ID is required")
        private UUID serviceId;

        @NotNull(message = "Appointment date is required")
        private LocalDate appointmentDate;

        @NotNull(message = "Start time is required")
        private LocalTime startTime;

        @NotNull(message = "Payment mode is required (ONLINE or AT_SPA)")
        private PaymentMode paymentMode;

        private String notes;

        public AppointmentCreateRequest() {}
        public AppointmentCreateRequest(UUID branchId, UUID staffId, UUID serviceId, LocalDate appointmentDate, LocalTime startTime, PaymentMode paymentMode, String notes) {
            this.branchId = branchId;
            this.staffId = staffId;
            this.serviceId = serviceId;
            this.appointmentDate = appointmentDate;
            this.startTime = startTime;
            this.paymentMode = paymentMode;
            this.notes = notes;
        }

        public UUID getBranchId() { return branchId; }
        public void setBranchId(UUID branchId) { this.branchId = branchId; }
        public UUID getStaffId() { return staffId; }
        public void setStaffId(UUID staffId) { this.staffId = staffId; }
        public UUID getServiceId() { return serviceId; }
        public void setServiceId(UUID serviceId) { this.serviceId = serviceId; }
        public LocalDate getAppointmentDate() { return appointmentDate; }
        public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }
        public LocalTime getStartTime() { return startTime; }
        public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
        public PaymentMode getPaymentMode() { return paymentMode; }
        public void setPaymentMode(PaymentMode paymentMode) { this.paymentMode = paymentMode; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class AppointmentResponse {
        private UUID id;
        private UUID clientId;
        private String clientName;
        private String clientEmail;
        private String clientPhone;

        private UUID branchId;
        private String branchName;
        private String branchCity;
        private String branchAddress;
        private String branchMapsUrl;

        private UUID staffId;
        private String staffName;
        private String staffSpecialization;
        private String staffPhotoUrl;

        private UUID serviceId;
        private String serviceName;
        private Integer serviceDurationMinutes;

        private LocalDate appointmentDate;
        private LocalTime startTime;
        private LocalTime endTime;

        private AppointmentStatus status;
        private PaymentMode paymentMode;
        private BigDecimal basePrice;
        private BigDecimal taxAmount;
        private BigDecimal totalPrice;
        private PaymentStatus paymentStatus;

        private String notes;
        private ZonedDateTime createdAt;

        public AppointmentResponse() {}
        public AppointmentResponse(UUID id, UUID clientId, String clientName, String clientEmail, String clientPhone, UUID branchId, String branchName, String branchCity, String branchAddress, String branchMapsUrl, UUID staffId, String staffName, String staffSpecialization, String staffPhotoUrl, UUID serviceId, String serviceName, Integer serviceDurationMinutes, LocalDate appointmentDate, LocalTime startTime, LocalTime endTime, AppointmentStatus status, PaymentMode paymentMode, BigDecimal basePrice, BigDecimal taxAmount, BigDecimal totalPrice, PaymentStatus paymentStatus, String notes, ZonedDateTime createdAt) {
            this.id = id;
            this.clientId = clientId;
            this.clientName = clientName;
            this.clientEmail = clientEmail;
            this.clientPhone = clientPhone;
            this.branchId = branchId;
            this.branchName = branchName;
            this.branchCity = branchCity;
            this.branchAddress = branchAddress;
            this.branchMapsUrl = branchMapsUrl;
            this.staffId = staffId;
            this.staffName = staffName;
            this.staffSpecialization = staffSpecialization;
            this.staffPhotoUrl = staffPhotoUrl;
            this.serviceId = serviceId;
            this.serviceName = serviceName;
            this.serviceDurationMinutes = serviceDurationMinutes;
            this.appointmentDate = appointmentDate;
            this.startTime = startTime;
            this.endTime = endTime;
            this.status = status;
            this.paymentMode = paymentMode;
            this.basePrice = basePrice;
            this.taxAmount = taxAmount;
            this.totalPrice = totalPrice;
            this.paymentStatus = paymentStatus;
            this.notes = notes;
            this.createdAt = createdAt;
        }

        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private UUID id;
            private UUID clientId;
            private String clientName;
            private String clientEmail;
            private String clientPhone;
            private UUID branchId;
            private String branchName;
            private String branchCity;
            private String branchAddress;
            private String branchMapsUrl;
            private UUID staffId;
            private String staffName;
            private String staffSpecialization;
            private String staffPhotoUrl;
            private UUID serviceId;
            private String serviceName;
            private Integer serviceDurationMinutes;
            private LocalDate appointmentDate;
            private LocalTime startTime;
            private LocalTime endTime;
            private AppointmentStatus status;
            private PaymentMode paymentMode;
            private BigDecimal basePrice;
            private BigDecimal taxAmount;
            private BigDecimal totalPrice;
            private PaymentStatus paymentStatus;
            private String notes;
            private ZonedDateTime createdAt;

            public Builder id(UUID id) { this.id = id; return this; }
            public Builder clientId(UUID clientId) { this.clientId = clientId; return this; }
            public Builder clientName(String clientName) { this.clientName = clientName; return this; }
            public Builder clientEmail(String clientEmail) { this.clientEmail = clientEmail; return this; }
            public Builder clientPhone(String clientPhone) { this.clientPhone = clientPhone; return this; }
            public Builder branchId(UUID branchId) { this.branchId = branchId; return this; }
            public Builder branchName(String branchName) { this.branchName = branchName; return this; }
            public Builder branchCity(String branchCity) { this.branchCity = branchCity; return this; }
            public Builder branchAddress(String branchAddress) { this.branchAddress = branchAddress; return this; }
            public Builder branchMapsUrl(String branchMapsUrl) { this.branchMapsUrl = branchMapsUrl; return this; }
            public Builder staffId(UUID staffId) { this.staffId = staffId; return this; }
            public Builder staffName(String staffName) { this.staffName = staffName; return this; }
            public Builder staffSpecialization(String staffSpecialization) { this.staffSpecialization = staffSpecialization; return this; }
            public Builder staffPhotoUrl(String staffPhotoUrl) { this.staffPhotoUrl = staffPhotoUrl; return this; }
            public Builder serviceId(UUID serviceId) { this.serviceId = serviceId; return this; }
            public Builder serviceName(String serviceName) { this.serviceName = serviceName; return this; }
            public Builder serviceDurationMinutes(Integer serviceDurationMinutes) { this.serviceDurationMinutes = serviceDurationMinutes; return this; }
            public Builder appointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; return this; }
            public Builder startTime(LocalTime startTime) { this.startTime = startTime; return this; }
            public Builder endTime(LocalTime endTime) { this.endTime = endTime; return this; }
            public Builder status(AppointmentStatus status) { this.status = status; return this; }
            public Builder paymentMode(PaymentMode paymentMode) { this.paymentMode = paymentMode; return this; }
            public Builder basePrice(BigDecimal basePrice) { this.basePrice = basePrice; return this; }
            public Builder taxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; return this; }
            public Builder totalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; return this; }
            public Builder paymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; return this; }
            public Builder notes(String notes) { this.notes = notes; return this; }
            public Builder createdAt(ZonedDateTime createdAt) { this.createdAt = createdAt; return this; }

            public AppointmentResponse build() {
                return new AppointmentResponse(id, clientId, clientName, clientEmail, clientPhone, branchId, branchName, branchCity, branchAddress, branchMapsUrl, staffId, staffName, staffSpecialization, staffPhotoUrl, serviceId, serviceName, serviceDurationMinutes, appointmentDate, startTime, endTime, status, paymentMode, basePrice, taxAmount, totalPrice, paymentStatus, notes, createdAt);
            }
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public UUID getClientId() { return clientId; }
        public void setClientId(UUID clientId) { this.clientId = clientId; }
        public String getClientName() { return clientName; }
        public void setClientName(String clientName) { this.clientName = clientName; }
        public String getClientEmail() { return clientEmail; }
        public void setClientEmail(String clientEmail) { this.clientEmail = clientEmail; }
        public String getClientPhone() { return clientPhone; }
        public void setClientPhone(String clientPhone) { this.clientPhone = clientPhone; }
        public UUID getBranchId() { return branchId; }
        public void setBranchId(UUID branchId) { this.branchId = branchId; }
        public String getBranchName() { return branchName; }
        public void setBranchName(String branchName) { this.branchName = branchName; }
        public String getBranchCity() { return branchCity; }
        public void setBranchCity(String branchCity) { this.branchCity = branchCity; }
        public String getBranchAddress() { return branchAddress; }
        public void setBranchAddress(String branchAddress) { this.branchAddress = branchAddress; }
        public String getBranchMapsUrl() { return branchMapsUrl; }
        public void setBranchMapsUrl(String branchMapsUrl) { this.branchMapsUrl = branchMapsUrl; }
        public UUID getStaffId() { return staffId; }
        public void setStaffId(UUID staffId) { this.staffId = staffId; }
        public String getStaffName() { return staffName; }
        public void setStaffName(String staffName) { this.staffName = staffName; }
        public String getStaffSpecialization() { return staffSpecialization; }
        public void setStaffSpecialization(String staffSpecialization) { this.staffSpecialization = staffSpecialization; }
        public String getStaffPhotoUrl() { return staffPhotoUrl; }
        public void setStaffPhotoUrl(String staffPhotoUrl) { this.staffPhotoUrl = staffPhotoUrl; }
        public UUID getServiceId() { return serviceId; }
        public void setServiceId(UUID serviceId) { this.serviceId = serviceId; }
        public String getServiceName() { return serviceName; }
        public void setServiceName(String serviceName) { this.serviceName = serviceName; }
        public Integer getServiceDurationMinutes() { return serviceDurationMinutes; }
        public void setServiceDurationMinutes(Integer serviceDurationMinutes) { this.serviceDurationMinutes = serviceDurationMinutes; }
        public LocalDate getAppointmentDate() { return appointmentDate; }
        public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }
        public LocalTime getStartTime() { return startTime; }
        public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
        public LocalTime getEndTime() { return endTime; }
        public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
        public AppointmentStatus getStatus() { return status; }
        public void setStatus(AppointmentStatus status) { this.status = status; }
        public PaymentMode getPaymentMode() { return paymentMode; }
        public void setPaymentMode(PaymentMode paymentMode) { this.paymentMode = paymentMode; }
        public BigDecimal getBasePrice() { return basePrice; }
        public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }
        public BigDecimal getTaxAmount() { return taxAmount; }
        public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }
        public BigDecimal getTotalPrice() { return totalPrice; }
        public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
        public PaymentStatus getPaymentStatus() { return paymentStatus; }
        public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public ZonedDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class TimeSlotDto {
        private LocalTime startTime;
        private LocalTime endTime;
        private boolean isAvailable;
        private String reason;

        public TimeSlotDto() {}
        public TimeSlotDto(LocalTime startTime, LocalTime endTime, boolean isAvailable, String reason) {
            this.startTime = startTime;
            this.endTime = endTime;
            this.isAvailable = isAvailable;
            this.reason = reason;
        }

        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private LocalTime startTime;
            private LocalTime endTime;
            private boolean isAvailable;
            private String reason;

            public Builder startTime(LocalTime startTime) { this.startTime = startTime; return this; }
            public Builder endTime(LocalTime endTime) { this.endTime = endTime; return this; }
            public Builder isAvailable(boolean isAvailable) { this.isAvailable = isAvailable; return this; }
            public Builder reason(String reason) { this.reason = reason; return this; }

            public TimeSlotDto build() {
                return new TimeSlotDto(startTime, endTime, isAvailable, reason);
            }
        }

        public LocalTime getStartTime() { return startTime; }
        public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
        public LocalTime getEndTime() { return endTime; }
        public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
        public boolean isAvailable() { return isAvailable; }
        public void setAvailable(boolean available) { isAvailable = available; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}
