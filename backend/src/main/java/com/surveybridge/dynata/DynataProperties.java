package com.surveybridge.dynata;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "dynata")
public class DynataProperties {
    private String apiKey;
    private String webhookSecret;
    private String baseUrl = "https://api.dynata.com";
}
