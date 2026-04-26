CREATE TABLE surveys (
    id                       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id                UUID         NOT NULL REFERENCES clients(id),
    title                    VARCHAR(500) NOT NULL,
    description              TEXT,
    status                   VARCHAR(50)  NOT NULL DEFAULT 'DRAFT',
    dynata_project_id        VARCHAR(255),
    targeting_country        VARCHAR(10),
    targeting_age_min        INT,
    targeting_age_max        INT,
    targeting_gender         VARCHAR(20),
    targeting_sample_size    INT,
    targeting_incidence_rate INT,
    target_response_count    INT          NOT NULL DEFAULT 0,
    received_response_count  INT          NOT NULL DEFAULT 0,
    created_at               TIMESTAMP    NOT NULL DEFAULT NOW(),
    published_at             TIMESTAMP,
    closed_at                TIMESTAMP
);
