CREATE TABLE survey_responses (
    id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id             UUID        NOT NULL REFERENCES surveys(id),
    dynata_respondent_id  VARCHAR(255),
    country               VARCHAR(10),
    age_group             INT,
    gender                VARCHAR(50),
    completed_at          TIMESTAMP   NOT NULL,
    duration_seconds      INT
);

CREATE TABLE answers (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id   UUID NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,
    question_id   UUID NOT NULL,
    question_text TEXT,
    value         TEXT
);
