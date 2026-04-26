package com.surveybridge.analytics.controller;

import com.surveybridge.analytics.dto.CrossSurveyAnalyticsDto;
import com.surveybridge.analytics.dto.SurveyAnalyticsDto;
import com.surveybridge.analytics.service.AnalyticsService;
import com.surveybridge.common.CurrentUserContext;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final CurrentUserContext ctx;

    @GetMapping("/surveys/{id}/analytics")
    public SurveyAnalyticsDto surveyAnalytics(@PathVariable UUID id) {
        return analyticsService.getSurveyAnalytics(id, ctx.getClientId());
    }

    @GetMapping("/analytics/summary")
    public CrossSurveyAnalyticsDto crossSurveyAnalytics() {
        return analyticsService.getCrossSurveyAnalytics(ctx.getClientId());
    }
}
