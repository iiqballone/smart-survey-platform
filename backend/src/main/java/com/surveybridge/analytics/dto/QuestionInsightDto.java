package com.surveybridge.analytics.dto;

import com.surveybridge.survey.entity.QuestionType;

import java.util.List;
import java.util.UUID;

public record QuestionInsightDto(
    UUID questionId,
    String questionText,
    QuestionType type,
    List<AnswerDistributionDto> answerDistribution
) {}
