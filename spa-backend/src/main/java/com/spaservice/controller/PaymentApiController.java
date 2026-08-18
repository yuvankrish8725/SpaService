package com.spaservice.controller;

import com.spaservice.dto.ApiResponse;
import com.spaservice.dto.AuthDtos.AuthResponse;
import com.spaservice.dto.PaymentDtos.*;
import com.spaservice.entity.User;
import com.spaservice.repository.UserRepository;
import com.spaservice.security.CustomUserDetails;
import com.spaservice.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentApiController {

    private final PaymentService paymentService;
    private final UserRepository userRepository;

    public PaymentApiController(PaymentService paymentService, UserRepository userRepository) {
        this.paymentService = paymentService;
        this.userRepository = userRepository;
    }

    @PostMapping("/branch-unlock/initiate")
    public ResponseEntity<ApiResponse<PaymentOrderResponse>> initiateBranchUnlock(
            @Valid @RequestBody UnlockInitiateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User client = userRepository.findById(userDetails.getId()).orElseThrow();
        PaymentOrderResponse response = paymentService.initiateBranchUnlock(request.getBranchId(), client);
        return ResponseEntity.ok(ApiResponse.ok("Unlock payment initiated", response));
    }

    @PostMapping("/branch-unlock/verify")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyBranchUnlock(
            @Valid @RequestBody UnlockVerifyRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User client = userRepository.findById(userDetails.getId()).orElseThrow();
        AuthResponse response = paymentService.verifyBranchUnlock(request, client);
        return ResponseEntity.ok(ApiResponse.ok("Branch unlocked successfully for 1 day!", response));
    }

    @PostMapping("/booking/initiate")
    public ResponseEntity<ApiResponse<PaymentOrderResponse>> initiateBookingPayment(
            @Valid @RequestBody BookingPaymentInitiateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User client = userRepository.findById(userDetails.getId()).orElseThrow();
        PaymentOrderResponse response = paymentService.initiateBookingPayment(request.getAppointmentId(), client);
        return ResponseEntity.ok(ApiResponse.ok("Booking payment initiated with 2% tax", response));
    }

    @PostMapping("/booking/verify")
    public ResponseEntity<ApiResponse<Void>> verifyBookingPayment(
            @Valid @RequestBody BookingPaymentVerifyRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User client = userRepository.findById(userDetails.getId()).orElseThrow();
        paymentService.verifyBookingPayment(request, client);
        return ResponseEntity.ok(ApiResponse.ok("Appointment booking payment confirmed!", null));
    }
}
