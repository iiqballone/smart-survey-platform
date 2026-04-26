package com.surveybridge.survey.service;

import com.surveybridge.client.entity.Client;
import com.surveybridge.client.service.ClientService;
import com.surveybridge.common.PagedResult;
import com.surveybridge.common.exception.QuotaExceededException;
import com.surveybridge.common.exception.ResourceNotFoundException;
import com.surveybridge.dynata.DynataApiClient;
import com.surveybridge.survey.dto.CreateSurveyRequestDto;
import com.surveybridge.survey.dto.SurveyDto;
import com.surveybridge.survey.entity.*;
import com.surveybridge.survey.mapper.SurveyMapper;
import com.surveybridge.survey.repository.SurveyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SurveyService {

    private final SurveyRepository surveyRepository;
    private final ClientService clientService;
    private final DynataApiClient dynataApiClient;
    private final SurveyMapper surveyMapper;

    public PagedResult<SurveyDto> listSurveys(UUID clientId, String status, Pageable pageable) {
        Page<Survey> page = (status != null)
            ? surveyRepository.findAllByClientIdAndStatus(clientId, SurveyStatus.valueOf(status), pageable)
            : surveyRepository.findAllByClientId(clientId, pageable);
        return PagedResult.map(page, surveyMapper::toDto);
    }

    public SurveyDto getSurvey(UUID surveyId, UUID clientId) {
        return surveyMapper.toDto(findOwned(surveyId, clientId));
    }

    @Transactional
    public SurveyDto createSurvey(UUID clientId, CreateSurveyRequestDto req) {
        Survey survey = Survey.builder()
            .clientId(clientId)
            .title(req.title())
            .description(req.description())
            .targeting(surveyMapper.toEntity(req.targeting()))
            .targetResponseCount(req.targeting().sampleSize())
            .status(SurveyStatus.DRAFT)
            .build();

        List<Question> questions = new ArrayList<>();
        for (int i = 0; i < req.questions().size(); i++) {
            var q = req.questions().get(i);
            Question question = Question.builder()
                .survey(survey)
                .orderIndex(i)
                .text(q.text())
                .type(q.type())
                .required(q.required())
                .build();
            if (q.options() != null) {
                List<QuestionOption> opts = new ArrayList<>();
                for (int j = 0; j < q.options().size(); j++) {
                    String opt = q.options().get(j);
                    opts.add(QuestionOption.builder()
                        .question(question)
                        .orderIndex(j)
                        .label(opt)
                        .value(opt.toLowerCase().replace(' ', '_'))
                        .build());
                }
                question.setOptions(opts);
            }
            questions.add(question);
        }
        survey.setQuestions(questions);
        return surveyMapper.toDto(surveyRepository.save(survey));
    }

    @Transactional
    public SurveyDto updateSurvey(UUID surveyId, UUID clientId, CreateSurveyRequestDto req) {
        Survey survey = findOwned(surveyId, clientId);
        if (survey.getStatus() != SurveyStatus.DRAFT) {
            throw new IllegalArgumentException("Only DRAFT surveys can be edited");
        }
        survey.setTitle(req.title());
        survey.setDescription(req.description());
        survey.setTargeting(surveyMapper.toEntity(req.targeting()));
        survey.setTargetResponseCount(req.targeting().sampleSize());
        survey.getQuestions().clear();
        for (int i = 0; i < req.questions().size(); i++) {
            var q = req.questions().get(i);
            Question question = Question.builder()
                .survey(survey)
                .orderIndex(i)
                .text(q.text())
                .type(q.type())
                .required(q.required())
                .build();
            if (q.options() != null) {
                List<QuestionOption> opts = new ArrayList<>();
                for (int j = 0; j < q.options().size(); j++) {
                    String opt = q.options().get(j);
                    opts.add(QuestionOption.builder()
                        .question(question).orderIndex(j)
                        .label(opt).value(opt.toLowerCase().replace(' ', '_'))
                        .build());
                }
                question.setOptions(opts);
            }
            survey.getQuestions().add(question);
        }
        return surveyMapper.toDto(surveyRepository.save(survey));
    }

    @Transactional
    public void deleteSurvey(UUID surveyId, UUID clientId) {
        Survey survey = findOwned(surveyId, clientId);
        if (survey.getStatus() != SurveyStatus.DRAFT) {
            throw new IllegalArgumentException("Only DRAFT surveys can be deleted");
        }
        surveyRepository.delete(survey);
    }

    @Transactional
    public SurveyDto publishSurvey(UUID surveyId, UUID clientId) {
        Survey survey = findOwned(surveyId, clientId);
        if (survey.getStatus() != SurveyStatus.DRAFT) {
            throw new IllegalArgumentException("Only DRAFT surveys can be published");
        }
        Client client = clientService.getById(clientId);
        int remaining = client.getMonthlyResponseQuota() - client.getUsedResponseCount();
        if (remaining < survey.getTargetResponseCount()) {
            throw new QuotaExceededException(
                "Insufficient quota: need " + survey.getTargetResponseCount() + ", available " + remaining);
        }
        DynataTargeting t = survey.getTargeting();
        String dynataId = dynataApiClient.createProject(surveyId, survey.getTitle(), Map.of(
            "country", t.getCountry(),
            "ageMin", t.getAgeMin(),
            "ageMax", t.getAgeMax(),
            "gender", t.getGender(),
            "sampleSize", t.getSampleSize(),
            "incidenceRate", t.getIncidenceRate()
        ));
        survey.setDynataProjectId(dynataId);
        survey.setStatus(SurveyStatus.LIVE);
        survey.setPublishedAt(LocalDateTime.now());
        return surveyMapper.toDto(surveyRepository.save(survey));
    }

    @Transactional
    public SurveyDto pauseSurvey(UUID surveyId, UUID clientId) {
        Survey survey = findOwned(surveyId, clientId);
        if (survey.getStatus() != SurveyStatus.LIVE) {
            throw new IllegalArgumentException("Only LIVE surveys can be paused");
        }
        dynataApiClient.pauseProject(survey.getDynataProjectId());
        survey.setStatus(SurveyStatus.PAUSED);
        return surveyMapper.toDto(surveyRepository.save(survey));
    }

    @Transactional
    public SurveyDto closeSurvey(UUID surveyId, UUID clientId) {
        Survey survey = findOwned(surveyId, clientId);
        if (survey.getStatus() == SurveyStatus.COMPLETED) {
            throw new IllegalArgumentException("Survey is already completed");
        }
        if (survey.getDynataProjectId() != null) {
            dynataApiClient.closeProject(survey.getDynataProjectId());
        }
        survey.setStatus(SurveyStatus.COMPLETED);
        survey.setClosedAt(LocalDateTime.now());
        return surveyMapper.toDto(surveyRepository.save(survey));
    }

    private Survey findOwned(UUID surveyId, UUID clientId) {
        return surveyRepository.findByIdAndClientId(surveyId, clientId)
            .orElseThrow(() -> new ResourceNotFoundException("Survey not found: " + surveyId));
    }
}
