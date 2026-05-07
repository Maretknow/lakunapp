const pool = require("../db/pool");

const findByUsername = async (username) => {
  const sql = "SELECT * FROM users WHERE username = $1 LIMIT 1";
  const { rows } = await pool.query(sql, [username]);
  return rows[0];
};

const listUser = async ({
  limit = 20,
  offset = 0,
  username,
  nama_lengkap,
  kode_kantor,
}) => {
  const values = [];
  const where = [];
  let i = 1;

  if (username) {
    where.push(`username ILIKE $${i++}`);
    values.push(`%${username}%`);
  }
  if (nama_lengkap) {
    where.push(`nama_lengkap ILIKE $${i++}`);
    values.push(`%${nama_lengkap}%`);
  }
  if (kode_kantor) {
    where.push(`kode_kantor = $${i++}`);
    values.push(kode_kantor);
  }

  values.push(limit, offset);

  const sql = `SELECT id_user, username, nama_lengkap, role, status, kode_kantor, expires_at, update_at, create_at FROM users
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY id_user DESC LIMIT $${i++} OFFSET $${i++}`;
  const { rows } = await pool.query(sql, values);
  return rows;
};

const findUserById = async (id) => {
  const sql =
    "SELECT id_user, username, nama_lengkap, role, status, level, kode_kantor, update_at, create_at FROM users WHERE id_user = $1 LIMIT 1";
  const { rows } = await pool.query(sql, [id]);
  return rows[0];
};

const insertUser = async ({
  username,
  nama_lengkap,
  password,
  role = "operator",
  status = "pending",
  level,
  kode_kantor,
}) => {
  const sql =
    "INSERT INTO users (username, nama_lengkap, password, role, status, level, kode_kantor) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_user, username, nama_lengkap, role, status, level, kode_kantor, create_at, update_at";
  const { rows } = await pool.query(sql, [
    username,
    nama_lengkap,
    password,
    role,
    status,
    level,
    kode_kantor,
  ]);
  return rows[0];
};

const updateUserById = async (
  id,
  { nama_lengkap, password, role, status, level, kode_kantor },
) => {
  const sets = [];
  const values = [];
  let i = 1;

  if (nama_lengkap !== undefined) {
    sets.push(`nama_lengkap = $${i++}`);
    values.push(nama_lengkap);
  }
  if (password !== undefined) {
    sets.push(`password = $${i++}`);
    values.push(password);
  }
  if (role !== undefined) {
    sets.push(`role = $${i++}`);
    values.push(role);
  }
  if (status !== undefined) {
    sets.push(`status = $${i++}`);
    values.push(status);
  }

  if (level !== undefined) {
    sets.push(`level = $${i++}`);
    values.push(level);
  }

  if (kode_kantor !== undefined) {
    sets.push(`kode_kantor = $${i++}`);
    values.push(kode_kantor);
  }

  const date = new Date();
  date.setMonth(date.getMonth() + 3);

  sets.push(`expires_at = $${i++}`);
  values.push(date);

  const sql = `UPDATE users SET ${sets.join(", ")} WHERE id_user = $${i} RETURNING id_user, username, nama_lengkap, role, status, level, kode_kantor, create_at, update_at`;
  values.push(id);

  const { rows } = await pool.query(sql, values);
  return rows[0];
};

const insertAprovalHistory = async ({
  user_id,
  level,
  decision,
  note,
  ap_user_id,
  ap_username,
}) => {
  const sql = `INSERT INTO user_approval_history
      (user_id, level, decision, note, ap_user_id, ap_username)
    VALUES
      ($1, $2, $3, $4, $5, $6)
    RETURNING id, user_id, level, decision, note, ap_user_id, ap_username, aprove_at
  `;

  const { rows } = await pool.query(sql, [
    user_id,
    level,
    decision,
    note,
    ap_user_id,
    ap_username,
  ]);

  return rows[0];
};

const hardDeleteUserById = async (id) => {
  const sql = `DELETE FROM users WHERE id_user = $1 RETURNING id_user, username, nama_lengkap, role, status, level, kode_kantor, expires_at, create_at, update_at`;
  const { rows } = await pool.query(sql, [id]);
  return rows[0];
};

const countUsers = async ({ username, nama_lengkap, kode_kantor }) => {
  const values = [];
  const where = [];
  let i = 1;

  if (username) {
    where.push(`username ILIKE $${i++}`);
    values.push(`%${username}%`);
  }
  if (nama_lengkap) {
    where.push(`nama_lengkap ILIKE $${i++}`);
    values.push(`%${nama_lengkap}%`);
  }
  if (kode_kantor) {
    where.push(`kode_kantor = $${i++}`);
    values.push(kode_kantor);
  }

  const sql = `SELECT COUNT(*) AS total FROM users ${where.length ? `WHERE ${where.join(" AND ")}` : ""}`;
  const { rows } = await pool.query(sql, values);
  return rows[0];
};

module.exports = {
  findByUsername,
  listUser,
  insertUser,
  findUserById,
  updateUserById,
  insertAprovalHistory,
  hardDeleteUserById,
  countUsers,
};
