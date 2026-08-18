package com.spaservice.service;

import com.spaservice.dto.AgentDtos.AgentCreateRequest;
import com.spaservice.dto.AgentDtos.AgentResponse;
import com.spaservice.dto.CheckinDtos.*;
import com.spaservice.entity.*;
import com.spaservice.exception.AppException;
import com.spaservice.exception.ResourceNotFoundException;
import com.spaservice.exception.UnauthorizedException;
import com.spaservice.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AgentService {

    private final AgentRepository agentRepository;
    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final WorkingStaffRepository staffRepository;
    private final StaffDailyCheckinRepository checkinRepository;
    private final StaffProfilePhotoRepository photoRepository;
    private final PasswordEncoder passwordEncoder;

    public AgentService(AgentRepository agentRepository, UserRepository userRepository, BranchRepository branchRepository, WorkingStaffRepository staffRepository, StaffDailyCheckinRepository checkinRepository, StaffProfilePhotoRepository photoRepository, PasswordEncoder passwordEncoder) {
        this.agentRepository = agentRepository;
        this.userRepository = userRepository;
        this.branchRepository = branchRepository;
        this.staffRepository = staffRepository;
        this.checkinRepository = checkinRepository;
        this.photoRepository = photoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void confirmCheckin(UUID staffId, CheckinRequest request, User agentUser, UUID assignedBranchId) {
        WorkingStaff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", "id", staffId));

        if (agentUser.getRole() == Role.AGENT) {
            if (assignedBranchId == null || !staff.getBranch().getId().equals(assignedBranchId)) {
                throw new UnauthorizedException("You can only confirm check-ins for staff at your assigned branch");
            }
        }

        LocalDate today = LocalDate.now();

        Optional<StaffDailyCheckin> existingOpt = checkinRepository.findByStaffIdAndBranchIdAndCheckinDate(
                staffId, staff.getBranch().getId(), today);

        if (existingOpt.isPresent()) {
            StaffDailyCheckin checkin = existingOpt.get();
            checkin.setStatus(request.getStatus());
            checkin.setConfirmedByAgentId(agentUser.getId());
            checkinRepository.save(checkin);
        } else {
            StaffDailyCheckin checkin = StaffDailyCheckin.builder()
                    .staff(staff)
                    .branch(staff.getBranch())
                    .checkinDate(today)
                    .status(request.getStatus())
                    .confirmedByAgentId(agentUser.getId())
                    .build();
            checkinRepository.save(checkin);
        }
    }

    @Transactional(readOnly = true)
    public BranchCheckinStatusResponse getBranchCheckinStatus(UUID branchId, LocalDate date) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch", "id", branchId));

        LocalDate queryDate = date != null ? date : LocalDate.now();
        List<WorkingStaff> staffList = staffRepository.findByBranchIdAndIsActiveTrue(branchId);
        List<StaffDailyCheckin> checkins = checkinRepository.findByBranchIdAndCheckinDate(branchId, queryDate);

        int presentCount = 0;
        int onLeaveCount = 0;
        List<StaffCheckinStatusItem> items = new ArrayList<>();

        for (WorkingStaff staff : staffList) {
            Optional<StaffDailyCheckin> checkinOpt = checkins.stream()
                    .filter(c -> c.getStaff().getId().equals(staff.getId()))
                    .findFirst();

            Optional<StaffProfilePhoto> photoOpt = photoRepository.findByStaffId(staff.getId());
            String photoUrl = photoOpt.map(StaffProfilePhoto::getPhotoUrl).orElse(null);

            String status = "NOT_CONFIRMED_YET";
            java.time.ZonedDateTime confirmedAt = null;
            String confirmedByAgentName = null;

            if (checkinOpt.isPresent()) {
                StaffDailyCheckin c = checkinOpt.get();
                status = c.getStatus().name();
                confirmedAt = c.getConfirmedAt();
                if (c.getStatus() == CheckinStatus.PRESENT) presentCount++;
                else if (c.getStatus() == CheckinStatus.ON_LEAVE) onLeaveCount++;

                if (c.getConfirmedByAgentId() != null) {
                    confirmedByAgentName = userRepository.findById(c.getConfirmedByAgentId())
                            .map(User::getFullName).orElse(null);
                }
            }

            items.add(StaffCheckinStatusItem.builder()
                    .staffId(staff.getId())
                    .staffName(staff.getName())
                    .specialization(staff.getSpecialization())
                    .profilePhotoUrl(photoUrl)
                    .status(status)
                    .confirmedAt(confirmedAt)
                    .confirmedByAgentName(confirmedByAgentName)
                    .build());
        }

        int totalStaff = staffList.size();
        int pendingCount = totalStaff - (presentCount + onLeaveCount);

        return BranchCheckinStatusResponse.builder()
                .branchId(branch.getId())
                .branchName(branch.getName())
                .date(queryDate)
                .totalStaff(totalStaff)
                .presentCount(presentCount)
                .onLeaveCount(onLeaveCount)
                .pendingCount(Math.max(0, pendingCount))
                .staffCheckins(items)
                .build();
    }

    @Transactional
    public AgentResponse createAgent(AgentCreateRequest request, UUID adminUserId) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("Email already exists: " + request.getEmail());
        }

        Branch branch = branchRepository.findById(request.getAssignedBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch", "id", request.getAssignedBranchId()));

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail().toLowerCase().trim())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.AGENT)
                .isVerified(true)
                .isActive(true)
                .build();

        user = userRepository.save(user);

        Agent agent = Agent.builder()
                .user(user)
                .assignedBranch(branch)
                .createdByAdminId(adminUserId)
                .isActive(true)
                .build();

        agent = agentRepository.save(agent);

        return mapToAgentResponse(agent);
    }

    @Transactional(readOnly = true)
    public List<AgentResponse> getAllAgents() {
        return agentRepository.findAll().stream()
                .map(this::mapToAgentResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void toggleAgentStatus(UUID agentId, boolean active) {
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", agentId));
        agent.setIsActive(active);
        agent.getUser().setIsActive(active);
        agentRepository.save(agent);
    }

    private AgentResponse mapToAgentResponse(Agent agent) {
        return AgentResponse.builder()
                .id(agent.getId())
                .userId(agent.getUser().getId())
                .fullName(agent.getUser().getFullName())
                .email(agent.getUser().getEmail())
                .phone(agent.getUser().getPhone())
                .assignedBranchId(agent.getAssignedBranch().getId())
                .assignedBranchName(agent.getAssignedBranch().getName())
                .isActive(agent.getIsActive())
                .createdAt(agent.getCreatedAt())
                .build();
    }
}
