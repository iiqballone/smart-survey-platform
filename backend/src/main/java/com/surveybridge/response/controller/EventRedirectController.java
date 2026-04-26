package com.surveybridge.response.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@Tag(name = "Redirects")
public class EventRedirectController {

    @GetMapping("/complete")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Completion redirect from SurveyMonkey (no auth required)")
    public void complete(@RequestParam("UID") String respondentId) {
        log.info("Completion redirect received for respondent {}", respondentId);
    }

    @GetMapping("/terminate")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Screenout redirect from SurveyMonkey (no auth required)")
    public void terminate(@RequestParam("UID") String respondentId) {
        log.info("Screenout redirect received for respondent {}", respondentId);
    }
}
