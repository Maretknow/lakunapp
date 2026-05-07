const pool = require("../db/pool");

const insertAuditLog = async(payload) => {
    const sql = `INSERT INTO audit_logs (
    request_id, user_id, username, ip, user_agent, method, path, status_code, duration_ms, type, type_id, before, after, error, message
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13::jsonb, $14, $15)`;

    const values = [
        payload.request_id,
        payload.user_id ?? null,
        payload.username ?? null, 
        payload.ip ?? null,
        payload.user_agent ?? null,
        payload.method ?? null,
        payload.path ?? null,
        payload.status_code ?? null,
        payload.duration_ms ?? null,
        payload.type ?? null,
        payload.type_id ?? null,
        payload.before ? JSON.stringify(payload.before) : null,
        payload.after ? JSON.stringify(payload.after) : null,
        payload.error ?? null,
        payload.message ?? null,
    ];

    await pool.query(sql, values);
};

module.exports = {insertAuditLog};
