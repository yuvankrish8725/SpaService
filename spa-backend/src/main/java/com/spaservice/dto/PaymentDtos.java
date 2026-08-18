package com.spaservice.dto;

import com.spaservice.entity.PaymentMode;
import com.spaservice.entity.PaymentStatus;
import com.spaservice.entity.PaymentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

public class PaymentDtos {

    public static class UnlockInitiateRequest {
        @NotNull(message = "Branch ID is required")
        private UUID branchId;

        public UnlockInitiateRequest() {}
        public UnlockInitiateRequest(UUID branchId) { this.branchId = branchId; }
        public UUID getBranchId() { return branchId; }
        public void setBranchId(UUID branchId) { this.branchId = branchId; }
    }

    public static class UnlockVerifyRequest {
        @NotNull(message = "Branch ID is required")
        private UUID branchId;

        @NotBlank(message = "Razorpay Order ID is required")
        private String razorpayOrderId;

        @NotBlank(message = "Razorpay Payment ID is required")
        private String razorpayPaymentId;

        private String razorpaySignature;

        public UnlockVerifyRequest() {}
        public UnlockVerifyRequest(UUID branchId, String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
            this.branchId = branchId;
            this.razorpayOrderId = razorpayOrderId;
            this.razorpayPaymentId = razorpayPaymentId;
            this.razorpaySignature = razorpaySignature;
        }

        public UUID getBranchId() { return branchId; }
        public void setBranchId(UUID branchId) { this.branchId = branchId; }
        public String getRazorpayOrderId() { return razorpayOrderId; }
        public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }
        public String getRazorpayPaymentId() { return razorpayPaymentId; }
        public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }
        public String getRazorpaySignature() { return razorpaySignature; }
        public void setRazorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; }
    }

    public static class BookingPaymentInitiateRequest {
        @NotNull(message = "Appointment ID is required")
        private UUID appointmentId;

        public BookingPaymentInitiateRequest() {}
        public BookingPaymentInitiateRequest(UUID appointmentId) { this.appointmentId = appointmentId; }
        public UUID getAppointmentId() { return appointmentId; }
        public void setAppointmentId(UUID appointmentId) { this.appointmentId = appointmentId; }
    }

    public static class BookingPaymentVerifyRequest {
        @NotNull(message = "Appointment ID is required")
        private UUID appointmentId;

        @NotBlank(message = "Razorpay Order ID is required")
        private String razorpayOrderId;

        @NotBlank(message = "Razorpay Payment ID is required")
        private String razorpayPaymentId;

        private String razorpaySignature;

        public BookingPaymentVerifyRequest() {}
        public BookingPaymentVerifyRequest(UUID appointmentId, String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
            this.appointmentId = appointmentId;
            this.razorpayOrderId = razorpayOrderId;
            this.razorpayPaymentId = razorpayPaymentId;
            this.razorpaySignature = razorpaySignature;
        }

        public UUID getAppointmentId() { return appointmentId; }
        public void setAppointmentId(UUID appointmentId) { this.appointmentId = appointmentId; }
        public String getRazorpayOrderId() { return razorpayOrderId; }
        public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }
        public String getRazorpayPaymentId() { return razorpayPaymentId; }
        public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }
        public String getRazorpaySignature() { return razorpaySignature; }
        public void setRazorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; }
    }

    public static class PaymentOrderResponse {
        private UUID paymentId;
        private String razorpayOrderId;
        private BigDecimal baseAmount;
        private BigDecimal taxRate;
        private BigDecimal taxAmount;
        private BigDecimal totalAmount;
        private String currency;
        private String keyId;
        private String description;

        public PaymentOrderResponse() {}
        public PaymentOrderResponse(UUID paymentId, String razorpayOrderId, BigDecimal baseAmount, BigDecimal taxRate, BigDecimal taxAmount, BigDecimal totalAmount, String currency, String keyId, String description) {
            this.paymentId = paymentId;
            this.razorpayOrderId = razorpayOrderId;
            this.baseAmount = baseAmount;
            this.taxRate = taxRate;
            this.taxAmount = taxAmount;
            this.totalAmount = totalAmount;
            this.currency = currency;
            this.keyId = keyId;
            this.description = description;
        }

        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private UUID paymentId;
            private String razorpayOrderId;
            private BigDecimal baseAmount;
            private BigDecimal taxRate;
            private BigDecimal taxAmount;
            private BigDecimal totalAmount;
            private String currency;
            private String keyId;
            private String description;

            public Builder paymentId(UUID paymentId) { this.paymentId = paymentId; return this; }
            public Builder razorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; return this; }
            public Builder baseAmount(BigDecimal baseAmount) { this.baseAmount = baseAmount; return this; }
            public Builder taxRate(BigDecimal taxRate) { this.taxRate = taxRate; return this; }
            public Builder taxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; return this; }
            public Builder totalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; return this; }
            public Builder currency(String currency) { this.currency = currency; return this; }
            public Builder keyId(String keyId) { this.keyId = keyId; return this; }
            public Builder description(String description) { this.description = description; return this; }

            public PaymentOrderResponse build() {
                return new PaymentOrderResponse(paymentId, razorpayOrderId, baseAmount, taxRate, taxAmount, totalAmount, currency, keyId, description);
            }
        }

        public UUID getPaymentId() { return paymentId; }
        public void setPaymentId(UUID paymentId) { this.paymentId = paymentId; }
        public String getRazorpayOrderId() { return razorpayOrderId; }
        public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }
        public BigDecimal getBaseAmount() { return baseAmount; }
        public void setBaseAmount(BigDecimal baseAmount) { this.baseAmount = baseAmount; }
        public BigDecimal getTaxRate() { return taxRate; }
        public void setTaxRate(BigDecimal taxRate) { this.taxRate = taxRate; }
        public BigDecimal getTaxAmount() { return taxAmount; }
        public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }
        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
        public String getKeyId() { return keyId; }
        public void setKeyId(String keyId) { this.keyId = keyId; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class PaymentSummaryDto {
        private UUID id;
        private UUID clientId;
        private String clientName;
        private String clientEmail;
        private PaymentType paymentType;
        private PaymentMode paymentMode;
        private BigDecimal baseAmount;
        private BigDecimal taxAmount;
        private BigDecimal totalAmount;
        private String currency;
        private PaymentStatus status;
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private ZonedDateTime createdAt;

        public PaymentSummaryDto() {}
        public PaymentSummaryDto(UUID id, UUID clientId, String clientName, String clientEmail, PaymentType paymentType, PaymentMode paymentMode, BigDecimal baseAmount, BigDecimal taxAmount, BigDecimal totalAmount, String currency, PaymentStatus status, String razorpayOrderId, String razorpayPaymentId, ZonedDateTime createdAt) {
            this.id = id;
            this.clientId = clientId;
            this.clientName = clientName;
            this.clientEmail = clientEmail;
            this.paymentType = paymentType;
            this.paymentMode = paymentMode;
            this.baseAmount = baseAmount;
            this.taxAmount = taxAmount;
            this.totalAmount = totalAmount;
            this.currency = currency;
            this.status = status;
            this.razorpayOrderId = razorpayOrderId;
            this.razorpayPaymentId = razorpayPaymentId;
            this.createdAt = createdAt;
        }

        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private UUID id;
            private UUID clientId;
            private String clientName;
            private String clientEmail;
            private PaymentType paymentType;
            private PaymentMode paymentMode;
            private BigDecimal baseAmount;
            private BigDecimal taxAmount;
            private BigDecimal totalAmount;
            private String currency;
            private PaymentStatus status;
            private String razorpayOrderId;
            private String razorpayPaymentId;
            private ZonedDateTime createdAt;

            public Builder id(UUID id) { this.id = id; return this; }
            public Builder clientId(UUID clientId) { this.clientId = clientId; return this; }
            public Builder clientName(String clientName) { this.clientName = clientName; return this; }
            public Builder clientEmail(String clientEmail) { this.clientEmail = clientEmail; return this; }
            public Builder paymentType(PaymentType paymentType) { this.paymentType = paymentType; return this; }
            public Builder paymentMode(PaymentMode paymentMode) { this.paymentMode = paymentMode; return this; }
            public Builder baseAmount(BigDecimal baseAmount) { this.baseAmount = baseAmount; return this; }
            public Builder taxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; return this; }
            public Builder totalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; return this; }
            public Builder currency(String currency) { this.currency = currency; return this; }
            public Builder status(PaymentStatus status) { this.status = status; return this; }
            public Builder razorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; return this; }
            public Builder razorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; return this; }
            public Builder createdAt(ZonedDateTime createdAt) { this.createdAt = createdAt; return this; }

            public PaymentSummaryDto build() {
                return new PaymentSummaryDto(id, clientId, clientName, clientEmail, paymentType, paymentMode, baseAmount, taxAmount, totalAmount, currency, status, razorpayOrderId, razorpayPaymentId, createdAt);
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
        public PaymentType getPaymentType() { return paymentType; }
        public void setPaymentType(PaymentType paymentType) { this.paymentType = paymentType; }
        public PaymentMode getPaymentMode() { return paymentMode; }
        public void setPaymentMode(PaymentMode paymentMode) { this.paymentMode = paymentMode; }
        public BigDecimal getBaseAmount() { return baseAmount; }
        public void setBaseAmount(BigDecimal baseAmount) { this.baseAmount = baseAmount; }
        public BigDecimal getTaxAmount() { return taxAmount; }
        public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }
        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
        public PaymentStatus getStatus() { return status; }
        public void setStatus(PaymentStatus status) { this.status = status; }
        public String getRazorpayOrderId() { return razorpayOrderId; }
        public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }
        public String getRazorpayPaymentId() { return razorpayPaymentId; }
        public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }
        public ZonedDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
    }
}
