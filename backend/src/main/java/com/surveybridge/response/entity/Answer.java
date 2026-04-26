package com.surveybridge.response.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "answers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Answer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "response_id", nullable = false)
    @JsonIgnore
    private SurveyResponse response;

    @Column(name = "question_id", nullable = false)
    private UUID questionId;

    @Column(name = "question_text", columnDefinition = "text")
    private String questionText;

    @Column(columnDefinition = "text")
    private String value;
}
