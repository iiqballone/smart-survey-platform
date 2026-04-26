package com.surveybridge.dynata;

import com.surveybridge.common.exception.DynataIntegrationException;
import com.surveybridge.dynata.dto.DynataJobDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class DynataApiClient {

    private final WebClient dynataWebClient;

    public String createProject(UUID surveyId, String title, Map<String, Object> targeting) {
        try {
            log.info("Creating Dynata project for survey {}", surveyId);
            // When real Dynata credentials are available, make the call:
            // return dynataWebClient.post()
            //     .uri("/v1/demand/surveys")
            //     .bodyValue(Map.of("title", title, "targeting", targeting))
            //     .retrieve()
            //     .bodyToMono(Map.class)
            //     .map(r -> (String) r.get("projectId"))
            //     .block();
            return "DYN-" + surveyId.toString().substring(0, 8).toUpperCase();
        } catch (WebClientResponseException e) {
            throw new DynataIntegrationException("Dynata project creation failed: " + e.getMessage(), e);
        }
    }

    public void pauseProject(String dynataProjectId) {
        log.info("Pausing Dynata project {}", dynataProjectId);
        // dynataWebClient.put().uri("/v1/demand/surveys/{id}/pause", dynataProjectId)
        //     .retrieve().toBodilessEntity().block();
    }

    public void closeProject(String dynataProjectId) {
        log.info("Closing Dynata project {}", dynataProjectId);
        // dynataWebClient.put().uri("/v1/demand/surveys/{id}/close", dynataProjectId)
        //     .retrieve().toBodilessEntity().block();
    }

    public List<DynataJobDto> getActiveJobs() {
        log.debug("Fetching active Dynata jobs");
        return List.of();
    }
}
