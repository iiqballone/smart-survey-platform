package com.surveybridge.fusion;

import com.surveybridge.admin.dto.FusionJobDto;
import com.surveybridge.common.exception.FusionIntegrationException;
import com.surveybridge.fusion.dto.FusionCreateSurveyRequest;
import com.surveybridge.fusion.dto.FusionCreateSurveyResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class FusionApiClient {

    private final WebClient fusionWebClient;

    public FusionCreateSurveyResponse createSurvey(UUID surveyId, String liveUrl, int completesRequired,
                                                    int loi, String country, BigDecimal cpiMax) {
        try {
            log.info("Creating Fusion survey for internal survey {}", surveyId);
            FusionCreateSurveyRequest request = FusionCreateSurveyRequest.builder()
                .liveUrl(liveUrl)
                .targeting(Map.of("country", country))
                .completesRequired(completesRequired)
                .loi(loi)
                .cpiMax(cpiMax)
                .build();

            // Uncomment when real Fusion credentials are available:
            // return fusionWebClient.post()
            //     .uri("/v1/surveys")
            //     .bodyValue(request)
            //     .retrieve()
            //     .bodyToMono(FusionCreateSurveyResponse.class)
            //     .block();

            String shortId = surveyId.toString().substring(0, 8).toUpperCase();
            FusionCreateSurveyResponse stub = new FusionCreateSurveyResponse();
            stub.setFusionSurveyId("FS-" + shortId);
            stub.setEntryUrl("https://fusion.spectrumsurveys.com/start-universal/" + shortId);
            return stub;
        } catch (WebClientResponseException e) {
            throw new FusionIntegrationException("Fusion survey creation failed: " + e.getMessage(), e);
        }
    }

    public void pauseSurvey(String fusionSurveyId) {
        log.info("Pausing Fusion survey {}", fusionSurveyId);
        // fusionWebClient.put().uri("/v1/surveys/{id}/pause", fusionSurveyId)
        //     .retrieve().toBodilessEntity().block();
    }

    public void closeSurvey(String fusionSurveyId) {
        log.info("Closing Fusion survey {}", fusionSurveyId);
        // fusionWebClient.put().uri("/v1/surveys/{id}/close", fusionSurveyId)
        //     .retrieve().toBodilessEntity().block();
    }

    public List<FusionJobDto> getActiveJobs() {
        log.debug("Fetching active Fusion jobs");
        return List.of();
    }
}
