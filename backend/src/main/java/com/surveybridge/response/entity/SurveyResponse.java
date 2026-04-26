package com.surveybridge.response.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "survey_responses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SurveyResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "survey_id", nullable = false)
    private UUID surveyId;

    @Column(name = "dynata_respondent_id")
    private String dynataRespondentId;

    @Column(length = 10)
    private String country;

    @Column(name = "age_group")
    private int ageGroup;

    @Column(length = 50)
    private String gender;

    @Column(name = "completed_at", nullable = false)
    private LocalDateTime completedAt;

    @Column(name = "duration_seconds")
    private int durationSeconds;

    @OneToMany(mappedBy = "response", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Answer> answers = new ArrayList<>();
}
