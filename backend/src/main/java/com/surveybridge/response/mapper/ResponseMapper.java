package com.surveybridge.response.mapper;

import com.surveybridge.response.dto.ResponseDto;
import com.surveybridge.response.entity.SurveyResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ResponseMapper {
    ResponseDto toDto(SurveyResponse response);
}
