package com.spaservice.service;

import com.spaservice.dto.AppointmentDtos.*;
import com.spaservice.entity.*;
import com.spaservice.exception.AppException;
import com.spaservice.exception.BranchLockedException;
import com.spaservice.exception.ResourceNotFoundException;
import com.spaservice.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final BranchRepository branchRepository;
    private final WorkingStaffRepository staffRepository;
    private final SpaServiceRepository serviceRepository;
    private final BranchUnlockRepository branchUnlockRepository;
    private final StaffDailyCheckinRepository checkinRepository;
    private final StaffProfilePhotoRepository photoRepository;

    private static final BigDecimal TAX_RATE_2_PERCENT = new BigDecimal("0.0200");

    public AppointmentService(AppointmentRepository appointmentRepository, BranchRepository branchRepository, WorkingStaffRepository staffRepository, SpaServiceRepository serviceRepository, BranchUnlockRepository branchUnlockRepository, StaffDailyCheckinRepository checkinRepository, StaffProfilePhotoRepository photoRepository) {
        this.appointmentRepository = appointmentRepository;
        this.branchRepository = branchRepository;
        this.staffRepository = staffRepository;
        this.serviceRepository = serviceRepository;
        this.branchUnlockRepository = branchUnlockRepository;
        this.checkinRepository = checkinRepository;
        this.photoRepository = photoRepository;
    }

    @Transactional
    public AppointmentResponse createAppointment(AppointmentCreateRequest request, User client) {
        Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch", "id", request.getBranchId()));

        if (client.getRole() != Role.ADMIN && client.getRole() != Role.SUPER_ADMIN) {
            boolean isUnlocked = branchUnlockRepository.isBranchUnlockedForClient(client.getId(), branch.getId(), ZonedDateTime.now());
            if (!isUnlocked) {
                throw new BranchLockedException(branch.getId(), branch.getName());
            }
        }

        WorkingStaff staff = staffRepository.findById(request.getStaffId())
                .orElseThrow(() -> new ResourceNotFoundException("Staff", "id", request.getStaffId()));

        if (!staff.getBranch().getId().equals(branch.getId())) {
            throw new AppException("Therapist does not belong to the selected branch");
        }

        Optional<StaffDailyCheckin> checkinOpt = checkinRepository.findByStaffIdAndBranchIdAndCheckinDate(
                staff.getId(), branch.getId(), request.getAppointmentDate());
        if (checkinOpt.isPresent() && checkinOpt.get().getStatus() == CheckinStatus.ON_LEAVE) {
            throw new AppException("Therapist " + staff.getName() + " is marked on leave for " + request.getAppointmentDate());
        }

        SpaServiceEntity service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", request.getServiceId()));

        LocalTime startTime = request.getStartTime();
        LocalTime endTime = startTime.plusMinutes(service.getDurationMinutes());

        if (startTime.isBefore(branch.getOpenTime()) || endTime.isAfter(branch.getCloseTime())) {
            throw new AppException(String.format("Appointment must be between %s and %s", branch.getOpenTime(), branch.getCloseTime()));
        }

        List<Appointment> existingBookings = appointmentRepository.findActiveBookingsForStaffOnDate(staff.getId(), request.getAppointmentDate());
        for (Appointment existing : existingBookings) {
            boolean overlaps = (startTime.isBefore(existing.getEndTime()) && endTime.isAfter(existing.getStartTime()));
            if (overlaps) {
                throw new AppException(String.format("Therapist is already booked between %s and %s", existing.getStartTime(), existing.getEndTime()));
            }
        }

        BigDecimal basePrice = service.getPrice();
        BigDecimal taxAmount = BigDecimal.ZERO;
        BigDecimal totalPrice = basePrice;
        PaymentStatus paymentStatus = PaymentStatus.PENDING;
        AppointmentStatus appointmentStatus = AppointmentStatus.CONFIRMED;

        if (request.getPaymentMode() == PaymentMode.ONLINE) {
            taxAmount = basePrice.multiply(TAX_RATE_2_PERCENT).setScale(2, RoundingMode.HALF_UP);
            totalPrice = basePrice.add(taxAmount).setScale(2, RoundingMode.HALF_UP);
            appointmentStatus = AppointmentStatus.PENDING;
        }

        Appointment appointment = Appointment.builder()
                .client(client)
                .staff(staff)
                .service(service)
                .branch(branch)
                .appointmentDate(request.getAppointmentDate())
                .startTime(startTime)
                .endTime(endTime)
                .status(appointmentStatus)
                .paymentMode(request.getPaymentMode())
                .basePrice(basePrice)
                .taxAmount(taxAmount)
                .totalPrice(totalPrice)
                .paymentStatus(paymentStatus)
                .notes(request.getNotes())
                .build();

        appointment = appointmentRepository.save(appointment);

        return mapToAppointmentResponse(appointment);
    }

    @Transactional(readOnly = true)
    public List<TimeSlotDto> getAvailableSlots(UUID branchId, UUID staffId, UUID serviceId, LocalDate date, User client) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch", "id", branchId));

        SpaServiceEntity service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", serviceId));

        List<Appointment> existingBookings = staffId != null
                ? appointmentRepository.findActiveBookingsForStaffOnDate(staffId, date)
                : List.of();

        List<TimeSlotDto> slots = new ArrayList<>();
        LocalTime current = branch.getOpenTime();
        int duration = service.getDurationMinutes();

        while (current.plusMinutes(duration).isBefore(branch.getCloseTime()) || current.plusMinutes(duration).equals(branch.getCloseTime())) {
            LocalTime slotEnd = current.plusMinutes(duration);
            LocalTime slotStart = current;

            boolean isOverlapping = existingBookings.stream().anyMatch(b ->
                    slotStart.isBefore(b.getEndTime()) && slotEnd.isAfter(b.getStartTime())
            );

            slots.add(TimeSlotDto.builder()
                    .startTime(slotStart)
                    .endTime(slotEnd)
                    .isAvailable(!isOverlapping)
                    .reason(isOverlapping ? "Booked" : "Available")
                    .build());

            current = current.plusMinutes(30);
        }

        return slots;
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getClientAppointments(UUID clientId) {
        return appointmentRepository.findByClientIdOrderByAppointmentDateDescStartTimeDesc(clientId).stream()
                .map(this::mapToAppointmentResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAllAppointmentsAdmin() {
        return appointmentRepository.findAllByOrderByAppointmentDateDescStartTimeDesc().stream()
                .map(this::mapToAppointmentResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void cancelAppointment(UUID appointmentId, User client) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        if (client.getRole() == Role.CLIENT && !appointment.getClient().getId().equals(client.getId())) {
            throw new AppException("Unauthorized to cancel this appointment");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
    }

    @Transactional
    public void updateStatusAdmin(UUID appointmentId, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));
        appointment.setStatus(status);
        appointmentRepository.save(appointment);
    }

    private AppointmentResponse mapToAppointmentResponse(Appointment a) {
        Optional<StaffProfilePhoto> photoOpt = photoRepository.findByStaffId(a.getStaff().getId());
        String photoUrl = photoOpt.map(StaffProfilePhoto::getPhotoUrl).orElse(null);

        return AppointmentResponse.builder()
                .id(a.getId())
                .clientId(a.getClient().getId())
                .clientName(a.getClient().getFullName())
                .clientEmail(a.getClient().getEmail())
                .clientPhone(a.getClient().getPhone())
                .branchId(a.getBranch().getId())
                .branchName(a.getBranch().getName())
                .branchCity(a.getBranch().getCity())
                .branchAddress(a.getBranch().getAddress())
                .branchMapsUrl(a.getBranch().getMapsUrl())
                .staffId(a.getStaff().getId())
                .staffName(a.getStaff().getName())
                .staffSpecialization(a.getStaff().getSpecialization())
                .staffPhotoUrl(photoUrl)
                .serviceId(a.getService().getId())
                .serviceName(a.getService().getName())
                .serviceDurationMinutes(a.getService().getDurationMinutes())
                .appointmentDate(a.getAppointmentDate())
                .startTime(a.getStartTime())
                .endTime(a.getEndTime())
                .status(a.getStatus())
                .paymentMode(a.getPaymentMode())
                .basePrice(a.getBasePrice())
                .taxAmount(a.getTaxAmount())
                .totalPrice(a.getTotalPrice())
                .paymentStatus(a.getPaymentStatus())
                .notes(a.getNotes())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
