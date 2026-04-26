package com.surveybridge.survey.mapper;

import com.surveybridge.survey.dto.SurveyDto;
import com.surveybridge.survey.entity.Survey;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SurveyMapper {
    SurveyDto toDto(Survey survey);
}
