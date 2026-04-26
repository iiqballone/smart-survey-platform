package com.surveybridge.response.service;

import com.surveybridge.common.PagedResult;
import com.surveybridge.common.exception.ResourceNotFoundException;
import com.surveybridge.dynata.DynataWebhookValidator;
import com.surveybridge.dynata.dto.DynataWebhookPayload;
import com.surveybridge.response.dto.ResponseDto;
import com.surveybridge.response.entity.SurveyResponse;
import com.surveybridge.response.kafka.ResponseKafkaProducer;
import com.surveybridge.response.mapper.ResponseMapper;
import com.surveybridge.response.repository.SurveyResponseRepository;
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

import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResponseService {

    private final SurveyResponseRepository responseRepository;
    private final SurveyRepository surveyRepository;
    private final ResponseMapper responseMapper;
    private final DynataWebhookValidator webhookValidator;
    private final ResponseKafkaProducer kafkaProducer;

    @Transactional
    public void handleWebhook(String signature, byte[] body, DynataWebhookPayload payload) {
        webhookValidator.validate(signature, body);
        surveyRepository.findById(payload.getSurveyId())
            .orElseThrow(() -> new ResourceNotFoundException("Survey not found: " + payload.getSurveyId()));
        kafkaProducer.publish(payload);
    }

    public PagedResult<ResponseDto> getResponses(UUID surveyId, UUID clientId,
                                                  LocalDateTime from, LocalDateTime to,
                                                  Pageable pageable) {
        validateOwnership(surveyId, clientId);
        Page<SurveyResponse> page = (from != null && to != null)
            ? responseRepository.findBySurveyIdAndCompletedAtBetween(surveyId, from, to, pageable)
            : responseRepository.findBySurveyId(surveyId, pageable);
        return PagedResult.map(page, responseMapper::toDto);
    }

    public void exportResponses(UUID surveyId, UUID clientId, String format,
                                HttpServletResponse httpResponse) throws IOException {
        validateOwnership(surveyId, clientId);
        var responses = responseRepository.findBySurveyId(surveyId);

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

    private void exportCsv(java.util.List<SurveyResponse> responses, HttpServletResponse httpResponse)
            throws IOException {
        PrintWriter writer = httpResponse.getWriter();
        writer.println("id,surveyId,respondentId,country,ageGroup,gender,completedAt,durationSeconds");
        for (SurveyResponse r : responses) {
            writer.printf("%s,%s,%s,%s,%d,%s,%s,%d%n",
                r.getId(), r.getSurveyId(), r.getDynataRespondentId(),
                r.getCountry(), r.getAgeGroup(), r.getGender(),
                r.getCompletedAt(), r.getDurationSeconds());
        }
        writer.flush();
    }

    private void exportExcel(java.util.List<SurveyResponse> responses, HttpServletResponse httpResponse)
            throws IOException {
        try (SXSSFWorkbook workbook = new SXSSFWorkbook(100)) {
            Sheet sheet = workbook.createSheet("Responses");
            Row header = sheet.createRow(0);
            String[] cols = {"ID", "Survey ID", "Respondent ID", "Country", "Age Group", "Gender", "Completed At", "Duration (s)"};
            for (int i = 0; i < cols.length; i++) header.createCell(i).setCellValue(cols[i]);
            int rowNum = 1;
            for (SurveyResponse r : responses) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(r.getId().toString());
                row.createCell(1).setCellValue(r.getSurveyId().toString());
                row.createCell(2).setCellValue(r.getDynataRespondentId());
                row.createCell(3).setCellValue(r.getCountry());
                row.createCell(4).setCellValue(r.getAgeGroup());
                row.createCell(5).setCellValue(r.getGender());
                row.createCell(6).setCellValue(r.getCompletedAt().toString());
                row.createCell(7).setCellValue(r.getDurationSeconds());
            }
            workbook.write(httpResponse.getOutputStream());
        }
    }

    private void validateOwnership(UUID surveyId, UUID clientId) {
        surveyRepository.findByIdAndClientId(surveyId, clientId)
            .orElseThrow(() -> new ResourceNotFoundException("Survey not found: " + surveyId));
    }
}
