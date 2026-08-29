CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    recipient VARCHAR(255) NOT NULL,

    subject VARCHAR(500) NOT NULL,

    body TEXT NOT NULL,

    scheduled_at TIMESTAMPTZ NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'scheduled',

    sender_email VARCHAR(255),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    sent_at TIMESTAMPTZ
);