package com.surveybridge.fusion.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
public class FusionCreateSurveyRequest {

    @JsonProperty("live_url")
    private String liveUrl;

    private Map<String, Object> targeting;

    @JsonProperty("completes_required")
    private int completesRequired;

    private int loi;

    @JsonProperty("cpi_max")
    private BigDecimal cpiMax;
}
