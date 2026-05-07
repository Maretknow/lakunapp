const { createLogger, format, transports } = require("winston");
const { combine, timestamp, errors, colorize, json, printf } = format;
const DailyRotateFile = require("winston-daily-rotate-file");

const logger = createLogger({
  level: process.env.LOG_LEVEL,
  format: combine(
    errors(),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss Z" }),
    json(),
  ),
  transports: [
    new DailyRotateFile({
      filename: "logs/app-%DATE%.log",
      datePattern: "YYYY-MM-DD",
    }),
    new transports.Console({
      format: combine(
        colorize(),
        errors({ stack: true }),
        timestamp({ format: "HH:mm:ss" }),
      ),
    }),
  ],
});

const log = (level, err = {}, req = {}, msg = {}) => {
  logger[level](err, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    msg: msg,
  });
};

module.exports = { logger, log };
