package com.surveybridge.response.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.surveybridge.common.exception.FusionIntegrationException;
import com.surveybridge.config.KafkaConfig;
import com.surveybridge.fusion.dto.FusionEventPayload;
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

    public void publish(String surveyId, FusionEventPayload payload) {
        try {
            String message = objectMapper.writeValueAsString(payload);
            kafkaTemplate.send(KafkaConfig.RESPONSE_TOPIC, surveyId, message);
            log.debug("Published Fusion event to Kafka for survey {}", surveyId);
        } catch (JsonProcessingException e) {
            throw new FusionIntegrationException("Failed to serialize Fusion event payload", e);
        }
    }
}
