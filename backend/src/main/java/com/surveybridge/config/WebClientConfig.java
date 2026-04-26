package com.surveybridge.config;

import com.surveybridge.dynata.DynataProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient dynataWebClient(DynataProperties props) {
        return WebClient.builder()
            .baseUrl(props.getBaseUrl())
            .defaultHeader("Authorization", "Bearer " + props.getApiKey())
            .defaultHeader("Content-Type", "application/json")
            .build();
    }
}
