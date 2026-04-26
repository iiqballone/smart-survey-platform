package com.surveybridge.response.service;

import com.surveybridge.common.PagedResult;
import com.surveybridge.common.exception.FusionIntegrationException;
import com.surveybridge.common.exception.ResourceNotFoundException;
import com.surveybridge.fusion.FusionProperties;
import com.surveybridge.fusion.dto.FusionEventPayload;
import com.surveybridge.response.dto.ResponseDto;
import com.surveybridge.response.entity.SurveyResponse;
import com.surveybridge.response.kafka.ResponseKafkaProducer;
import com.surveybridge.response.mapper.ResponseMapper;
import com.surveybridge.response.repository.SurveyResponseRepository;
import com.surveybridge.survey.entity.Survey;
import com.surveybridge.survey.repository.SurveyRepository;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResponseService {

    private final SurveyResponseRepository responseRepository;
    private final SurveyRepository surveyRepository;
    private final ResponseMapper responseMapper;
    private final ResponseKafkaProducer kafkaProducer;
    private final FusionProperties fusionProperties;

    @Transactional
    public void handleFusionWebhook(String signature, byte[] body, FusionEventPayload payload) {
        validateSignature(signature, body);
        Survey survey = surveyRepository.findByFusionSurveyId(payload.getFusionSurveyId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Survey not found for Fusion ID: " + payload.getFusionSurveyId()));
        kafkaProducer.publish(survey.getId().toString(), payload);
    }

    public PagedResult<ResponseDto> getResponses(UUID surveyId, UUID clientId,
                                                  LocalDateTime from, LocalDateTime to,
                                                  Pageable pageable) {
        validateOwnership(surveyId, clientId);
        Page<SurveyResponse> page = (from != null && to != null)
            ? responseRepository.findBySurveyIdAndOccurredAtBetween(surveyId, from, to, pageable)
            : responseRepository.findBySurveyId(surveyId, pageable);
        return PagedResult.map(page, responseMapper::toDto);
    }

    public void exportResponses(UUID surveyId, UUID clientId, String format,
                                HttpServletResponse httpResponse) throws IOException {
        validateOwnership(surveyId, clientId);
        List<SurveyResponse> responses = responseRepository.findBySurveyId(surveyId);

        if ("excel".equalsIgnoreCase(format)) {
            httpResponse.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            httpResponse.setHeader("Content-Disposition", "attachment; filename=responses-" + surveyId + ".xlsx");
            exportExcel(responses, httpResponse);
        } else {
            httpResponse.setContentType("text/csv");
            httpResponse.setHeader("Content-Disposition", "attachment; filename=responses-" + surveyId + ".csv");
            exportCsv(responses, httpResponse);
        }
    }

    private void validateSignature(String signature, byte[] body) {
        if (signature == null || signature.isBlank()) {
            throw new org.springframework.security.access.AccessDeniedException(
                "Missing X-Fusion-Signature header");
        }
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(
                fusionProperties.getWebhookSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            String computed = HexFormat.of().formatHex(mac.doFinal(body));
            if (!computed.equals(signature)) {
                throw new org.springframework.security.access.AccessDeniedException(
                    "Invalid webhook signature");
            }
        } catch (org.springframework.security.access.AccessDeniedException e) {
            throw e;
        } catch (Exception e) {
            throw new FusionIntegrationException("Signature validation failed", e);
        }
    }

    private void exportCsv(List<SurveyResponse> responses, HttpServletResponse httpResponse)
            throws IOException {
        PrintWriter writer = httpResponse.getWriter();
        writer.println("id,surveyId,respondentId,fusionSurveyId,eventType,cpi,occurredAt");
        for (SurveyResponse r : responses) {
            writer.printf("%s,%s,%s,%s,%s,%s,%s%n",
                r.getId(), r.getSurveyId(), r.getRespondentId(),
                r.getFusionSurveyId(), r.getEventType(),
                r.getCpi() != null ? r.getCpi() : "",
                r.getOccurredAt());
        }
        writer.flush();
    }

    private void exportExcel(List<SurveyResponse> responses, HttpServletResponse httpResponse)
            throws IOException {
        try (SXSSFWorkbook workbook = new SXSSFWorkbook(100)) {
            Sheet sheet = workbook.createSheet("Responses");
            Row header = sheet.createRow(0);
            String[] cols = {"ID", "Survey ID", "Respondent ID", "Fusion Survey ID", "Event Type", "CPI", "Occurred At"};
            for (int i = 0; i < cols.length; i++) header.createCell(i).setCellValue(cols[i]);
            int rowNum = 1;
            for (SurveyResponse r : responses) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(r.getId().toString());
                row.createCell(1).setCellValue(r.getSurveyId().toString());
                row.createCell(2).setCellValue(r.getRespondentId());
                row.createCell(3).setCellValue(r.getFusionSurveyId());
                row.createCell(4).setCellValue(r.getEventType().name());
                row.createCell(5).setCellValue(r.getCpi() != null ? r.getCpi().toPlainString() : "");
                row.createCell(6).setCellValue(r.getOccurredAt().toString());
            }
            workbook.write(httpResponse.getOutputStream());
        }
    }

    private void validateOwnership(UUID surveyId, UUID clientId) {
        surveyRepository.findByIdAndClientId(surveyId, clientId)
            .orElseThrow(() -> new ResourceNotFoundException("Survey not found: " + surveyId));
    }
}
