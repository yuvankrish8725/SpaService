package com.spaservice.controller;

import com.spaservice.dto.ApiResponse;
import com.spaservice.dto.BranchDtos.BranchResponse;
import com.spaservice.dto.ServiceDtos.SpaServiceResponse;
import com.spaservice.service.BranchService;
import com.spaservice.service.SpaCatalogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/branches")
public class BranchApiController {

    private final BranchService branchService;
    private final SpaCatalogService serviceCatalogService;

    public BranchApiController(BranchService branchService, SpaCatalogService serviceCatalogService) {
        this.branchService = branchService;
        this.serviceCatalogService = serviceCatalogService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BranchResponse>>> getAllBranches() {
        return ResponseEntity.ok(ApiResponse.ok(branchService.getAllActiveBranches()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BranchResponse>> getBranchById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(branchService.getBranchById(id)));
    }

    @GetMapping("/{id}/services")
    public ResponseEntity<ApiResponse<List<SpaServiceResponse>>> getBranchServices(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(serviceCatalogService.getServicesForBranch(id)));
    }
}
