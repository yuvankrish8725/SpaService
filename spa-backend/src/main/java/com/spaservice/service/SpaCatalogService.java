package com.spaservice.service;

import com.spaservice.dto.ServiceDtos.SpaServiceRequest;
import com.spaservice.dto.ServiceDtos.SpaServiceResponse;
import com.spaservice.entity.Branch;
import com.spaservice.entity.SpaServiceEntity;
import com.spaservice.exception.ResourceNotFoundException;
import com.spaservice.repository.BranchRepository;
import com.spaservice.repository.SpaServiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SpaCatalogService {

    private final SpaServiceRepository serviceRepository;
    private final BranchRepository branchRepository;

    public SpaCatalogService(SpaServiceRepository serviceRepository, BranchRepository branchRepository) {
        this.serviceRepository = serviceRepository;
        this.branchRepository = branchRepository;
    }

    @Transactional(readOnly = true)
    public List<SpaServiceResponse> getAllActiveServices() {
        return serviceRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SpaServiceResponse> getServicesForBranch(UUID branchId) {
        return serviceRepository.findAvailableForBranch(branchId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SpaServiceResponse> getAllServicesAdmin() {
        return serviceRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SpaServiceResponse createService(SpaServiceRequest request) {
        Branch branch = null;
        if (request.getBranchId() != null) {
            branch = branchRepository.findById(request.getBranchId())
                    .orElseThrow(() -> new ResourceNotFoundException("Branch", "id", request.getBranchId()));
        }

        SpaServiceEntity entity = SpaServiceEntity.builder()
                .branch(branch)
                .name(request.getName())
                .category(request.getCategory())
                .durationMinutes(request.getDurationMinutes())
                .price(request.getPrice())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .isActive(true)
                .build();

        entity = serviceRepository.save(entity);
        return mapToResponse(entity);
    }

    @Transactional
    public SpaServiceResponse updateService(UUID id, SpaServiceRequest request) {
        SpaServiceEntity entity = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));

        if (request.getBranchId() != null) {
            Branch branch = branchRepository.findById(request.getBranchId())
                    .orElseThrow(() -> new ResourceNotFoundException("Branch", "id", request.getBranchId()));
            entity.setBranch(branch);
        } else {
            entity.setBranch(null);
        }

        entity.setName(request.getName());
        entity.setCategory(request.getCategory());
        entity.setDurationMinutes(request.getDurationMinutes());
        entity.setPrice(request.getPrice());
        entity.setDescription(request.getDescription());
        if (request.getImageUrl() != null) entity.setImageUrl(request.getImageUrl());

        entity = serviceRepository.save(entity);
        return mapToResponse(entity);
    }

    @Transactional
    public void toggleServiceStatus(UUID id, boolean active) {
        SpaServiceEntity entity = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));
        entity.setIsActive(active);
        serviceRepository.save(entity);
    }

    private SpaServiceResponse mapToResponse(SpaServiceEntity s) {
        return SpaServiceResponse.builder()
                .id(s.getId())
                .branchId(s.getBranch() != null ? s.getBranch().getId() : null)
                .branchName(s.getBranch() != null ? s.getBranch().getName() : "All Branches")
                .name(s.getName())
                .category(s.getCategory())
                .durationMinutes(s.getDurationMinutes())
                .price(s.getPrice())
                .description(s.getDescription())
                .imageUrl(s.getImageUrl())
                .isActive(s.getIsActive())
                .build();
    }
}
