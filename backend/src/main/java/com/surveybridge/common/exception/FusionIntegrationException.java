package com.surveybridge.common.exception;

public class FusionIntegrationException extends RuntimeException {
    public FusionIntegrationException(String message) {
        super(message);
    }
    public FusionIntegrationException(String message, Throwable cause) {
        super(message, cause);
    }
}
