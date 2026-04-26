package com.surveybridge.response.repository;

import com.surveybridge.response.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface AnswerRepository extends JpaRepository<Answer, UUID> {

    @Query("SELECT a FROM Answer a WHERE a.response.surveyId = :surveyId AND a.questionId IN :questionIds")
    List<Answer> findBySurveyIdAndQuestionIdIn(
        @Param("surveyId") UUID surveyId,
        @Param("questionIds") List<UUID> questionIds);

    @Query("SELECT a FROM Answer a WHERE a.response.surveyId = :surveyId")
    List<Answer> findBySurveyId(@Param("surveyId") UUID surveyId);
}
