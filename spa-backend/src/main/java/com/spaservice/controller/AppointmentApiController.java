package com.spaservice.controller;

import com.spaservice.dto.ApiResponse;
import com.spaservice.dto.AppointmentDtos.AppointmentCreateRequest;
import com.spaservice.dto.AppointmentDtos.AppointmentResponse;
import com.spaservice.dto.AppointmentDtos.TimeSlotDto;
import com.spaservice.entity.User;
import com.spaservice.repository.UserRepository;
import com.spaservice.security.CustomUserDetails;
import com.spaservice.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/appointments")
public class AppointmentApiController {

    private final AppointmentService appointmentService;
    private final UserRepository userRepository;

    public AppointmentApiController(AppointmentService appointmentService, UserRepository userRepository) {
        this.appointmentService = appointmentService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponse>> createAppointment(
            @Valid @RequestBody AppointmentCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User client = userRepository.findById(userDetails.getId()).orElseThrow();
        AppointmentResponse response = appointmentService.createAppointment(request, client);
        return ResponseEntity.ok(ApiResponse.ok("Appointment reserved successfully", response));
    }

    @GetMapping("/slots")
    public ResponseEntity<ApiResponse<List<TimeSlotDto>>> getAvailableSlots(
            @RequestParam UUID branchId,
            @RequestParam UUID staffId,
            @RequestParam UUID serviceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User client = userRepository.findById(userDetails.getId()).orElseThrow();
        List<TimeSlotDto> slots = appointmentService.getAvailableSlots(branchId, staffId, serviceId, date, client);
        return ResponseEntity.ok(ApiResponse.ok(slots));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getMyAppointments(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.getClientAppointments(userDetails.getId())));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelAppointment(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User client = userRepository.findById(userDetails.getId()).orElseThrow();
        appointmentService.cancelAppointment(id, client);
        return ResponseEntity.ok(ApiResponse.ok("Appointment cancelled", null));
    }
}
