const pool = require("../db/pool");

const listKunjungan = async ({
  limit,
  offset,
  ao_user_id,
  ao_username,
  kode_kantor,
  nama_nasabah,
  no_rekening,
  tgl_kunjungan,
}) => {
  const values = [];
  const where = [];
  let i = 1;

  if (ao_user_id !== undefined && ao_user_id !== null) {
    where.push(`ao_user_id = $${i++}`);
    values.push(ao_user_id);
  }
  if (ao_username) {
    where.push(`ao_username = $${i++}`);
    values.push(ao_username);
  }
  if (nama_nasabah) {
    where.push(`nama_nasabah ILIKE $${i++}`);
    values.push(`%${nama_nasabah}%`);
  }
  if (no_rekening) {
    where.push(`no_rekening = $${i++}`);
    values.push(no_rekening);
  }
  if (kode_kantor) {
    where.push(`kode_kantor = $${i++}`);
    values.push(kode_kantor);
  }
  if (tgl_kunjungan) {
    where.push(`tgl_kunjungan = $${i++}`);
    values.push(tgl_kunjungan);
  }

  values.push(limit, offset);

  const sql = `SELECT id_kunjungan, ao_user_id, ao_username, ao_nama_lengkap, ao_bagian, kode_kantor, tgl_kunjungan, tipe_nasabah , nama_nasabah, no_rekening, kol_nsb, alamat_nsb, ket_hasil, url_foto, create_at, update_at
  FROM kunjungan_nsb ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY tgl_kunjungan DESC NULLS LAST, id_kunjungan DESC LIMIT $${i++} OFFSET $${i++}`;

  const { rows } = await pool.query(sql, values);

  return rows;
};

const findKunjunganById = async (id) => {
  const sql = `SELECT id_kunjungan, ao_user_id, ao_username, ao_nama_lengkap, ao_bagian, kode_kantor, tgl_kunjungan, tipe_nasabah, nama_nasabah, no_rekening, kol_nsb, alamat_nsb, ket_hasil, url_foto, create_at, update_at FROM kunjungan_nsb WHERE id_kunjungan = $1 LIMIT 1`;
  const { rows } = await pool.query(sql, [id]);
  return rows[0] || null;
};

const insertKunjungan = async ({
  ao_user_id,
  ao_username,
  ao_nama_lengkap,
  ao_bagian,
  kode_kantor,
  tgl_kunjungan,
  tipe_nasabah,
  nama_nasabah,
  no_rekening,
  kol_nsb,
  alamat_nsb,
  ket_hasil,
  url_foto,
}) => {
  const sql = `INSERT INTO kunjungan_nsb (
  ao_user_id, ao_username, ao_nama_lengkap, ao_bagian, kode_kantor, tgl_kunjungan, tipe_nasabah, nama_nasabah, no_rekening, kol_nsb, alamat_nsb, ket_hasil, url_foto)
  VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
  RETURNING id_kunjungan, ao_user_id, ao_username, ao_nama_lengkap, ao_bagian, kode_kantor, tgl_kunjungan, tipe_nasabah, nama_nasabah, no_rekening, kol_nsb, alamat_nsb, ket_hasil, url_foto, create_at, update_at 
  `;
  const values = [
    ao_user_id ?? null,
    ao_username,
    ao_nama_lengkap,
    ao_bagian,
    kode_kantor,
    tgl_kunjungan ?? null,
    tipe_nasabah,
    nama_nasabah,
    no_rekening ?? null,
    kol_nsb ?? null,
    alamat_nsb,
    ket_hasil,
    url_foto,
  ];

  const { rows } = await pool.query(sql, values);
  return rows[0] || null;
};

const updateKunjunganById = async (
  id,
  {
    tgl_kunjungan,
    tipe_nasabah,
    nama_nasabah,
    no_rekening,
    kol_nsb,
    alamat_nsb,
    ket_hasil,
    url_foto,
  },
) => {
  const sets = [];
  const values = [];
  let i = 1;

  if (tgl_kunjungan !== undefined) {
    sets.push(`tgl_kunjungan = $${i++}`);
    values.push(tgl_kunjungan);
  }
  if (tipe_nasabah !== undefined) {
    sets.push(`tipe_nasabah = $${i++}`);
    values.push(tipe_nasabah);
  }
  if (nama_nasabah !== undefined) {
    sets.push(`nama_nasabah = $${i++}`);
    values.push(nama_nasabah);
  }
  if (kol_nsb !== undefined) {
    sets.push(`kol_nsb = $${i++}`);
    values.push(kol_nsb);
  }
  if (no_rekening !== undefined) {
    sets.push(`no_rekening = $${i++}`);
    values.push(no_rekening);
  }
  if (alamat_nsb !== undefined) {
    sets.push(`alamat_nsb = $${i++}`);
    values.push(alamat_nsb);
  }
  if (ket_hasil !== undefined) {
    sets.push(`ket_hasil = $${i++}`);
    values.push(ket_hasil);
  }
  if (url_foto !== undefined) {
    sets.push(`url_foto = $${i++}`);
    values.push(url_foto);
  }

  if (!sets.length) throw new Error("Tidak ada data yang di update");

  values.push(id);
  const sql = `
    UPDATE kunjungan_nsb
    SET ${sets.join(", ")}
    WHERE id_kunjungan = $${i}
    RETURNING
      id_kunjungan,
      ao_user_id,
      ao_username,
      ao_nama_lengkap,
      ao_bagian,
      kode_kantor,
      tgl_kunjungan,
      tipe_nasabah,
      nama_nasabah,
      no_rekening,
      kol_nsb,
      alamat_nsb,
      ket_hasil,
      url_foto,
      create_at,
      update_at
  `;
  const { rows } = await pool.query(sql, values);
  return rows[0] || null;
};

const deleteKunjunganById = async (id) => {
  const sql = `DELETE FROM kunjungan_nsb WHERE id_kunjungan = $1 RETURNING id_kunjungan,
      ao_user_id,
      ao_username,
      ao_nama_lengkap,
      ao_bagian,
      kode_kantor,
      tgl_kunjungan,
      tipe_nasabah,
      nama_nasabah,
      no_rekening,
      kol_nsb,
      alamat_nsb,
      ket_hasil,
      url_foto,
      create_at,
      update_at`;
  //  /console.log(sql);
  const { rows } = await pool.query(sql, [id]);
  return rows[0] || null;
};

const countKunjungan = async ({
  ao_user_id,
  ao_username,
  kode_kantor,
  nama_nasabah,
  no_rekening,
  tgl_kunjungan,
}) => {
  const values = [];
  const where = [];
  let i = 1;

  if (ao_user_id !== undefined && ao_user_id !== null) {
    where.push(`ao_user_id = $${i++}`);
    values.push(ao_user_id);
  }
  if (ao_username) {
    where.push(`ao_username = $${i++}`);
    values.push(ao_username);
  }
  if (nama_nasabah) {
    where.push(`nama_nasabah ILIKE $${i++}`);
    values.push(`%${nama_nasabah}%`);
  }
  if (no_rekening) {
    where.push(`no_rekening = $${i++}`);
    values.push(no_rekening);
  }
  if (kode_kantor) {
    where.push(`kode_kantor = $${i++}`);
    values.push(kode_kantor);
  }
  if (tgl_kunjungan) {
    where.push(`tgl_kunjungan = $${i++}`);
    values.push(tgl_kunjungan);
  }

  const sql = `SELECT COUNT(*) AS total FROM kunjungan_nsb ${where.length ? `WHERE ${where.join(" AND ")}` : ""}`;

  const { rows } = await pool.query(sql, values);
  return rows[0];
};

module.exports = {
  listKunjungan,
  findKunjunganById,
  insertKunjungan,
  updateKunjunganById,
  deleteKunjunganById,
  countKunjungan,
};
