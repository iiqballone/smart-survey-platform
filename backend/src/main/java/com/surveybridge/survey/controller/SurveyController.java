package com.surveybridge.survey.controller;

import com.surveybridge.common.CurrentUserContext;
import com.surveybridge.common.PagedResult;
import com.surveybridge.survey.dto.CreateSurveyRequestDto;
import com.surveybridge.survey.dto.SurveyDto;
import com.surveybridge.survey.service.SurveyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/surveys")
@RequiredArgsConstructor
@Tag(name = "Surveys")
public class SurveyController {

    private final SurveyService surveyService;
    private final CurrentUserContext ctx;

    @GetMapping
    @Operation(summary = "List surveys")
    public PagedResult<SurveyDto> list(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        String[] parts = sort.split(",");
        Sort.Direction dir = parts.length > 1 && parts[1].equalsIgnoreCase("asc")
            ? Sort.Direction.ASC : Sort.Direction.DESC;
        return surveyService.listSurveys(ctx.getClientId(), status,
            PageRequest.of(page, size, Sort.by(dir, parts[0])));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create survey")
    public SurveyDto create(@Valid @RequestBody CreateSurveyRequestDto req) {
        return surveyService.createSurvey(ctx.getClientId(), req);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get survey")
    public SurveyDto get(@PathVariable UUID id) {
        return surveyService.getSurvey(id, ctx.getClientId());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update survey")
    public SurveyDto update(@PathVariable UUID id, @Valid @RequestBody CreateSurveyRequestDto req) {
        return surveyService.updateSurvey(id, ctx.getClientId(), req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete survey")
    public void delete(@PathVariable UUID id) {
        surveyService.deleteSurvey(id, ctx.getClientId());
    }

    @PostMapping("/{id}/publish")
    @Operation(summary = "Publish survey to Dynata")
    public SurveyDto publish(@PathVariable UUID id) {
        return surveyService.publishSurvey(id, ctx.getClientId());
    }

    @PostMapping("/{id}/pause")
    @Operation(summary = "Pause survey")
    public SurveyDto pause(@PathVariable UUID id) {
        return surveyService.pauseSurvey(id, ctx.getClientId());
    }

    @PostMapping("/{id}/close")
    @Operation(summary = "Close survey")
    public SurveyDto close(@PathVariable UUID id) {
        return surveyService.closeSurvey(id, ctx.getClientId());
    }
}
