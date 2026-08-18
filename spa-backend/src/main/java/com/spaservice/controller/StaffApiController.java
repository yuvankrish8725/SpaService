package com.spaservice.controller;

import com.spaservice.dto.ApiResponse;
import com.spaservice.dto.StaffDtos.StaffCardResponse;
import com.spaservice.entity.User;
import com.spaservice.repository.UserRepository;
import com.spaservice.security.CustomUserDetails;
import com.spaservice.service.StaffService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/branches")
public class StaffApiController {

    private final StaffService staffService;
    private final UserRepository userRepository;

    public StaffApiController(StaffService staffService, UserRepository userRepository) {
        this.staffService = staffService;
        this.userRepository = userRepository;
    }

    @GetMapping("/{id}/staff")
    public ResponseEntity<ApiResponse<List<StaffCardResponse>>> getStaffForBranch(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User client = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<StaffCardResponse> staffList = staffService.getStaffForBranchClient(id, client);
        return ResponseEntity.ok(ApiResponse.ok(staffList));
    }
}
