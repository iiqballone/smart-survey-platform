package com.surveybridge.fusion.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class FusionEventPayload {

    /** "complete" or "screenout" */
    private String event;

    @JsonProperty("respondent_id")
    private String respondentId;

    @JsonProperty("fusion_survey_id")
    private String fusionSurveyId;

    private BigDecimal cpi;
}
