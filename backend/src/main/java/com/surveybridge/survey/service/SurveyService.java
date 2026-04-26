package com.surveybridge.survey.service;

import com.surveybridge.common.PagedResult;
import com.surveybridge.common.exception.ResourceNotFoundException;
import com.surveybridge.fusion.FusionApiClient;
import com.surveybridge.fusion.dto.FusionCreateSurveyResponse;
import com.surveybridge.survey.dto.CreateSurveyRequestDto;
import com.surveybridge.survey.dto.SurveyDto;
import com.surveybridge.survey.entity.Survey;
import com.surveybridge.survey.entity.SurveyStatus;
import com.surveybridge.survey.mapper.SurveyMapper;
import com.surveybridge.survey.repository.SurveyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SurveyService {

    private final SurveyRepository surveyRepository;
    private final FusionApiClient fusionApiClient;
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
            .surveyUrl(req.surveyUrl())
            .completesRequired(req.completesRequired())
            .loi(req.loi())
            .country(req.country())
            .cpiMin(req.cpiRange().min())
            .cpiMax(req.cpiRange().max())
            .callbackUrl(req.callbackUrl())
            .status(SurveyStatus.DRAFT)
            .build();
        return surveyMapper.toDto(surveyRepository.save(survey));
    }

    @Transactional
    public SurveyDto updateSurvey(UUID surveyId, UUID clientId, CreateSurveyRequestDto req) {
        Survey survey = findOwned(surveyId, clientId);
        if (survey.getStatus() != SurveyStatus.DRAFT) {
            throw new IllegalArgumentException("Only DRAFT surveys can be edited");
        }
        survey.setTitle(req.title());
        survey.setSurveyUrl(req.surveyUrl());
        survey.setCompletesRequired(req.completesRequired());
        survey.setLoi(req.loi());
        survey.setCountry(req.country());
        survey.setCpiMin(req.cpiRange().min());
        survey.setCpiMax(req.cpiRange().max());
        survey.setCallbackUrl(req.callbackUrl());
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
        FusionCreateSurveyResponse fusionResponse = fusionApiClient.createSurvey(
            surveyId,
            survey.getSurveyUrl(),
            survey.getCompletesRequired(),
            survey.getLoi(),
            survey.getCountry(),
            survey.getCpiMax()
        );
        survey.setFusionSurveyId(fusionResponse.getFusionSurveyId());
        survey.setFusionEntryUrl(fusionResponse.getEntryUrl());
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
        fusionApiClient.pauseSurvey(survey.getFusionSurveyId());
        survey.setStatus(SurveyStatus.PAUSED);
        return surveyMapper.toDto(surveyRepository.save(survey));
    }

    @Transactional
    public SurveyDto closeSurvey(UUID surveyId, UUID clientId) {
        Survey survey = findOwned(surveyId, clientId);
        if (survey.getStatus() == SurveyStatus.COMPLETED) {
            throw new IllegalArgumentException("Survey is already completed");
        }
        if (survey.getFusionSurveyId() != null) {
            fusionApiClient.closeSurvey(survey.getFusionSurveyId());
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
