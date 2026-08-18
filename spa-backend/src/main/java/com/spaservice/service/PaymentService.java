package com.spaservice.service;

import com.spaservice.dto.AuthDtos.AuthResponse;
import com.spaservice.dto.PaymentDtos.*;
import com.spaservice.entity.*;
import com.spaservice.exception.AppException;
import com.spaservice.exception.ResourceNotFoundException;
import com.spaservice.repository.AppointmentRepository;
import com.spaservice.repository.BranchRepository;
import com.spaservice.repository.BranchUnlockRepository;
import com.spaservice.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BranchRepository branchRepository;
    private final BranchUnlockRepository branchUnlockRepository;
    private final AppointmentRepository appointmentRepository;
    private final AuthService authService;

    @Value("${app.razorpay.key-id:rzp_test_SpaServiceMock}")
    private String razorpayKeyId;

    private static final BigDecimal UNLOCK_BASE_PRICE = new BigDecimal("99.00");
    private static final BigDecimal TAX_RATE_2_PERCENT = new BigDecimal("0.0200");
    private static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");

    public PaymentService(PaymentRepository paymentRepository, BranchRepository branchRepository, BranchUnlockRepository branchUnlockRepository, AppointmentRepository appointmentRepository, AuthService authService) {
        this.paymentRepository = paymentRepository;
        this.branchRepository = branchRepository;
        this.branchUnlockRepository = branchUnlockRepository;
        this.appointmentRepository = appointmentRepository;
        this.authService = authService;
    }

    @Transactional
    public PaymentOrderResponse initiateBranchUnlock(UUID branchId, User client) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch", "id", branchId));

        ZonedDateTime now = ZonedDateTime.now(IST_ZONE);

        boolean isAlreadyUnlocked = branchUnlockRepository.isBranchUnlockedForClient(client.getId(), branchId, now);
        if (isAlreadyUnlocked) {
            throw new AppException("Staff availability at " + branch.getName() + " is already unlocked for today.");
        }

        BigDecimal baseAmount = UNLOCK_BASE_PRICE;
        BigDecimal taxAmount = baseAmount.multiply(TAX_RATE_2_PERCENT).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = baseAmount.add(taxAmount).setScale(2, RoundingMode.HALF_UP);

        String razorpayOrderId = "order_unlock_" + UUID.randomUUID().toString().substring(0, 8);

        Payment payment = Payment.builder()
                .client(client)
                .paymentType(PaymentType.BRANCH_UNLOCK)
                .paymentMode(PaymentMode.ONLINE)
                .baseAmount(baseAmount)
                .taxRate(TAX_RATE_2_PERCENT)
                .taxAmount(taxAmount)
                .totalAmount(totalAmount)
                .currency("INR")
                .razorpayOrderId(razorpayOrderId)
                .status(PaymentStatus.PENDING)
                .build();

        payment = paymentRepository.save(payment);

        return PaymentOrderResponse.builder()
                .paymentId(payment.getId())
                .razorpayOrderId(razorpayOrderId)
                .baseAmount(baseAmount)
                .taxRate(TAX_RATE_2_PERCENT)
                .taxAmount(taxAmount)
                .totalAmount(totalAmount)
                .currency("INR")
                .keyId(razorpayKeyId)
                .description("Unlock Staff Availability at " + branch.getName() + " for 1 Day")
                .build();
    }

    @Transactional
    public AuthResponse verifyBranchUnlock(UnlockVerifyRequest request, User client) {
        Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch", "id", request.getBranchId()));

        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "orderId", request.getRazorpayOrderId()));

        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setRazorpaySignature(request.getRazorpaySignature());
        payment.setStatus(PaymentStatus.COMPLETED);
        paymentRepository.save(payment);

        ZonedDateTime nowIst = ZonedDateTime.now(IST_ZONE);
        ZonedDateTime midnightIst = nowIst.toLocalDate().atTime(23, 59, 59).atZone(IST_ZONE);

        BranchUnlock unlock = BranchUnlock.builder()
                .client(client)
                .branch(branch)
                .payment(payment)
                .unlockedAt(nowIst)
                .expiresAt(midnightIst)
                .build();

        branchUnlockRepository.save(unlock);

        return authService.buildAuthResponse(client, null);
    }

    @Transactional
    public PaymentOrderResponse initiateBookingPayment(UUID appointmentId, User client) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        if (!appointment.getClient().getId().equals(client.getId())) {
            throw new AppException("Unauthorized access to this appointment");
        }

        BigDecimal baseAmount = appointment.getBasePrice();
        BigDecimal taxAmount = baseAmount.multiply(TAX_RATE_2_PERCENT).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = baseAmount.add(taxAmount).setScale(2, RoundingMode.HALF_UP);

        String razorpayOrderId = "order_booking_" + UUID.randomUUID().toString().substring(0, 8);

        Payment payment = Payment.builder()
                .client(client)
                .paymentType(PaymentType.SERVICE_BOOKING)
                .paymentMode(PaymentMode.ONLINE)
                .baseAmount(baseAmount)
                .taxRate(TAX_RATE_2_PERCENT)
                .taxAmount(taxAmount)
                .totalAmount(totalAmount)
                .currency("INR")
                .razorpayOrderId(razorpayOrderId)
                .status(PaymentStatus.PENDING)
                .build();

        payment = paymentRepository.save(payment);

        appointment.setTaxAmount(taxAmount);
        appointment.setTotalPrice(totalAmount);
        appointment.setPayment(payment);
        appointmentRepository.save(appointment);

        return PaymentOrderResponse.builder()
                .paymentId(payment.getId())
                .razorpayOrderId(razorpayOrderId)
                .baseAmount(baseAmount)
                .taxRate(TAX_RATE_2_PERCENT)
                .taxAmount(taxAmount)
                .totalAmount(totalAmount)
                .currency("INR")
                .keyId(razorpayKeyId)
                .description("Payment for " + appointment.getService().getName() + " at " + appointment.getBranch().getName())
                .build();
    }

    @Transactional
    public void verifyBookingPayment(BookingPaymentVerifyRequest request, User client) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", request.getAppointmentId()));

        if (!appointment.getClient().getId().equals(client.getId())) {
            throw new AppException("Unauthorized access to this appointment");
        }

        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "orderId", request.getRazorpayOrderId()));

        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setRazorpaySignature(request.getRazorpaySignature());
        payment.setStatus(PaymentStatus.COMPLETED);
        paymentRepository.save(payment);

        appointment.setPaymentStatus(PaymentStatus.COMPLETED);
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointmentRepository.save(appointment);
    }

    @Transactional(readOnly = true)
    public List<PaymentSummaryDto> getAllPaymentsAdmin() {
        return paymentRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToPaymentSummary)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentSummaryDto> getClientPayments(UUID clientId) {
        return paymentRepository.findByClientIdOrderByCreatedAtDesc(clientId).stream()
                .map(this::mapToPaymentSummary)
                .collect(Collectors.toList());
    }

    private PaymentSummaryDto mapToPaymentSummary(Payment p) {
        return PaymentSummaryDto.builder()
                .id(p.getId())
                .clientId(p.getClient().getId())
                .clientName(p.getClient().getFullName())
                .clientEmail(p.getClient().getEmail())
                .paymentType(p.getPaymentType())
                .paymentMode(p.getPaymentMode())
                .baseAmount(p.getBaseAmount())
                .taxAmount(p.getTaxAmount())
                .totalAmount(p.getTotalAmount())
                .currency(p.getCurrency())
                .status(p.getStatus())
                .razorpayOrderId(p.getRazorpayOrderId())
                .razorpayPaymentId(p.getRazorpayPaymentId())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
