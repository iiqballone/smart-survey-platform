CREATE TABLE questions (
    id                UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id         UUID    NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    order_index       INT     NOT NULL,
    text              TEXT    NOT NULL,
    type              VARCHAR(50) NOT NULL,
    required          BOOLEAN NOT NULL DEFAULT FALSE,
    conditional_logic TEXT
);

CREATE TABLE question_options (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID         NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    order_index INT          NOT NULL,
    label       VARCHAR(500) NOT NULL,
    value       VARCHAR(500) NOT NULL
);
