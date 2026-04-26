CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE clients (
    id                     UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name                   VARCHAR(255) NOT NULL,
    keycloak_group_id      VARCHAR(255),
    contact_email          VARCHAR(255) NOT NULL,
    plan                   VARCHAR(50)  NOT NULL DEFAULT 'STARTER',
    monthly_response_quota INT          NOT NULL DEFAULT 1000,
    used_response_count    INT          NOT NULL DEFAULT 0,
    active                 BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at             TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE client_users (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id         UUID         NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    keycloak_user_id  VARCHAR(255),
    email             VARCHAR(255) NOT NULL,
    role              VARCHAR(50)  NOT NULL,
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW()
);
