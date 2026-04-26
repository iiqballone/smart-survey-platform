CREATE TABLE notifications (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id  UUID         NOT NULL REFERENCES clients(id),
    type       VARCHAR(50)  NOT NULL,
    title      VARCHAR(500) NOT NULL,
    body       TEXT,
    link       VARCHAR(500),
    read       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);
