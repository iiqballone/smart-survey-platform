package com.surveybridge.admin.controller;

import com.surveybridge.admin.dto.AdminClientDto;
import com.surveybridge.admin.dto.FusionJobDto;
import com.surveybridge.admin.dto.HealthStatusDto;
import com.surveybridge.admin.dto.UpdateQuotaRequest;
import com.surveybridge.admin.service.AdminService;
import com.surveybridge.common.PagedResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/clients")
    @Operation(summary = "List all clients")
    public PagedResult<AdminClientDto> listClients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return adminService.listClients(PageRequest.of(page, size));
    }

    @GetMapping("/clients/{id}")
    @Operation(summary = "Get client by ID")
    public AdminClientDto getClient(@PathVariable UUID id) {
        return adminService.getClient(id);
    }

    @PutMapping("/clients/{id}/quota")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Update client quota")
    public void updateQuota(@PathVariable UUID id, @Valid @RequestBody UpdateQuotaRequest req) {
        adminService.updateQuota(id, req);
    }

    @GetMapping("/fusion/jobs")
    @Operation(summary = "List active Fusion survey jobs")
    public List<FusionJobDto> fusionJobs() {
        return adminService.getFusionJobs();
    }

    @GetMapping("/health")
    @Operation(summary = "System health check")
    public HealthStatusDto health() {
        return adminService.getHealth();
    }
}
