const fs = require("fs");
const path = require("path");
const pool = require("../db/pool");
const { log } = require("./configLogger");

const runMigration = async () => {
  try {
    const files = [
      "../migrations/001_create_users.sql",
      "../migrations/002_create_audit_log.sql",
      "../migrations/003_create_kunjungan_nsb.sql",
      "../migrations/004_alter_kunjungan_tgl_kunjungan_to_date.sql",
    ];
    for (const file of files) {
      const sql = fs.readFileSync(path.join(__dirname, file), "utf8");
      await pool.query(sql);
      const msg = `Migrasi table ${file.split("/").pop()} selesai`;
      log("warn", {}, {}, msg);
    }
  } catch (err) {
    throw err;
  }
};

module.exports = runMigration;
