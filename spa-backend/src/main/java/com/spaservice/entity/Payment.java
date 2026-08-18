package com.spaservice.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private User client;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type", nullable = false, length = 50)
    private PaymentType paymentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_mode", nullable = false, length = 30)
    private PaymentMode paymentMode = PaymentMode.ONLINE;

    @Column(name = "base_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal baseAmount;

    @Column(name = "tax_rate", nullable = false, precision = 6, scale = 4)
    private BigDecimal taxRate = new BigDecimal("0.0200");

    @Column(name = "tax_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false, length = 10)
    private String currency = "INR";

    @Column(name = "razorpay_order_id", length = 120)
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id", length = 120)
    private String razorpayPaymentId;

    @Column(name = "razorpay_signature")
    private String razorpaySignature;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentStatus status = PaymentStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    public Payment() {}

    public Payment(UUID id, User client, PaymentType paymentType, PaymentMode paymentMode, BigDecimal baseAmount, BigDecimal taxRate, BigDecimal taxAmount, BigDecimal totalAmount, String currency, String razorpayOrderId, String razorpayPaymentId, String razorpaySignature, PaymentStatus status, ZonedDateTime createdAt) {
        this.id = id;
        this.client = client;
        this.paymentType = paymentType;
        this.paymentMode = paymentMode != null ? paymentMode : PaymentMode.ONLINE;
        this.baseAmount = baseAmount;
        this.taxRate = taxRate != null ? taxRate : new BigDecimal("0.0200");
        this.taxAmount = taxAmount != null ? taxAmount : BigDecimal.ZERO;
        this.totalAmount = totalAmount;
        this.currency = currency != null ? currency : "INR";
        this.razorpayOrderId = razorpayOrderId;
        this.razorpayPaymentId = razorpayPaymentId;
        this.razorpaySignature = razorpaySignature;
        this.status = status != null ? status : PaymentStatus.PENDING;
        this.createdAt = createdAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private User client;
        private PaymentType paymentType;
        private PaymentMode paymentMode = PaymentMode.ONLINE;
        private BigDecimal baseAmount;
        private BigDecimal taxRate = new BigDecimal("0.0200");
        private BigDecimal taxAmount = BigDecimal.ZERO;
        private BigDecimal totalAmount;
        private String currency = "INR";
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private String razorpaySignature;
        private PaymentStatus status = PaymentStatus.PENDING;
        private ZonedDateTime createdAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder client(User client) { this.client = client; return this; }
        public Builder paymentType(PaymentType paymentType) { this.paymentType = paymentType; return this; }
        public Builder paymentMode(PaymentMode paymentMode) { this.paymentMode = paymentMode; return this; }
        public Builder baseAmount(BigDecimal baseAmount) { this.baseAmount = baseAmount; return this; }
        public Builder taxRate(BigDecimal taxRate) { this.taxRate = taxRate; return this; }
        public Builder taxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; return this; }
        public Builder totalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; return this; }
        public Builder currency(String currency) { this.currency = currency; return this; }
        public Builder razorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; return this; }
        public Builder razorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; return this; }
        public Builder razorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; return this; }
        public Builder status(PaymentStatus status) { this.status = status; return this; }
        public Builder createdAt(ZonedDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Payment build() {
            return new Payment(id, client, paymentType, paymentMode, baseAmount, taxRate, taxAmount, totalAmount, currency, razorpayOrderId, razorpayPaymentId, razorpaySignature, status, createdAt);
        }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public User getClient() { return client; }
    public void setClient(User client) { this.client = client; }
    public PaymentType getPaymentType() { return paymentType; }
    public void setPaymentType(PaymentType paymentType) { this.paymentType = paymentType; }
    public PaymentMode getPaymentMode() { return paymentMode; }
    public void setPaymentMode(PaymentMode paymentMode) { this.paymentMode = paymentMode; }
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
    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }
    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }
    public String getRazorpaySignature() { return razorpaySignature; }
    public void setRazorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; }
    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }
    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
}
