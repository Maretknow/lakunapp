const { audit } = require("../config/configAudit");
const {
  listKunjungan,
  findKunjunganById,
  insertKunjungan,
  updateKunjunganById,
  deleteKunjunganById,
  countKunjungan,
} = require("../models/modelKunjungan");

const fs = require("fs/promises");
const path = require("path");

const hapusFoto = async (oldpath) => {
  try {
    await fs.unlink(oldpath);
  } catch (e) {}
};

const listKunjungans = async (req, res, next) => {
  try {
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "20", 10), 1),
      100,
    );
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const offset = (page - 1) * limit;

    const filters = {
      limit,
      offset,
      ao_username: req.query.ao_username
        ? String(req.query.ao_username).trim()
        : undefined,
      nama_nasabah: req.query.nama_nasabah
        ? String(req.query.nama_nasabah).trim()
        : undefined,
      no_rekening: req.query.no_rekening
        ? String(req.query.no_rekening).trim()
        : undefined,
      kode_kantor: req.query.kode_kantor
        ? String(req.query.kode_kantor).trim()
        : undefined,
      tgl_kunjungan: req.query.tgl_kunjungan
        ? String(req.query.tgl_kunjungan).trim()
        : undefined,
    };

    if (req.session.role !== "super-admin") {
      if (String(req.session.role).split("-")[0] !== "aproval") {
        filters.ao_user_id = Number(req.session.userId);
      }
    }

    if (String(req.session.role).split("-")[0] === "aproval") {
      filters.kode_kantor = String(req.session.kode_kantor);
    }

    const total = Number((await countKunjungan(filters))?.total ?? 0);
    const total_pages = Math.ceil(total / limit);
    const data = await listKunjungan(filters);
    const msg = "List kunjungan berhasil di ambil";
    const status_kode = 200;
    await audit(req, res, {
      type: "LIST_KUNJUNGAN",
      type_id: "003",
      status_code: status_kode,
      after: { data: data },
      message: msg,
    });
    return res.status(status_kode).json({
      status: true,
      message: msg,
      data: data,
      paging: { page, limit, total, total_pages },
    });
  } catch (err) {
    next(err);
  }
};

const getKunjunganById = async (req, res, next) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    const data = await findKunjunganById(id);
    if (!data) {
      const msg = "Data kunjungan tidak ditemukan";
      const status_kode = 404;
      await audit(req, res, {
        type: "DATA_KUNJUNGAN",
        type_id: "003",
        status_code: status_kode,
        after: { data: data },
        message: msg,
      });
      return res.status(status_kode).json({
        status: false,
        message: msg,
        data: null,
      });
    }
    if (req.session.role === "operator") {
      if (Number(data.ao_user_id) !== Number(req.session.userId)) {
        const msg = "Anda tidak boleh mengakses data kunjungan ini";
        const status_kode = 404;
        await audit(req, res, {
          type: "DATA_KUNJUNGAN",
          type_id: "003",
          status_code: status_kode,
          after: { data: data },
          message: msg,
        });
        return res.status(status_kode).json({
          status: false,
          message: msg,
          data: null,
        });
      }
    }

    const msg = "Data kunjungan ditemukan";
    const status_kode = 200;
    await audit(req, res, {
      type: "DATA_KUNJUNGAN",
      type_id: "003",
      status_code: status_kode,
      after: { data: data },
      message: msg,
    });
    return res.status(status_kode).json({
      status: true,
      message: msg,
      data: data,
    });
  } catch (err) {
    next(err);
  }
};

const createKunjungan = async (req, res, next) => {
  try {
    const sessionUserId = Number(req.session.userId);
    const sessionUsername = String(req.session.username);
    const sessionRole = String(req.session.role);
    const sessionKodeKantor = String(req.session.kode_kantor);

    const data = await insertKunjungan({
      ao_user_id: sessionUserId,
      ao_username: sessionUsername,
      ao_nama_lengkap: req.body.ao_nama_lengkap,
      ao_bagian: sessionRole,
      kode_kantor: sessionKodeKantor,
      tgl_kunjungan: req.body.tgl_kunjungan,
      tipe_nasabah: req.body.tipe_nasabah,
      nama_nasabah: req.body.nama_nasabah,
      no_rekening: req.body.no_rekening,
      kol_nsb: req.body.kol_nsb,
      alamat_nsb: req.body.alamat_nsb,
      ket_hasil: req.body.ket_hasil,
      url_foto: `/uploads/kunjungan/${req.file.filename}`,
    });

    const msg = "Data kunjungan berhasil di buat";
    const status_kode = 200;
    await audit(req, res, {
      type: "CRATE_KUNJUNGAN",
      type_id: "003",
      status_code: status_kode,
      after: { data: data },
      message: msg,
    });
    return res.status(status_kode).json({
      status: true,
      message: msg,
      data: data,
    });
  } catch (err) {
    next(err);
  }
};

const updateKunjungan = async (req, res, next) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    const before = await findKunjunganById(id);
    if (!before) {
      const msg = "List Kunjungan tidak di temukan";
      const status_kode = 404;
      await audit(req, res, {
        type: "UPDATE_KUNJUNGAN",
        type_id: "003",
        status_code: status_kode,
        before: { data: before },
        message: msg,
      });
      return res.status(status_kode).json({
        status: false,
        message: msg,
        data: before,
      });
    }

    if (Number(before.ao_user_id) !== Number(req.session.userId)) {
      const msg = "Anda tidak punya akses merubah data ini";
      const status_kode = 403;
      await audit(req, res, {
        type: "UPDATE_KUNJUNGAN",
        type_id: "003",
        status_code: status_kode,
        before: { data: before },
        message: msg,
      });
      return res.status(status_kode).json({
        status: false,
        message: msg,
        data: before,
      });
    }

    if (req.session.role !== "operator" && req.session.role !== "super-admin") {
      const msg = "Anda tidak punya otorisasi merubah data ini";
      const status_kode = 403;
      await audit(req, res, {
        type: "UPDATE_KUNJUNGAN",
        type_id: "003",
        status_code: status_kode,
        before: { data: before },
        message: msg,
      });
      return res.status(status_kode).json({
        status: false,
        message: msg,
        data: before,
      });
    }

    const updates = {};
    for (const k of [
      "tgl_kunjungan",
      "tipe_nasabah",
      "nama_nasabah",
      "no_rekening",
      "kol_nsb",
      "alamat_nsb",
      "ket_hasil",
    ]) {
      if (req.body?.[k] !== undefined) updates[k] = req.body[k];
    }

    if (req.file) {
      updates.url_foto = `/uploads/kunjungan/${req.file.filename}`;
    }

    const oldFoto = before.url_foto;

    if (req.file && oldFoto) {
      const oldName = path.basename(oldFoto); // aman, buang path injection
      const oldPath = path.join(
        __dirname,
        "..",
        "uploads",
        "kunjungan",
        oldName,
      );
      await hapusFoto(oldPath);
    }

    const after = await updateKunjunganById(id, updates);
    const data = after;
    const msg = "List kunjungan berhasil di update";
    const status_kode = 200;
    await audit(req, res, {
      type: "UPDATE_KUNJUNGAN",
      type_id: "003",
      status_code: status_kode,
      before: { data: before },
      after: { data: data },
      message: msg,
    });
    return res.status(status_kode).json({
      status: true,
      message: msg,
      data: data,
    });
  } catch (err) {
    next(err);
  }
};

const deleteKunjungan = async (req, res, next) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    const before = await findKunjunganById(id);
    if (!before) {
      const msg = "List Kunjungan tidak di temukan";
      const status_kode = 404;
      await audit(req, res, {
        type: "DELETE_KUNJUNGAN",
        type_id: "003",
        status_code: status_kode,
        before: { data: before },
        message: msg,
      });
      return res.status(status_kode).json({
        status: false,
        message: msg,
        data: before,
      });
    }

    if (String(req.session.role).split("-")[0] !== "aproval") {
      const msg = "Anda tidak punya wewenang menghapus data ini";
      const status_kode = 403;
      await audit(req, res, {
        type: "DELETE_KUNJUNGAN",
        type_id: "003",
        status_code: status_kode,
        before: { data: before },
        message: msg,
      });
      return res.status(status_kode).json({
        status: false,
        message: msg,
        data: before,
      });
    }

    if (String(before.kode_kantor) !== String(req.session.kode_kantor)) {
      const msg = "Anda tidak punya otorisasi menghapus data ini";
      const status_kode = 403;
      await audit(req, res, {
        type: "DELETE_KUNJUNGAN",
        type_id: "003",
        status_code: status_kode,
        before: { data: before },
        message: msg,
      });
      return res.status(status_kode).json({
        status: false,
        message: msg,
        data: before,
      });
    }
    const after = await deleteKunjunganById(id);

    const oldFoto = after.url_foto;
    if (oldFoto) {
      const oldName = path.basename(oldFoto);
      const oldPath = path.join(
        __dirname,
        "..",
        "uploads",
        "kunjungan",
        oldName,
      );
      await hapusFoto(oldPath);
    }

    const msg = "List kunjungan berhasil di hapus";
    const status_kode = 200;
    await audit(req, res, {
      type: "DELETE_KUNJUNGAN",
      type_id: "003",
      status_code: status_kode,
      before: { data: before },
      after: { data: after },
      message: msg,
    });
    return res.status(status_kode).json({
      status: true,
      message: msg,
      data: after,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listKunjungans,
  getKunjunganById,
  createKunjungan,
  updateKunjungan,
  deleteKunjungan,
};
