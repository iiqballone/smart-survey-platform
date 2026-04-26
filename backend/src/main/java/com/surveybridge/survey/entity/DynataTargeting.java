package com.surveybridge.survey.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DynataTargeting {

    @Column(name = "targeting_country")
    private String country;

    @Column(name = "targeting_age_min")
    private Integer ageMin;

    @Column(name = "targeting_age_max")
    private Integer ageMax;

    @Enumerated(EnumType.STRING)
    @Column(name = "targeting_gender")
    private Gender gender;

    @Column(name = "targeting_sample_size")
    private Integer sampleSize;

    @Column(name = "targeting_incidence_rate")
    private Integer incidenceRate;
}
