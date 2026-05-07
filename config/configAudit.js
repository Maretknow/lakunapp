const { insertAuditLog } = require("../models/modelAuditLogs");

const durationMs = (req) => (req.startedAt ? Date.now() - req.startedAt : null);

const REDACT_KEYS = new Set([
  "password",
  "token",
  "authorization",
  "cookie",
  "set-cookie",
]);

const sanitize = (value, depth = 0) => {
  const MAX_DEPTH = 5;
  const MAX_ARRAY = 10;
  const MAX_KEYS = 50;
  const MAX_STR = 500;

  if (value === null || value === undefined) return null;
  if (depth > MAX_DEPTH) return "[truncated]";
  if (typeof value === "string")
    return value.length > MAX_STR ? value.slice(0, MAX_STR) + "..." : value;
  if (typeof value !== "object") return value;
  if (value instanceof Date) return value.toISOString();
  //ringkas pola umum
  if (!Array.isArray(value) && Array.isArray(value.data)) {
    const sample = value.data.slice(0, 3).map((x) => sanitize(x, depth + 1));
    return {
      ...value,
      data: { length: value.data.length, sample },
      truncated: value.data.length > 3,
    };
  }

  if (Array.isArray(value)) {
    const sliced = value.slice(0, MAX_ARRAY).map((x) => sanitize(x, depth + 1));
    return value.length > MAX_ARRAY
      ? { length: value.length, sample: sliced, truncated: true }
      : sliced;
  }

  const out = {};
  for (const [k, v] of Object.entries(value).slice(0, MAX_KEYS)) {
    out[k] = REDACT_KEYS.has(String(k).toLowerCase())
      ? "[redacted]"
      : sanitize(v, depth + 1);
  }

  return out;
};

const audit = async (
  req,
  res,
  {
    type,
    type_id = null,
    before = null,
    after = null,
    error = null,
    status_code = null,
    message = null,
  } = {},
) => {
  return insertAuditLog({
    request_id: req.requestId,
    user_id: req.session?.userId ?? null,
    username: req.session?.username ?? null,
    ip: req.ip,
    user_agent: req.headers["user-agent"]
      ? String(req.headers["user-agent"])
      : null,
    method: req.method,
    path: req.originalUrl || req.url,
    status_code: status_code ?? res.statusCode ?? null,
    duration_ms: durationMs(req),
    type,
    type_id,
    before: sanitize(before),
    after: sanitize(after),
    error,
    message,
  });
};

module.exports = { audit };
