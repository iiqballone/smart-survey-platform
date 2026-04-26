package com.surveybridge.admin.controller;

import com.surveybridge.admin.dto.AdminClientDto;
import com.surveybridge.admin.dto.HealthStatusDto;
import com.surveybridge.admin.dto.UpdateQuotaRequest;
import com.surveybridge.admin.service.AdminService;
import com.surveybridge.common.PagedResult;
import com.surveybridge.dynata.dto.DynataJobDto;
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
    public PagedResult<AdminClientDto> listClients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return adminService.listClients(PageRequest.of(page, size));
    }

    @GetMapping("/clients/{id}")
    public AdminClientDto getClient(@PathVariable UUID id) {
        return adminService.getClient(id);
    }

    @PutMapping("/clients/{id}/quota")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateQuota(@PathVariable UUID id, @Valid @RequestBody UpdateQuotaRequest req) {
        adminService.updateQuota(id, req);
    }

    @GetMapping("/dynata/jobs")
    public List<DynataJobDto> dynataJobs() {
        return adminService.getDynataJobs();
    }

    @GetMapping("/health")
    public HealthStatusDto health() {
        return adminService.getHealth();
    }
}
