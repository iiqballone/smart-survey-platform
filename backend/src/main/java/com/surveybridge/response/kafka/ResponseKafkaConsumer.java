package com.surveybridge.response.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.surveybridge.config.KafkaConfig;
import com.surveybridge.fusion.dto.FusionEventPayload;
import com.surveybridge.notification.service.NotificationService;
import com.surveybridge.response.entity.EventType;
import com.surveybridge.response.entity.SurveyResponse;
import com.surveybridge.response.repository.SurveyResponseRepository;
import com.surveybridge.survey.entity.Survey;
import com.surveybridge.survey.repository.SurveyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class ResponseKafkaConsumer {

    private final SurveyResponseRepository responseRepository;
    private final SurveyRepository surveyRepository;
    private final NotificationService notificationService;
    private final CacheManager cacheManager;
    private final ObjectMapper objectMapper;
    private final WebClient fusionWebClient;

    @KafkaListener(topics = KafkaConfig.RESPONSE_TOPIC, containerFactory = "kafkaListenerContainerFactory")
    @Transactional
    public void onMessage(String message) {
        try {
            FusionEventPayload payload = objectMapper.readValue(message, FusionEventPayload.class);
            process(payload);
        } catch (Exception e) {
            log.error("Failed to process Kafka message", e);
        }
    }

    private void process(FusionEventPayload payload) {
        EventType eventType = "complete".equalsIgnoreCase(payload.getEvent())
            ? EventType.COMPLETE : EventType.SCREENOUT;

        surveyRepository.findByFusionSurveyId(payload.getFusionSurveyId()).ifPresent(survey -> {
            SurveyResponse response = SurveyResponse.builder()
                .surveyId(survey.getId())
                .respondentId(payload.getRespondentId())
                .fusionSurveyId(payload.getFusionSurveyId())
                .eventType(eventType)
                .cpi(payload.getCpi())
                .occurredAt(LocalDateTime.now())
                .build();
            responseRepository.save(response);

            if (eventType == EventType.COMPLETE) {
                surveyRepository.incrementCompletedCount(survey.getId());
            } else {
                surveyRepository.incrementScreenoutCount(survey.getId());
            }

            evictCaches(survey.getId().toString());
            forwardToClient(survey, payload, eventType);

            surveyRepository.findById(survey.getId()).ifPresent(s ->
                checkMilestones(s, s.getCompletedCount()));
        });
    }

    private void forwardToClient(Survey survey, FusionEventPayload payload, EventType eventType) {
        if (survey.getCallbackUrl() == null || survey.getCallbackUrl().isBlank()) return;
        try {
            Map<String, Object> body = Map.of(
                "event", "survey." + eventType.name().toLowerCase(),
                "survey_id", survey.getId().toString(),
                "respondent_id", payload.getRespondentId()
            );
            fusionWebClient.post()
                .uri(survey.getCallbackUrl())
                .bodyValue(body)
                .retrieve()
                .toBodilessEntity()
                .subscribe(
                    r -> log.debug("Forwarded event to client callback for survey {}", survey.getId()),
                    e -> log.warn("Failed to forward event to client callback {}: {}", survey.getCallbackUrl(), e.getMessage())
                );
        } catch (Exception e) {
            log.warn("Error building client callback request for survey {}: {}", survey.getId(), e.getMessage());
        }
    }

    private void checkMilestones(Survey survey, int completedCount) {
        int target = survey.getCompletesRequired();
        if (target <= 0) return;
        if (completedCount == target) {
            notificationService.createNotification(
                survey.getClientId(), "SUCCESS",
                "Survey quota reached",
                survey.getTitle() + " collected all " + target + " completes.",
                "/surveys/" + survey.getId() + "/reports");
        } else if (completedCount == target / 2) {
            notificationService.createNotification(
                survey.getClientId(), "INFO",
                "Milestone — 50% complete",
                survey.getTitle() + " hit " + completedCount + "/" + target + " completes.",
                "/surveys/" + survey.getId());
        }
    }

    private void evictCaches(String surveyId) {
        var dashboard = cacheManager.getCache("dashboard");
        var analytics = cacheManager.getCache("analytics");
        if (dashboard != null) dashboard.clear();
        if (analytics != null) analytics.evict(surveyId);
    }
}
