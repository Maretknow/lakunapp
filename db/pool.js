require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASS,
  database: process.env.PGDB,
  port: process.env.PGPORT,
});

pool.on("error", (err) => {
  console.log("Unexpected PG error", err);
});

module.exports = pool;
