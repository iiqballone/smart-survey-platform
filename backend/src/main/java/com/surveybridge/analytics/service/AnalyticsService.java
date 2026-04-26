package com.surveybridge.analytics.service;

import com.surveybridge.analytics.dto.CrossSurveyAnalyticsDto;
import com.surveybridge.analytics.dto.SurveyAnalyticsDto;
import com.surveybridge.analytics.dto.SurveyPerformanceDto;
import com.surveybridge.common.exception.ResourceNotFoundException;
import com.surveybridge.dashboard.dto.TimeSeriesPointDto;
import com.surveybridge.response.entity.EventType;
import com.surveybridge.response.entity.SurveyResponse;
import com.surveybridge.response.repository.SurveyResponseRepository;
import com.surveybridge.survey.entity.Survey;
import com.surveybridge.survey.repository.SurveyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final SurveyRepository surveyRepository;
    private final SurveyResponseRepository responseRepository;

    @Cacheable(value = "analytics", key = "#surveyId")
    public SurveyAnalyticsDto getSurveyAnalytics(UUID surveyId, UUID clientId) {
        Survey survey = surveyRepository.findByIdAndClientId(surveyId, clientId)
            .orElseThrow(() -> new ResourceNotFoundException("Survey not found: " + surveyId));

        int completedCount = survey.getCompletedCount();
        int screenoutCount = survey.getScreenoutCount();
        int total = completedCount + screenoutCount;
        int completesRequired = survey.getCompletesRequired();

        double completionRate = completesRequired > 0
            ? round((double) completedCount / completesRequired * 100) : 0;
        double screenoutRate = total > 0
            ? round((double) screenoutCount / total * 100) : 0;

        Double avgCpi = responseRepository.findAvgCpiBySurveyId(surveyId);

        List<SurveyResponse> responses = responseRepository.findBySurveyId(surveyId);
        List<TimeSeriesPointDto> trend = buildTrend(responses);

        return new SurveyAnalyticsDto(surveyId, completedCount, screenoutCount,
            completesRequired, completionRate, screenoutRate, avgCpi, trend);
    }

    @Cacheable(value = "analytics", key = "'cross:' + #clientId")
    public CrossSurveyAnalyticsDto getCrossSurveyAnalytics(UUID clientId) {
        List<Survey> surveys = surveyRepository.findAllByClientId(clientId, Pageable.unpaged()).getContent();

        List<SurveyPerformanceDto> performance = surveys.stream()
            .filter(s -> s.getStatus().name().equals("LIVE") || s.getStatus().name().equals("COMPLETED")
                || s.getStatus().name().equals("PAUSED"))
            .map(s -> {
                double rate = s.getCompletesRequired() > 0
                    ? round((double) s.getCompletedCount() / s.getCompletesRequired() * 100) : 0;
                return new SurveyPerformanceDto(s.getId(), s.getTitle(),
                    s.getCompletedCount(), s.getCompletesRequired(), rate, s.getStatus());
            }).toList();

        List<SurveyResponse> allResponses = surveys.stream()
            .flatMap(s -> responseRepository.findBySurveyId(s.getId()).stream())
            .toList();

        List<TimeSeriesPointDto> trend = buildTrend(allResponses);

        return new CrossSurveyAnalyticsDto(trend, performance);
    }

    private List<TimeSeriesPointDto> buildTrend(List<SurveyResponse> responses) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        Map<String, long[]> trendMap = new TreeMap<>();
        for (SurveyResponse r : responses) {
            if (r.getOccurredAt().isAfter(thirtyDaysAgo)) {
                String day = r.getOccurredAt().toLocalDate().toString();
                trendMap.computeIfAbsent(day, k -> new long[]{0, 0});
                trendMap.get(day)[0]++;
                if (r.getEventType() == EventType.COMPLETE) trendMap.get(day)[1]++;
            }
        }
        return trendMap.entrySet().stream()
            .map(e -> new TimeSeriesPointDto(e.getKey(), e.getValue()[0], e.getValue()[1]))
            .toList();
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
