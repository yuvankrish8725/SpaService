package com.spaservice.service;

import com.spaservice.dto.StaffDtos.*;
import com.spaservice.entity.*;
import com.spaservice.exception.BranchLockedException;
import com.spaservice.exception.ResourceNotFoundException;
import com.spaservice.exception.UnauthorizedException;
import com.spaservice.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StaffService {

    private final WorkingStaffRepository staffRepository;
    private final StaffProfilePhotoRepository photoRepository;
    private final StaffDailyCheckinRepository checkinRepository;
    private final BranchRepository branchRepository;
    private final BranchUnlockRepository branchUnlockRepository;

    public StaffService(WorkingStaffRepository staffRepository, StaffProfilePhotoRepository photoRepository, StaffDailyCheckinRepository checkinRepository, BranchRepository branchRepository, BranchUnlockRepository branchUnlockRepository) {
        this.staffRepository = staffRepository;
        this.photoRepository = photoRepository;
        this.checkinRepository = checkinRepository;
        this.branchRepository = branchRepository;
        this.branchUnlockRepository = branchUnlockRepository;
    }

    @Transactional(readOnly = true)
    public List<StaffCardResponse> getStaffForBranchClient(UUID branchId, User clientUser) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch", "id", branchId));

        // Super Admin & Admin bypass paywall
        boolean isStaffOrAdmin = clientUser.getRole() == Role.ADMIN || clientUser.getRole() == Role.SUPER_ADMIN;

        if (!isStaffOrAdmin) {
            ZonedDateTime nowIst = ZonedDateTime.now(ZoneId.of("Asia/Kolkata"));
            boolean isUnlocked = branchUnlockRepository.isBranchUnlockedForClient(clientUser.getId(), branchId, nowIst);
            if (!isUnlocked) {
                throw new BranchLockedException(branchId, branch.getName());
            }
        }

        return getStaffCardsForBranch(branchId);
    }

    @Transactional(readOnly = true)
    public List<StaffCardResponse> getStaffCardsForBranch(UUID branchId) {
        List<WorkingStaff> staffList = staffRepository.findByBranchIdAndIsActiveTrue(branchId);
        LocalDate today = LocalDate.now();

        return staffList.stream()
                .map(staff -> mapToStaffCardResponse(staff, today))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<StaffCardResponse> getAllStaffAdmin(UUID branchId) {
        List<WorkingStaff> staffList = branchId != null
                ? staffRepository.findByBranchId(branchId)
                : staffRepository.findAll();
        LocalDate today = LocalDate.now();

        return staffList.stream()
                .map(staff -> mapToStaffCardResponse(staff, today))
                .collect(Collectors.toList());
    }

    @Transactional
    public StaffCardResponse createStaff(StaffRequest request, UUID adminUserId) {
        Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch", "id", request.getBranchId()));

        WorkingStaff staff = WorkingStaff.builder()
                .branch(branch)
                .name(request.getName())
                .specialization(request.getSpecialization())
                .bio(request.getBio())
                .isActive(true)
                .build();

        staff = staffRepository.save(staff);

        if (request.getProfilePhotoUrl() != null && !request.getProfilePhotoUrl().isBlank()) {
            StaffProfilePhoto photo = StaffProfilePhoto.builder()
                    .staff(staff)
                    .photoUrl(request.getProfilePhotoUrl())
                    .uploadedBy(adminUserId)
                    .build();
            photoRepository.save(photo);
        }

        return mapToStaffCardResponse(staff, LocalDate.now());
    }

    @Transactional
    public StaffCardResponse updateStaff(UUID staffId, StaffRequest request) {
        WorkingStaff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", "id", staffId));

        if (request.getBranchId() != null && !staff.getBranch().getId().equals(request.getBranchId())) {
            Branch branch = branchRepository.findById(request.getBranchId())
                    .orElseThrow(() -> new ResourceNotFoundException("Branch", "id", request.getBranchId()));
            staff.setBranch(branch);
        }

        staff.setName(request.getName());
        staff.setSpecialization(request.getSpecialization());
        staff.setBio(request.getBio());

        staff = staffRepository.save(staff);

        if (request.getProfilePhotoUrl() != null && !request.getProfilePhotoUrl().isBlank()) {
            Optional<StaffProfilePhoto> photoOpt = photoRepository.findByStaffId(staffId);
            if (photoOpt.isPresent()) {
                StaffProfilePhoto photo = photoOpt.get();
                photo.setPhotoUrl(request.getProfilePhotoUrl());
                photoRepository.save(photo);
            } else {
                StaffProfilePhoto photo = StaffProfilePhoto.builder()
                        .staff(staff)
                        .photoUrl(request.getProfilePhotoUrl())
                        .build();
                photoRepository.save(photo);
            }
        }

        return mapToStaffCardResponse(staff, LocalDate.now());
    }

    @Transactional
    public void updateStaffProfilePhoto(UUID staffId, String photoUrl, User actorUser, UUID agentAssignedBranchId) {
        WorkingStaff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", "id", staffId));

        // If Agent, verify staff belongs to their assigned branch
        if (actorUser.getRole() == Role.AGENT) {
            if (agentAssignedBranchId == null || !staff.getBranch().getId().equals(agentAssignedBranchId)) {
                throw new UnauthorizedException("You can only update profile photos for staff at your assigned branch");
            }
        }

        Optional<StaffProfilePhoto> photoOpt = photoRepository.findByStaffId(staffId);
        if (photoOpt.isPresent()) {
            StaffProfilePhoto photo = photoOpt.get();
            photo.setPhotoUrl(photoUrl);
            photo.setUploadedBy(actorUser.getId());
            photoRepository.save(photo);
        } else {
            StaffProfilePhoto photo = StaffProfilePhoto.builder()
                    .staff(staff)
                    .photoUrl(photoUrl)
                    .uploadedBy(actorUser.getId())
                    .build();
            photoRepository.save(photo);
        }
    }

    @Transactional
    public void deleteStaffProfilePhotoAdmin(UUID staffId) {
        photoRepository.deleteByStaffId(staffId);
    }

    @Transactional
    public void toggleStaffStatus(UUID staffId, boolean active) {
        WorkingStaff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", "id", staffId));
        staff.setIsActive(active);
        staffRepository.save(staff);
    }

    private StaffCardResponse mapToStaffCardResponse(WorkingStaff staff, LocalDate date) {
        Optional<StaffProfilePhoto> photoOpt = photoRepository.findByStaffId(staff.getId());
        String photoUrl = photoOpt.map(StaffProfilePhoto::getPhotoUrl).orElse(null);

        Optional<StaffDailyCheckin> checkinOpt = checkinRepository.findByStaffIdAndBranchIdAndCheckinDate(
                staff.getId(), staff.getBranch().getId(), date);

        String checkinStatus = "NOT_CONFIRMED_YET";
        ZonedDateTime confirmedAt = null;
        boolean isBookable = true;

        if (checkinOpt.isPresent()) {
            StaffDailyCheckin checkin = checkinOpt.get();
            checkinStatus = checkin.getStatus().name();
            confirmedAt = checkin.getConfirmedAt();
            isBookable = (checkin.getStatus() == CheckinStatus.PRESENT);
        }

        return StaffCardResponse.builder()
                .id(staff.getId())
                .branchId(staff.getBranch().getId())
                .branchName(staff.getBranch().getName())
                .name(staff.getName())
                .specialization(staff.getSpecialization())
                .bio(staff.getBio())
                .profilePhotoUrl(photoUrl)
                .todayCheckinStatus(checkinStatus)
                .checkinConfirmedAt(confirmedAt)
                .isBookable(isBookable)
                .isActive(staff.getIsActive())
                .build();
    }
}
