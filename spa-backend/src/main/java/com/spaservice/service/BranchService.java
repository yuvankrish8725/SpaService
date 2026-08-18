package com.spaservice.service;

import com.spaservice.dto.BranchDtos.BranchRequest;
import com.spaservice.dto.BranchDtos.BranchResponse;
import com.spaservice.entity.Branch;
import com.spaservice.exception.ResourceNotFoundException;
import com.spaservice.repository.BranchRepository;
import com.spaservice.repository.SpaServiceRepository;
import com.spaservice.repository.WorkingStaffRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BranchService {

    private final BranchRepository branchRepository;
    private final WorkingStaffRepository staffRepository;
    private final SpaServiceRepository serviceRepository;

    public BranchService(BranchRepository branchRepository, WorkingStaffRepository staffRepository, SpaServiceRepository serviceRepository) {
        this.branchRepository = branchRepository;
        this.staffRepository = staffRepository;
        this.serviceRepository = serviceRepository;
    }

    @Transactional(readOnly = true)
    public List<BranchResponse> getAllActiveBranches() {
        return branchRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BranchResponse> getAllBranchesAdmin() {
        return branchRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BranchResponse getBranchById(UUID id) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Branch", "id", id));
        return mapToResponse(branch);
    }

    @Transactional
    public BranchResponse createBranch(BranchRequest request, UUID adminUserId) {
        String mapsUrl = request.getMapsUrl();
        if (mapsUrl == null || mapsUrl.isBlank()) {
            mapsUrl = String.format("https://www.google.com/maps?q=%s,%s", request.getLatitude(), request.getLongitude());
        }

        Branch branch = Branch.builder()
                .name(request.getName())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .phone(request.getPhone())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .mapsUrl(mapsUrl)
                .openTime(request.getOpenTime() != null ? request.getOpenTime() : LocalTime.of(9, 0))
                .closeTime(request.getCloseTime() != null ? request.getCloseTime() : LocalTime.of(21, 0))
                .isActive(true)
                .createdBy(adminUserId)
                .build();

        branch = branchRepository.save(branch);
        return mapToResponse(branch);
    }

    @Transactional
    public BranchResponse updateBranch(UUID id, BranchRequest request) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Branch", "id", id));

        branch.setName(request.getName());
        branch.setAddress(request.getAddress());
        branch.setCity(request.getCity());
        branch.setState(request.getState());
        branch.setPincode(request.getPincode());
        branch.setPhone(request.getPhone());
        branch.setLatitude(request.getLatitude());
        branch.setLongitude(request.getLongitude());
        
        if (request.getMapsUrl() != null && !request.getMapsUrl().isBlank()) {
            branch.setMapsUrl(request.getMapsUrl());
        } else {
            branch.setMapsUrl(String.format("https://www.google.com/maps?q=%s,%s", request.getLatitude(), request.getLongitude()));
        }

        if (request.getOpenTime() != null) branch.setOpenTime(request.getOpenTime());
        if (request.getCloseTime() != null) branch.setCloseTime(request.getCloseTime());

        branch = branchRepository.save(branch);
        return mapToResponse(branch);
    }

    @Transactional
    public void toggleBranchStatus(UUID id, boolean active) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Branch", "id", id));
        branch.setIsActive(active);
        branchRepository.save(branch);
    }

    public BranchResponse mapToResponse(Branch branch) {
        int staffCount = staffRepository.findByBranchIdAndIsActiveTrue(branch.getId()).size();
        int serviceCount = serviceRepository.findAvailableForBranch(branch.getId()).size();

        return BranchResponse.builder()
                .id(branch.getId())
                .name(branch.getName())
                .address(branch.getAddress())
                .city(branch.getCity())
                .state(branch.getState())
                .pincode(branch.getPincode())
                .phone(branch.getPhone())
                .latitude(branch.getLatitude())
                .longitude(branch.getLongitude())
                .mapsUrl(branch.getMapsUrl())
                .openTime(branch.getOpenTime())
                .closeTime(branch.getCloseTime())
                .isActive(branch.getIsActive())
                .staffCount(staffCount)
                .serviceCount(serviceCount)
                .build();
    }
}
