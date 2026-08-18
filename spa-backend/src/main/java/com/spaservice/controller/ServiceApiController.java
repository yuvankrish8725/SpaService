package com.spaservice.controller;

import com.spaservice.dto.ApiResponse;
import com.spaservice.dto.ServiceDtos.SpaServiceResponse;
import com.spaservice.service.SpaCatalogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/services")
public class ServiceApiController {

    private final SpaCatalogService serviceCatalogService;

    public ServiceApiController(SpaCatalogService serviceCatalogService) {
        this.serviceCatalogService = serviceCatalogService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SpaServiceResponse>>> getAllServices() {
        return ResponseEntity.ok(ApiResponse.ok(serviceCatalogService.getAllActiveServices()));
    }
}
