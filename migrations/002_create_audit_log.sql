CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    request_id TEXT NOT NULL,
    user_id BIGINT NULL,
    username TEXT NULL,
    ip TEXT NULL,
    user_agent TEXT NULL,
    method TEXT NOT NULL,
    path TEXT NOT NULL,
    status_code INT NULL,
    duration_ms INT NULL,
    type TEXT NULL,
    type_id TEXT NULL,
    before JSONB NULL,
    after JSONB NULL,
    error TEXT NULL,
    message TEXT NULL,
    create_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE audit_logs
  DROP CONSTRAINT IF EXISTS fk_audit_logs_user_id;

ALTER TABLE audit_logs
    ADD CONSTRAINT fk_audit_logs_user_id
    FOREIGN KEY (user_id) REFERENCES users(id_user) ON DELETE SET NULL;