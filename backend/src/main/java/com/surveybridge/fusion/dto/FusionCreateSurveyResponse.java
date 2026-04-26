package com.surveybridge.fusion.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class FusionCreateSurveyResponse {

    @JsonProperty("fusion_survey_id")
    private String fusionSurveyId;

    @JsonProperty("entry_url")
    private String entryUrl;
}
