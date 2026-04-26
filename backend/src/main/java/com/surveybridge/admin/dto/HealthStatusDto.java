package com.surveybridge.admin.dto;

import java.util.Map;

public record HealthStatusDto(String status, Map<String, ComponentStatus> components) {
    public record ComponentStatus(String status) {}
}
