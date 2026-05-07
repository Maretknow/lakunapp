CREATE TABLE IF NOT EXISTS users (
    id_user BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    nama_lengkap TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'operator',
    status TEXT NOT NULL DEFAULT 'pending',
    level INT NOT NULL CHECK (level BETWEEN 1 AND 10),
    kode_kantor TEXT NOT NULL,
    expires_at TIMESTAMPTZ NULL,
    create_at TIMESTAMPTZ DEFAULT now(),
    update_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO users (username, nama_lengkap, password, role, kode_kantor, status, level, expires_at) VALUES ('superadmin', 'Administrator' ,'$2b$10$B5zJZgOgJZx1cbuGhzDavujmGjnCqshKPfUNwz0Gy0W0d7sHpUhzW', 'super-admin', '001','aktif', 10, NOW() + interval '100 days') 
ON CONFLICT (username) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

CREATE OR REPLACE FUNCTION trg_set_users_update_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.update_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_users_update_at ON users;

CREATE TRIGGER set_users_update_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trg_set_users_update_at();

CREATE TABLE IF NOT EXISTS user_approval_history (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    level INT NOT NULL CHECK (level BETWEEN 1 AND 10),
    decision TEXT NOT NULL,
    note TEXT NULL,
    ap_user_id BIGINT REFERENCES users(id_user) ON DELETE SET NULL,
    ap_username TEXT NULL,
    aprove_at TIMESTAMPTZ NOT NULL DEFAULT now()
);