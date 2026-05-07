const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const pool = require("../db/pool");

const isProduction = process.env.NODE_ENV === "production";

module.exports = (app) => {
  app.use(
    session({
      store: new pgSession({
        pool,
        tableName: "user_sessions",
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      },
    }),
  );
};
