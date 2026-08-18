package com.spaservice.controller;

import com.spaservice.dto.ApiResponse;
import com.spaservice.dto.CheckinDtos.BranchCheckinStatusResponse;
import com.spaservice.dto.CheckinDtos.CheckinRequest;
import com.spaservice.dto.StaffDtos.ProfilePhotoUpdateRequest;
import com.spaservice.dto.StaffDtos.StaffCardResponse;
import com.spaservice.entity.User;
import com.spaservice.exception.AppException;
import com.spaservice.repository.UserRepository;
import com.spaservice.security.CustomUserDetails;
import com.spaservice.service.AgentService;
import com.spaservice.service.StaffService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/agent")
@PreAuthorize("hasAnyRole('AGENT', 'ADMIN', 'SUPER_ADMIN')")
public class AgentApiController {

    private final AgentService agentService;
    private final StaffService staffService;
    private final UserRepository userRepository;

    public AgentApiController(AgentService agentService, StaffService staffService, UserRepository userRepository) {
        this.agentService = agentService;
        this.staffService = staffService;
        this.userRepository = userRepository;
    }

    @GetMapping("/staff")
    public ResponseEntity<ApiResponse<List<StaffCardResponse>>> getAgentStaff(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        UUID branchId = userDetails.getAssignedBranchId();
        if (branchId == null && userDetails.getRole() == com.spaservice.entity.Role.AGENT) {
            throw new AppException("No branch assigned to this agent");
        }
        return ResponseEntity.ok(ApiResponse.ok(staffService.getStaffCardsForBranch(branchId)));
    }

    @PutMapping("/staff/{staffId}/profile-photo")
    public ResponseEntity<ApiResponse<Void>> updateStaffProfilePhoto(
            @PathVariable UUID staffId,
            @Valid @RequestBody ProfilePhotoUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        staffService.updateStaffProfilePhoto(staffId, request.getPhotoUrl(), user, userDetails.getAssignedBranchId());
        return ResponseEntity.ok(ApiResponse.ok("Profile photo updated successfully", null));
    }

    @PostMapping("/staff/{staffId}/checkin")
    public ResponseEntity<ApiResponse<Void>> confirmDailyCheckin(
            @PathVariable UUID staffId,
            @Valid @RequestBody CheckinRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        agentService.confirmCheckin(staffId, request, user, userDetails.getAssignedBranchId());
        return ResponseEntity.ok(ApiResponse.ok("Check-in status updated successfully", null));
    }

    @GetMapping("/branch/checkin-status")
    public ResponseEntity<ApiResponse<BranchCheckinStatusResponse>> getTodayBranchCheckinStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        UUID branchId = userDetails.getAssignedBranchId();
        if (branchId == null) {
            throw new AppException("No branch assigned to this agent");
        }

        BranchCheckinStatusResponse response = agentService.getBranchCheckinStatus(branchId, LocalDate.now());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
