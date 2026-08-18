package com.spaservice.controller;

import com.spaservice.dto.ApiResponse;
import com.spaservice.dto.AuthDtos.BranchUnlockDto;
import com.spaservice.dto.AuthDtos.UserDto;
import com.spaservice.dto.PaymentDtos.PaymentSummaryDto;
import com.spaservice.entity.BranchUnlock;
import com.spaservice.entity.User;
import com.spaservice.repository.BranchUnlockRepository;
import com.spaservice.repository.UserRepository;
import com.spaservice.security.CustomUserDetails;
import com.spaservice.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/client")
public class ClientApiController {

    private final UserRepository userRepository;
    private final BranchUnlockRepository branchUnlockRepository;
    private final PaymentService paymentService;

    public ClientApiController(UserRepository userRepository, BranchUnlockRepository branchUnlockRepository, PaymentService paymentService) {
        this.userRepository = userRepository;
        this.branchUnlockRepository = branchUnlockRepository;
        this.paymentService = paymentService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> getProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        return ResponseEntity.ok(ApiResponse.ok(UserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .build()));
    }

    @GetMapping("/unlocks")
    public ResponseEntity<ApiResponse<List<BranchUnlockDto>>> getMyActiveUnlocks(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<BranchUnlock> activeUnlocks = branchUnlockRepository.findAllActiveClientUnlocks(
                userDetails.getId(), ZonedDateTime.now());

        List<BranchUnlockDto> dtos = activeUnlocks.stream()
                .map(u -> BranchUnlockDto.builder()
                        .branchId(u.getBranch().getId())
                        .branchName(u.getBranch().getName())
                        .expiresAt(u.getExpiresAt())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok(dtos));
    }

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<List<PaymentSummaryDto>>> getMyPayments(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.getClientPayments(userDetails.getId())));
    }
}
