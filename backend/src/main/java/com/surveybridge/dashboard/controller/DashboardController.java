package com.surveybridge.dashboard.controller;

import com.surveybridge.common.CurrentUserContext;
import com.surveybridge.dashboard.dto.CompletionRateDto;
import com.surveybridge.dashboard.dto.DashboardSummaryDto;
import com.surveybridge.dashboard.dto.TimeSeriesResponseDto;
import com.surveybridge.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final CurrentUserContext ctx;

    @GetMapping("/summary")
    @Operation(summary = "Get dashboard summary")
    public DashboardSummaryDto summary() {
        return dashboardService.getSummary(ctx.getClientId());
    }

    @GetMapping("/surveys/{surveyId}/timeseries")
    @Operation(summary = "Get response time series for a survey")
    public TimeSeriesResponseDto timeSeries(
            @PathVariable UUID surveyId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "day") String granularity) {
        return dashboardService.getTimeSeries(surveyId, from, to, granularity);
    }

    @GetMapping("/completion-rates")
    @Operation(summary = "Get completion rates for all surveys")
    public List<CompletionRateDto> completionRates() {
        return dashboardService.getCompletionRates(ctx.getClientId());
    }
}
