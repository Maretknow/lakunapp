const express = require("express");
require("dotenv").config();
const { log } = require("./config/configLogger");
const rateLimit = require("express-rate-limit");
const authRoute = require("./routes/routerAuths");
const useSessions = require("./config/configSessions");
const userRoute = require("./routes/routerUsers");
const kunjunganRoute = require("./routes/routerKunjungan");
const requireAuth = require("./middleware/requireAuth");
const crypto = require("crypto");
const path = require("path");
const app = express();

app.use(express.json());

const limiter = rateLimit({
  windowMs: 60_000, // 1 menit
  max: 10, // 10 percobaan per menit
  standardHeaders: true,
  legacyHeaders: false,
});

app.set("trust proxy", 1);

useSessions(app);

app.use((req, res, next) => {
  req.requestId = crypto.randomUUID();
  req.startedAt = Date.now();
  next();
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/v1/auth", limiter, authRoute);
app.use("/api/v1/users", limiter, requireAuth, userRoute);
app.use("/api/v1/kunjungan", limiter, requireAuth, kunjunganRoute);

app.use(express.static(path.join(__dirname, "public", "dist")));
app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dist", "index.html"));
});

app.use((req, res) => {
  const msg = "Routing tidak di temukan";
  log("warn", {}, req, msg);
  return res.status(404).json({
    status: false,
    message: msg,
    eror: null,
  });
});

app.use((err, req, res, next) => {
  const msg = "Internal Server Eror, Hubungi Vendor!!";
  res.locals.auditError = err?.message || msg;
  log("error", err, req, msg);
  res.status(err.status || 500).json({
    status: false,
    message: msg,
    eror: err.message,
  });
});

module.exports = app;
