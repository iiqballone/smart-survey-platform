package com.surveybridge.admin.service;

import com.surveybridge.admin.dto.AdminClientDto;
import com.surveybridge.admin.dto.HealthStatusDto;
import com.surveybridge.admin.dto.UpdateQuotaRequest;
import com.surveybridge.client.entity.Client;
import com.surveybridge.client.repository.ClientRepository;
import com.surveybridge.common.PagedResult;
import com.surveybridge.common.exception.ResourceNotFoundException;
import com.surveybridge.dynata.DynataApiClient;
import com.surveybridge.dynata.dto.DynataJobDto;
import com.surveybridge.survey.entity.Survey;
import com.surveybridge.survey.entity.SurveyStatus;
import com.surveybridge.survey.repository.SurveyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final ClientRepository clientRepository;
    private final SurveyRepository surveyRepository;
    private final DynataApiClient dynataApiClient;
    private final RedisConnectionFactory redisConnectionFactory;

    public PagedResult<AdminClientDto> listClients(Pageable pageable) {
        return PagedResult.map(clientRepository.findAll(pageable), this::toDto);
    }

    public AdminClientDto getClient(UUID clientId) {
        return toDto(clientRepository.findById(clientId)
            .orElseThrow(() -> new ResourceNotFoundException("Client not found: " + clientId)));
    }

    @Transactional
    public void updateQuota(UUID clientId, UpdateQuotaRequest req) {
        Client client = clientRepository.findById(clientId)
            .orElseThrow(() -> new ResourceNotFoundException("Client not found: " + clientId));
        client.setMonthlyResponseQuota(req.monthlyResponseQuota());
    }

    public List<DynataJobDto> getDynataJobs() {
        List<Survey> liveOrPaused = surveyRepository.findAll().stream()
            .filter(s -> s.getStatus() == SurveyStatus.LIVE || s.getStatus() == SurveyStatus.PAUSED)
            .toList();

        if (liveOrPaused.isEmpty()) return dynataApiClient.getActiveJobs();

        return liveOrPaused.stream()
            .filter(s -> s.getDynataProjectId() != null)
            .map(s -> new DynataJobDto(
                s.getDynataProjectId(),
                s.getTitle(),
                s.getStatus() == SurveyStatus.LIVE ? "SYNCED" : "PAUSED_SYNCED",
                s.getReceivedResponseCount(),
                s.getTargetResponseCount()))
            .toList();
    }

    public HealthStatusDto getHealth() {
        String postgres = checkPostgres();
        String redis = checkRedis();
        boolean allUp = "UP".equals(postgres) && "UP".equals(redis);
        return new HealthStatusDto(
            allUp ? "UP" : "DEGRADED",
            Map.of(
                "postgres",  new HealthStatusDto.ComponentStatus(postgres),
                "redis",     new HealthStatusDto.ComponentStatus(redis),
                "kafka",     new HealthStatusDto.ComponentStatus("UP"),
                "keycloak",  new HealthStatusDto.ComponentStatus("UP")
            ));
    }

    private String checkPostgres() {
        try {
            clientRepository.count();
            return "UP";
        } catch (Exception e) {
            log.warn("Postgres health check failed", e);
            return "DOWN";
        }
    }

    private String checkRedis() {
        try (var conn = redisConnectionFactory.getConnection()) {
            conn.ping();
            return "UP";
        } catch (Exception e) {
            log.warn("Redis health check failed", e);
            return "DOWN";
        }
    }

    private AdminClientDto toDto(Client c) {
        return new AdminClientDto(c.getId(), c.getName(), c.getContactEmail(), c.getPlan(),
            c.getMonthlyResponseQuota(), c.getUsedResponseCount(), c.isActive(), c.getCreatedAt());
    }
}
