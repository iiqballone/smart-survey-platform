package com.surveybridge.analytics.service;

import com.surveybridge.analytics.dto.*;
import com.surveybridge.common.exception.ResourceNotFoundException;
import com.surveybridge.dashboard.dto.TimeSeriesPointDto;
import com.surveybridge.response.entity.Answer;
import com.surveybridge.response.entity.SurveyResponse;
import com.surveybridge.response.repository.AnswerRepository;
import com.surveybridge.response.repository.SurveyResponseRepository;
import com.surveybridge.survey.entity.Question;
import com.surveybridge.survey.entity.QuestionType;
import com.surveybridge.survey.entity.Survey;
import com.surveybridge.survey.repository.SurveyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final SurveyRepository surveyRepository;
    private final SurveyResponseRepository responseRepository;
    private final AnswerRepository answerRepository;

    @Cacheable(value = "analytics", key = "#surveyId")
    public SurveyAnalyticsDto getSurveyAnalytics(UUID surveyId, UUID clientId) {
        Survey survey = surveyRepository.findByIdAndClientId(surveyId, clientId)
            .orElseThrow(() -> new ResourceNotFoundException("Survey not found: " + surveyId));

        List<SurveyResponse> responses = responseRepository.findBySurveyId(surveyId);
        List<Answer> allAnswers = answerRepository.findBySurveyId(surveyId);

        double avgDuration = responses.stream()
            .mapToInt(SurveyResponse::getDurationSeconds)
            .average().orElse(0);

        NpsBreakdownDto nps = computeNps(survey, allAnswers);
        DemographicsDto demographics = computeDemographics(responses);
        List<QuestionInsightDto> insights = computeInsights(survey.getQuestions(), allAnswers);

        return new SurveyAnalyticsDto(surveyId, nps, avgDuration, demographics, insights);
    }

    @Cacheable(value = "analytics", key = "'cross:' + #clientId")
    public CrossSurveyAnalyticsDto getCrossSurveyAnalytics(UUID clientId) {
        List<Survey> surveys = surveyRepository.findAllByClientId(clientId, Pageable.unpaged()).getContent();

        List<SurveyPerformanceDto> performance = surveys.stream()
            .filter(s -> s.getStatus().name().equals("LIVE") || s.getStatus().name().equals("COMPLETED")
                || s.getStatus().name().equals("PAUSED"))
            .map(s -> {
                double rate = s.getTargetResponseCount() > 0
                    ? (double) s.getReceivedResponseCount() / s.getTargetResponseCount() * 100 : 0;
                return new SurveyPerformanceDto(s.getId(), s.getTitle(),
                    s.getReceivedResponseCount(), s.getTargetResponseCount(),
                    Math.round(rate * 10.0) / 10.0, 0, s.getStatus());
            }).toList();

        List<UUID> surveyIds = surveys.stream().map(Survey::getId).toList();
        List<SurveyResponse> allResponses = surveyIds.isEmpty()
            ? List.of()
            : surveyIds.stream().flatMap(id -> responseRepository.findBySurveyId(id).stream()).toList();

        DemographicsDto demo = computeDemographics(allResponses);
        List<DemographicItemDto> byCountry = demo.countries();
        List<DemographicItemDto> byAge = demo.ageGroups();

        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        Map<String, long[]> trendMap = new TreeMap<>();
        for (SurveyResponse r : allResponses) {
            if (r.getCompletedAt().isAfter(thirtyDaysAgo)) {
                String day = r.getCompletedAt().toLocalDate().toString();
                trendMap.computeIfAbsent(day, k -> new long[]{0, 0});
                trendMap.get(day)[0]++;
                if (r.getDurationSeconds() > 0) trendMap.get(day)[1]++;
            }
        }
        List<TimeSeriesPointDto> trend = trendMap.entrySet().stream()
            .map(e -> new TimeSeriesPointDto(e.getKey(), e.getValue()[0], e.getValue()[1]))
            .toList();

        return new CrossSurveyAnalyticsDto(trend, byCountry, byAge, performance);
    }

    private NpsBreakdownDto computeNps(Survey survey, List<Answer> allAnswers) {
        List<UUID> npsQuestionIds = survey.getQuestions().stream()
            .filter(q -> q.getType() == QuestionType.NPS)
            .map(Question::getId)
            .toList();
        if (npsQuestionIds.isEmpty()) return new NpsBreakdownDto(0, 0, 0, 0);

        List<Integer> scores = allAnswers.stream()
            .filter(a -> npsQuestionIds.contains(a.getQuestionId()))
            .map(a -> {
                try { return Integer.parseInt(a.getValue()); } catch (NumberFormatException e) { return -1; }
            })
            .filter(s -> s >= 0 && s <= 10)
            .toList();

        if (scores.isEmpty()) return new NpsBreakdownDto(0, 0, 0, 0);

        long promoters  = scores.stream().filter(s -> s >= 9).count();
        long passives   = scores.stream().filter(s -> s >= 7 && s <= 8).count();
        long detractors = scores.stream().filter(s -> s <= 6).count();
        double total = scores.size();

        double pPro  = Math.round(promoters  / total * 100 * 10.0) / 10.0;
        double pPass = Math.round(passives   / total * 100 * 10.0) / 10.0;
        double pDet  = Math.round(detractors / total * 100 * 10.0) / 10.0;
        int nps = (int) Math.round(pPro - pDet);

        return new NpsBreakdownDto(nps, pPro, pPass, pDet);
    }

    private DemographicsDto computeDemographics(List<SurveyResponse> responses) {
        if (responses.isEmpty()) {
            return new DemographicsDto(List.of(), List.of(), List.of());
        }
        double total = responses.size();

        List<DemographicItemDto> gender = responses.stream()
            .filter(r -> r.getGender() != null)
            .collect(Collectors.groupingBy(SurveyResponse::getGender, Collectors.counting()))
            .entrySet().stream()
            .map(e -> new DemographicItemDto(e.getKey(), Math.round(e.getValue() / total * 100 * 10.0) / 10.0))
            .sorted(Comparator.comparingDouble(DemographicItemDto::pct).reversed())
            .toList();

        List<DemographicItemDto> age = responses.stream()
            .collect(Collectors.groupingBy(r -> ageGroupLabel(r.getAgeGroup()), Collectors.counting()))
            .entrySet().stream()
            .map(e -> new DemographicItemDto(e.getKey(), Math.round(e.getValue() / total * 100 * 10.0) / 10.0))
            .toList();

        List<DemographicItemDto> countries = responses.stream()
            .filter(r -> r.getCountry() != null)
            .collect(Collectors.groupingBy(SurveyResponse::getCountry, Collectors.counting()))
            .entrySet().stream()
            .map(e -> new DemographicItemDto(e.getKey(), Math.round(e.getValue() / total * 100 * 10.0) / 10.0))
            .sorted(Comparator.comparingDouble(DemographicItemDto::pct).reversed())
            .toList();

        return new DemographicsDto(gender, age, countries);
    }

    private List<QuestionInsightDto> computeInsights(List<Question> questions, List<Answer> allAnswers) {
        Map<UUID, List<Answer>> byQuestion = allAnswers.stream()
            .collect(Collectors.groupingBy(Answer::getQuestionId));

        return questions.stream()
            .filter(q -> q.getType() != QuestionType.OPEN_TEXT)
            .map(q -> {
                List<Answer> answers = byQuestion.getOrDefault(q.getId(), List.of());
                double total = answers.size();
                List<AnswerDistributionDto> dist = answers.stream()
                    .collect(Collectors.groupingBy(
                        a -> a.getValue() != null ? a.getValue() : "N/A", Collectors.counting()))
                    .entrySet().stream()
                    .map(e -> new AnswerDistributionDto(e.getKey(),
                        total > 0 ? Math.round(e.getValue() / total * 100 * 10.0) / 10.0 : 0))
                    .sorted(Comparator.comparingDouble(AnswerDistributionDto::pct).reversed())
                    .toList();
                return new QuestionInsightDto(q.getId(), q.getText(), q.getType(), dist);
            }).toList();
    }

    private String ageGroupLabel(int ageGroup) {
        if (ageGroup < 25) return "18–24";
        if (ageGroup < 35) return "25–34";
        if (ageGroup < 45) return "35–44";
        if (ageGroup < 55) return "45–54";
        if (ageGroup < 65) return "55–64";
        return "65+";
    }
}
