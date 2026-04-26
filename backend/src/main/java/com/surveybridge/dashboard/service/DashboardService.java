package com.surveybridge.dashboard.service;

import com.surveybridge.dashboard.dto.CompletionRateDto;
import com.surveybridge.dashboard.dto.DashboardSummaryDto;
import com.surveybridge.dashboard.dto.TimeSeriesPointDto;
import com.surveybridge.dashboard.dto.TimeSeriesResponseDto;
import com.surveybridge.response.repository.SurveyResponseRepository;
import com.surveybridge.survey.entity.SurveyStatus;
import com.surveybridge.survey.repository.SurveyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private static final Set<String> VALID_GRANULARITIES = Set.of("day", "week", "month");

    private final SurveyRepository surveyRepository;
    private final SurveyResponseRepository responseRepository;

    @Cacheable(value = "dashboard", key = "'summary:' + #clientId")
    public DashboardSummaryDto getSummary(UUID clientId) {
        long total = surveyRepository.countByClientId(clientId);
        long active = surveyRepository.countByClientIdAndStatus(clientId, SurveyStatus.LIVE);
        long totalResponses = responseRepository.countByClientId(clientId);

        double avgCompletion = surveyRepository.findAllByClientId(clientId, Pageable.unpaged())
            .getContent().stream()
            .filter(s -> s.getCompletesRequired() > 0)
            .mapToDouble(s -> (double) s.getCompletedCount() / s.getCompletesRequired() * 100)
            .average().orElse(0);

        LocalDateTime startOfMonth = YearMonth.now().atDay(1).atStartOfDay();
        long thisMonth = responseRepository.countByClientIdSince(clientId, startOfMonth);

        return new DashboardSummaryDto(total, active, totalResponses, Math.round(avgCompletion), thisMonth);
    }

    @Cacheable(value = "dashboard", key = "'timeseries:' + #surveyId + ':' + #granularity + ':' + #from + ':' + #to")
    public TimeSeriesResponseDto getTimeSeries(UUID surveyId, LocalDateTime from, LocalDateTime to,
                                               String granularity) {
        if (!VALID_GRANULARITIES.contains(granularity)) {
            throw new IllegalArgumentException("Invalid granularity. Use: day, week, month");
        }
        List<Object[]> rows = responseRepository.findTimeseries(surveyId, from, to, granularity);
        List<TimeSeriesPointDto> points = rows.stream()
            .map(row -> new TimeSeriesPointDto(
                (String) row[0],
                ((Number) row[1]).longValue(),
                ((Number) row[2]).longValue()))
            .toList();
        return new TimeSeriesResponseDto(surveyId, points);
    }

    @Cacheable(value = "dashboard", key = "'completion:' + #clientId")
    public List<CompletionRateDto> getCompletionRates(UUID clientId) {
        return surveyRepository.findAllByClientId(clientId, Pageable.unpaged()).getContent()
            .stream()
            .filter(s -> s.getStatus() != SurveyStatus.DRAFT)
            .map(s -> {
                double rate = s.getCompletesRequired() > 0
                    ? Math.round((double) s.getCompletedCount() / s.getCompletesRequired() * 100 * 10.0) / 10.0
                    : 0;
                return new CompletionRateDto(s.getId(), s.getTitle(), rate,
                    s.getCompletedCount(), s.getCompletesRequired());
            })
            .toList();
    }
}
