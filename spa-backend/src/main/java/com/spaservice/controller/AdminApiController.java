package com.spaservice.controller;

import com.spaservice.dto.AgentDtos.AgentCreateRequest;
import com.spaservice.dto.AgentDtos.AgentResponse;
import com.spaservice.dto.ApiResponse;
import com.spaservice.dto.AppointmentDtos.AppointmentResponse;
import com.spaservice.dto.BranchDtos.BranchRequest;
import com.spaservice.dto.BranchDtos.BranchResponse;
import com.spaservice.dto.CheckinDtos.BranchCheckinStatusResponse;
import com.spaservice.dto.CheckinDtos.CheckinRequest;
import com.spaservice.dto.PaymentDtos.PaymentSummaryDto;
import com.spaservice.dto.ServiceDtos.SpaServiceRequest;
import com.spaservice.dto.ServiceDtos.SpaServiceResponse;
import com.spaservice.dto.StaffDtos.*;
import com.spaservice.entity.AppointmentStatus;
import com.spaservice.entity.User;
import com.spaservice.repository.AppointmentRepository;
import com.spaservice.repository.BranchRepository;
import com.spaservice.repository.UserRepository;
import com.spaservice.repository.WorkingStaffRepository;
import com.spaservice.security.CustomUserDetails;
import com.spaservice.service.*;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class AdminApiController {

    private final BranchService branchService;
    private final StaffService staffService;
    private final AgentService agentService;
    private final SpaCatalogService serviceCatalogService;
    private final AppointmentService appointmentService;
    private final PaymentService paymentService;
    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final WorkingStaffRepository workingStaffRepository;
    private final AppointmentRepository appointmentRepository;

    public AdminApiController(BranchService branchService, StaffService staffService, AgentService agentService, SpaCatalogService serviceCatalogService, AppointmentService appointmentService, PaymentService paymentService, UserRepository userRepository, BranchRepository branchRepository, WorkingStaffRepository workingStaffRepository, AppointmentRepository appointmentRepository) {
        this.branchService = branchService;
        this.staffService = staffService;
        this.agentService = agentService;
        this.serviceCatalogService = serviceCatalogService;
        this.appointmentService = appointmentService;
        this.paymentService = paymentService;
        this.userRepository = userRepository;
        this.branchRepository = branchRepository;
        this.workingStaffRepository = workingStaffRepository;
        this.appointmentRepository = appointmentRepository;
    }

    // === Dashboard Overview ===
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBranches", branchRepository.count());
        stats.put("totalStaff", workingStaffRepository.count());
        stats.put("totalClients", userRepository.count());
        stats.put("totalAppointments", appointmentRepository.count());
        
        List<PaymentSummaryDto> payments = paymentService.getAllPaymentsAdmin();
        BigDecimal totalRevenue = payments.stream()
                .filter(p -> p.getStatus() == com.spaservice.entity.PaymentStatus.COMPLETED)
                .map(PaymentSummaryDto::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("totalRevenue", totalRevenue);

        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    // === Branch Management ===
    @GetMapping("/branches")
    public ResponseEntity<ApiResponse<List<BranchResponse>>> getAllBranches() {
        return ResponseEntity.ok(ApiResponse.ok(branchService.getAllBranchesAdmin()));
    }

    @PostMapping("/branches")
    public ResponseEntity<ApiResponse<BranchResponse>> createBranch(
            @Valid @RequestBody BranchRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok("Branch created successfully", branchService.createBranch(request, userDetails.getId())));
    }

    @PutMapping("/branches/{id}")
    public ResponseEntity<ApiResponse<BranchResponse>> updateBranch(
            @PathVariable UUID id,
            @Valid @RequestBody BranchRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Branch updated successfully", branchService.updateBranch(id, request)));
    }

    @PatchMapping("/branches/{id}/status")
    public ResponseEntity<ApiResponse<Void>> toggleBranchStatus(
            @PathVariable UUID id,
            @RequestParam boolean active) {
        branchService.toggleBranchStatus(id, active);
        return ResponseEntity.ok(ApiResponse.ok("Branch status updated", null));
    }

    // === Staff Management ===
    @GetMapping("/staff")
    public ResponseEntity<ApiResponse<List<StaffCardResponse>>> getAllStaff(
            @RequestParam(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(staffService.getAllStaffAdmin(branchId)));
    }

    @PostMapping("/staff")
    public ResponseEntity<ApiResponse<StaffCardResponse>> createStaff(
            @Valid @RequestBody StaffRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok("Staff created successfully", staffService.createStaff(request, userDetails.getId())));
    }

    @PutMapping("/staff/{id}")
    public ResponseEntity<ApiResponse<StaffCardResponse>> updateStaff(
            @PathVariable UUID id,
            @Valid @RequestBody StaffRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Staff updated successfully", staffService.updateStaff(id, request)));
    }

    @PutMapping("/staff/{id}/profile-photo")
    public ResponseEntity<ApiResponse<Void>> updateStaffProfilePhoto(
            @PathVariable UUID id,
            @Valid @RequestBody ProfilePhotoUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User admin = userRepository.findById(userDetails.getId()).orElseThrow();
        staffService.updateStaffProfilePhoto(id, request.getPhotoUrl(), admin, null);
        return ResponseEntity.ok(ApiResponse.ok("Profile photo updated", null));
    }

    @DeleteMapping("/staff/{id}/profile-photo")
    public ResponseEntity<ApiResponse<Void>> deleteStaffProfilePhoto(@PathVariable UUID id) {
        staffService.deleteStaffProfilePhotoAdmin(id);
        return ResponseEntity.ok(ApiResponse.ok("Profile photo deleted", null));
    }

    @PostMapping("/staff/{id}/assign-branch")
    public ResponseEntity<ApiResponse<StaffCardResponse>> assignStaffToBranch(
            @PathVariable UUID id,
            @Valid @RequestBody StaffBranchAssignRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Staff branch reassigned successfully", staffService.assignStaffToBranch(id, request.getBranchId())));
    }

    @PutMapping("/staff/{id}/gallery")
    public ResponseEntity<ApiResponse<StaffCardResponse>> updateStaffGallery(
            @PathVariable UUID id,
            @RequestBody StaffGalleryUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User admin = userRepository.findById(userDetails.getId()).orElseThrow();
        return ResponseEntity.ok(ApiResponse.ok("Staff gallery updated successfully", staffService.updateStaffGallery(id, request.getGalleryPhotoUrls(), admin, null)));
    }

    @PatchMapping("/staff/{id}/status")
    public ResponseEntity<ApiResponse<Void>> toggleStaffStatus(
            @PathVariable UUID id,
            @RequestParam boolean active) {
        staffService.toggleStaffStatus(id, active);
        return ResponseEntity.ok(ApiResponse.ok("Staff status updated", null));
    }

    // === Agent Management ===
    @GetMapping("/agents")
    public ResponseEntity<ApiResponse<List<AgentResponse>>> getAllAgents() {
        return ResponseEntity.ok(ApiResponse.ok(agentService.getAllAgents()));
    }

    @PostMapping("/agents")
    public ResponseEntity<ApiResponse<AgentResponse>> createAgent(
            @Valid @RequestBody AgentCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok("Agent created successfully", agentService.createAgent(request, userDetails.getId())));
    }

    @PatchMapping("/agents/{id}/status")
    public ResponseEntity<ApiResponse<Void>> toggleAgentStatus(
            @PathVariable UUID id,
            @RequestParam boolean active) {
        agentService.toggleAgentStatus(id, active);
        return ResponseEntity.ok(ApiResponse.ok("Agent status updated", null));
    }

    // === Check-in Compliance ===
    @GetMapping("/branches/{branchId}/checkin-status")
    public ResponseEntity<ApiResponse<BranchCheckinStatusResponse>> getBranchCheckinStatus(
            @PathVariable UUID branchId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.ok(agentService.getBranchCheckinStatus(branchId, date)));
    }

    @PostMapping("/staff/{staffId}/checkin")
    public ResponseEntity<ApiResponse<Void>> overrideStaffCheckin(
            @PathVariable UUID staffId,
            @Valid @RequestBody CheckinRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User admin = userRepository.findById(userDetails.getId()).orElseThrow();
        agentService.confirmCheckin(staffId, request, admin, null);
        return ResponseEntity.ok(ApiResponse.ok("Checkin overridden by admin", null));
    }

    // === Service Catalog ===
    @GetMapping("/services")
    public ResponseEntity<ApiResponse<List<SpaServiceResponse>>> getAllServices() {
        return ResponseEntity.ok(ApiResponse.ok(serviceCatalogService.getAllServicesAdmin()));
    }

    @PostMapping("/services")
    public ResponseEntity<ApiResponse<SpaServiceResponse>> createService(@Valid @RequestBody SpaServiceRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Service created successfully", serviceCatalogService.createService(request)));
    }

    @PutMapping("/services/{id}")
    public ResponseEntity<ApiResponse<SpaServiceResponse>> updateService(
            @PathVariable UUID id,
            @Valid @RequestBody SpaServiceRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Service updated successfully", serviceCatalogService.updateService(id, request)));
    }

    @PatchMapping("/services/{id}/status")
    public ResponseEntity<ApiResponse<Void>> toggleServiceStatus(
            @PathVariable UUID id,
            @RequestParam boolean active) {
        serviceCatalogService.toggleServiceStatus(id, active);
        return ResponseEntity.ok(ApiResponse.ok("Service status updated", null));
    }

    // === Appointments Management ===
    @GetMapping("/appointments")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getAllAppointments() {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.getAllAppointmentsAdmin()));
    }

    @PatchMapping("/appointments/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateAppointmentStatus(
            @PathVariable UUID id,
            @RequestParam AppointmentStatus status) {
        appointmentService.updateStatusAdmin(id, status);
        return ResponseEntity.ok(ApiResponse.ok("Appointment status updated", null));
    }

    // === Payments Management ===
    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<List<PaymentSummaryDto>>> getAllPayments() {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.getAllPaymentsAdmin()));
    }
}
