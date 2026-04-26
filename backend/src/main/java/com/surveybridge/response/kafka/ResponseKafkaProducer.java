package com.surveybridge.response.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.surveybridge.config.KafkaConfig;
import com.surveybridge.common.exception.DynataIntegrationException;
import com.surveybridge.dynata.dto.DynataWebhookPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ResponseKafkaProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void publish(DynataWebhookPayload payload) {
        try {
            String message = objectMapper.writeValueAsString(payload);
            kafkaTemplate.send(KafkaConfig.RESPONSE_TOPIC, payload.getSurveyId().toString(), message);
            log.debug("Published response to Kafka for survey {}", payload.getSurveyId());
        } catch (JsonProcessingException e) {
            throw new DynataIntegrationException("Failed to serialize webhook payload", e);
        }
    }
}
