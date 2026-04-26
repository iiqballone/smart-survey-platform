package com.surveybridge.fusion;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "fusion")
public class FusionProperties {
    private String apiKey;
    private String webhookSecret;
    private String baseUrl = "https://api.purespectrum.com";
}
