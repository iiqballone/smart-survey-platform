package com.surveybridge.survey.mapper;

import com.surveybridge.survey.dto.*;
import com.surveybridge.survey.entity.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SurveyMapper {

    @Mapping(target = "targeting.country", source = "targeting.country")
    @Mapping(target = "targeting.ageMin",  source = "targeting.ageMin")
    @Mapping(target = "targeting.ageMax",  source = "targeting.ageMax")
    @Mapping(target = "targeting.gender",  source = "targeting.gender")
    @Mapping(target = "targeting.sampleSize", source = "targeting.sampleSize")
    @Mapping(target = "targeting.incidenceRate", source = "targeting.incidenceRate")
    SurveyDto toDto(Survey survey);

    TargetingDto toDto(DynataTargeting targeting);

    QuestionDto toDto(Question question);

    QuestionOptionDto toDto(QuestionOption option);

    DynataTargeting toEntity(TargetingDto dto);
}
