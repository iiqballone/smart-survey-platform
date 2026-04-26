package com.surveybridge.admin.dto;

import jakarta.validation.constraints.Min;

public record UpdateQuotaRequest(@Min(0) int monthlyResponseQuota) {}
