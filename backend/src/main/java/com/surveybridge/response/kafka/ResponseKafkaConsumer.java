package com.surveybridge.response.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.surveybridge.config.KafkaConfig;
import com.surveybridge.dynata.dto.DynataWebhookPayload;
import com.surveybridge.notification.service.NotificationService;
import com.surveybridge.response.entity.Answer;
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

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ResponseKafkaConsumer {

    private final SurveyResponseRepository responseRepository;
    private final SurveyRepository surveyRepository;
    private final NotificationService notificationService;
    private final CacheManager cacheManager;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = KafkaConfig.RESPONSE_TOPIC, containerFactory = "kafkaListenerContainerFactory")
    @Transactional
    public void onMessage(String message) {
        try {
            DynataWebhookPayload payload = objectMapper.readValue(message, DynataWebhookPayload.class);
            persist(payload);
        } catch (Exception e) {
            log.error("Failed to process Kafka message", e);
        }
    }

    private void persist(DynataWebhookPayload payload) {
        SurveyResponse response = SurveyResponse.builder()
            .surveyId(payload.getSurveyId())
            .dynataRespondentId(payload.getDynataRespondentId())
            .country(payload.getCountry())
            .ageGroup(payload.getAgeGroup())
            .gender(payload.getGender())
            .completedAt(payload.getCompletedAt() != null
                ? LocalDateTime.ofInstant(payload.getCompletedAt(), ZoneOffset.UTC)
                : LocalDateTime.now())
            .durationSeconds(payload.getDurationSeconds())
            .build();

        if (payload.getAnswers() != null) {
            List<Answer> answers = payload.getAnswers().stream()
                .map(a -> Answer.builder()
                    .response(response)
                    .questionId(a.getQuestionId())
                    .questionText(a.getQuestionText())
                    .value(a.getValue())
                    .build())
                .toList();
            response.setAnswers(answers);
        }

        responseRepository.save(response);
        surveyRepository.incrementResponseCount(payload.getSurveyId());

        evictCaches(payload.getSurveyId().toString());

        // Entity cache cleared by clearAutomatically = true on the @Modifying query above,
        // so findById returns the already-incremented count from the DB.
        surveyRepository.findById(payload.getSurveyId()).ifPresent(survey ->
            checkMilestones(survey, survey.getReceivedResponseCount()));
    }

    private void checkMilestones(Survey survey, int newCount) {
        int target = survey.getTargetResponseCount();
        if (target <= 0) return;

        if (newCount == target) {
            notificationService.createNotification(
                survey.getClientId(), "SUCCESS",
                "Survey quota reached",
                survey.getTitle() + " collected all " + target + " responses.",
                "/surveys/" + survey.getId() + "/reports");
        } else if (newCount == target / 2) {
            notificationService.createNotification(
                survey.getClientId(), "INFO",
                "Milestone — 50% complete",
                survey.getTitle() + " hit " + newCount + "/" + target + " responses.",
                "/surveys/" + survey.getId());
        }
    }

    private void evictCaches(String surveyId) {
        // Clear the full cache buckets — dashboard keys include clientId which we don't
        // have here, and analytics keys vary by surveyId. Clearing is simpler and safe
        // because both caches have short TTLs anyway.
        var dashboard = cacheManager.getCache("dashboard");
        var analytics  = cacheManager.getCache("analytics");
        if (dashboard != null) dashboard.clear();
        if (analytics  != null) analytics.evict(surveyId);
    }
}
