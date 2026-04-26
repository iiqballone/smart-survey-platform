package com.surveybridge.dynata.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class DynataWebhookPayload {

    private UUID surveyId;
    private String dynataRespondentId;
    private String country;
    private int ageGroup;
    private String gender;
    private Instant completedAt;
    private int durationSeconds;
    private List<AnswerPayload> answers;

    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AnswerPayload {
        private UUID questionId;
        private String questionText;
        private String value;
    }
}
