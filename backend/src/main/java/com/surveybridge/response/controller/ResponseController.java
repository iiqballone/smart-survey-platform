package com.surveybridge.response.controller;

import com.surveybridge.common.CurrentUserContext;
import com.surveybridge.common.PagedResult;
import com.surveybridge.fusion.dto.FusionEventPayload;
import com.surveybridge.response.dto.ResponseDto;
import com.surveybridge.response.service.ResponseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.ContentCachingRequestWrapper;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Responses")
public class ResponseController {

    private final ResponseService responseService;
    private final CurrentUserContext ctx;

    @PostMapping("/api/v1/webhook/fusion")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @Operation(summary = "Receive Fusion event webhook (HMAC-signed, no auth required)")
    public void fusionWebhook(
            @RequestHeader(value = "X-Fusion-Signature", required = false) String signature,
            @RequestBody FusionEventPayload payload,
            HttpServletRequest request) {
        byte[] body = new byte[0];
        if (request instanceof ContentCachingRequestWrapper wrapper) {
            body = wrapper.getContentAsByteArray();
        }
        responseService.handleFusionWebhook(signature, body, payload);
    }

    @GetMapping("/api/v1/surveys/{surveyId}/responses")
    @Operation(summary = "List events for a survey")
    public PagedResult<ResponseDto> list(
            @PathVariable UUID surveyId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return responseService.getResponses(surveyId, ctx.getClientId(), from, to,
            PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "occurredAt")));
    }

    @GetMapping("/api/v1/surveys/{surveyId}/responses/export")
    @Operation(summary = "Export events as CSV or Excel")
    public void export(@PathVariable UUID surveyId,
                       @RequestParam(defaultValue = "csv") String format,
                       HttpServletResponse response) throws IOException {
        responseService.exportResponses(surveyId, ctx.getClientId(), format, response);
    }
}
