package com.surveybridge.common.exception;

public class DynataIntegrationException extends RuntimeException {
    public DynataIntegrationException(String message) {
        super(message);
    }

    public DynataIntegrationException(String message, Throwable cause) {
        super(message, cause);
    }
}
