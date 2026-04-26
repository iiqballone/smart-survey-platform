package com.surveybridge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.kafka.annotation.EnableKafka;

@SpringBootApplication
@EnableCaching
@EnableKafka
@ConfigurationPropertiesScan
public class SurveyBridgeApplication {
    public static void main(String[] args) {
        SpringApplication.run(SurveyBridgeApplication.class, args);
    }
}
