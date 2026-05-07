const { hash } = require("bcrypt");
const {
  listUser,
  findByUsername,
  insertUser,
  findUserById,
  updateUserById,
  insertAprovalHistory,
  hardDeleteUserById,
  countUsers,
} = require("../models/modelUsers");
const { log } = require("../config/configLogger");
const { audit } = require("../config/configAudit");

const users = async (req, res, next) => {
  try {
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "20", 10), 1),
      100,
    );
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const offset = (page - 1) * limit;

    const filter = {
      limit,
      offset,
      username: req.query.username
        ? String(req.query.username).trim()
        : undefined,
      nama_lengkap: req.query.nama_lengkap
        ? String(req.query.nama_lengkap).trim()
        : undefined,
      kode_kantor: req.query.kode_kantor
        ? String(req.query.kode_kantor).trim()
        : undefined,
    };

    if (req.session.role !== "super-admin") {
      filter.kode_kantor = req.session.kode_kantor;
    }

    const total = Number((await countUsers(filter))?.total ?? 0);
    const total_pages = Math.ceil(total / limit);
    const data = await listUser(filter);
    const msg = "List user berhasi di ambil";
    const status_code = 200;
    await audit(req, res, {
      type: "USER",
      type_id: "002",
      status_code: status_code,
      after: { data: data },
      message: msg,
    });
    return res.status(status_code).json({
      status: true,
      message: msg,
      data: data,
      paging: { page, limit, total, total_pages },
    });
  } catch (err) {
    return next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    if (!["operator", "super-admin"].includes(req.session.role)) {
      const msg =
        "Yang bisa membuat user hanya user operator & super admin saja saja";
      const status_code = 401;
      await audit(req, res, {
        type: "USER",
        type_id: "002",
        status_code: status_code,
        message: msg,
      });
      return res.status(status_code).json({
        status: false,
        message: msg,
        data: null,
      });
    }

    const { username, nama_lengkap, password, role, level, kode_kantor } =
      req.body || {};

    if (
      !username ||
      !nama_lengkap ||
      !password ||
      !role ||
      !level ||
      !kode_kantor
    ) {
      const msg =
        "username, nama lengkap, password, role, level dan kode_kantor belum diisi, cek kembali";
      const status_code = 400;
      await audit(req, res, {
        type: "USER",
        type_id: "002",
        status_code: status_code,
        message: msg,
      });
      return res.status(status_code).json({
        status: false,
        message: msg,
        data: null,
      });
    }

    const uname = String(username).trim();
    const fullName = String(nama_lengkap).trim();

    const existing = await findByUsername(uname);
    if (existing) {
      const msg = "username sudah digunakan";
      const status_code = 409;
      await audit(req, res, {
        type: "USER",
        type_id: "002",
        status_code: status_code,
        message: msg,
      });
      return res.status(status_code).json({
        status: false,
        message: msg,
        data: null,
      });
    }
    const hashedPassword = await hash(password, 10);
    const user = await insertUser({
      username: uname,
      nama_lengkap: fullName,
      password: hashedPassword,
      role,
      level,
      kode_kantor,
    });

    const msg = `User ${user.username} berhasil dibuat`;
    const status_code = 201;
    await audit(req, res, {
      type: "USER",
      type_id: "002",
      status_code: status_code,
      after: { data: user },
      message: msg,
    });
    return res.status(status_code).json({
      status: true,
      message: msg,
      data: user,
    });
  } catch (err) {
    if (err?.code === "23505") {
      const msg = "username sudah digunakan";
      log("warn", err, req, msg);
      return res.status(409).json({
        status: false,
        message: msg,
        data: null,
      });
    }
    return next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    const user = await findUserById(id);

    if (!user) {
      const msg = `username tidak ditemukan`;
      const status_code = 404;
      await audit(req, res, {
        type: "USER",
        type_id: "002",
        status_code: status_code,
        message: msg,
      });
      return res.status(status_code).json({
        status: false,
        message: msg,
        data: null,
      });
    }

    const msg = `username ${user.username} ditemukan`;
    const status_code = 200;
    await audit(req, res, {
      type: "USER",
      type_id: "002",
      status_code: status_code,
      after: { data: user },
      message: msg,
    });
    return res.status(status_code).json({
      status: true,
      message: msg,
      data: user,
    });
  } catch (err) {
    return next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    if (!["operator", "super-admin"].includes(req.session.role)) {
      const msg = "Yang bisa update user hanya operator & super admin";
      const status_code = 403;
      await audit(req, res, {
        type: "USER",
        type_id: "002",
        status_code: status_code,
        message: msg,
      });
      return res.status(status_code).json({
        status: false,
        message: msg,
        data: null,
      });
    }

    const id = Number.parseInt(req.params.id, 10);

    const existing = await findUserById(id);
    if (!existing) {
      const msg = "User tidak ditemukan";
      const status_code = 404;
      await audit(req, res, {
        type: "USER",
        type_id: "002",
        status_code: status_code,
        message: msg,
      });
      return res.status(status_code).json({
        status: false,
        message: msg,
        data: null,
      });
    }

    if (req.body?.username !== undefined) {
      const msg = "username tidak dapat dirubah";
      const status_code = 400;
      await audit(req, res, {
        type: "USER",
        type_id: "002",
        status_code: status_code,
        message: msg,
      });
      return res.status(status_code).json({
        status: false,
        message: msg,
        data: null,
      });
    }

    const updates = {};
    if (req.body?.nama_lengkap !== undefined)
      updates.nama_lengkap = String(req.body.nama_lengkap).trim();
    if (req.body?.password !== undefined)
      updates.password = await hash(req.body.password, 10);

    if (req.body?.role !== undefined) {
      updates.role = req.body.role;
    }
    if (req.body?.level !== undefined) {
      updates.level = req.body.level;
    }

    if (req.body?.kode_kantor !== undefined) {
      updates.kode_kantor = req.body.kode_kantor;
    }

    updates.status = "pending";

    const user = await updateUserById(id, updates);
    const msg = `Data user berhasil di update`;
    const status_code = 200;
    await audit(req, res, {
      type: "USER",
      type_id: "002",
      status_code: status_code,
      before: { data: existing },
      after: { data: user },
      message: msg,
    });
    return res.status(status_code).json({
      status: true,
      message: msg,
      data: user,
    });
  } catch (err) {
    return next(err);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const allowed = ["aproval-1", "aproval-2", "aproval-3"];
    if (!allowed.includes(req.session.role)) {
      const msg = "Tidak punya akses merubah status user";
      const status_code = 403;
      await audit(req, res, {
        type: "USER_STATUS",
        type_id: "002",
        status_code: status_code,
        message: msg,
      });
      return res.status(status_code).json({
        status: false,
        message: msg,
        data: null,
      });
    }

    const id = Number.parseInt(req.params.id, 10);
    const { status, note, decision } = req.body || {};

    const before = await findUserById(id);
    if (!before) {
      const msg = "User tidak ditemukan";
      const status_code = 404;
      await audit(req, res, {
        type: "USER",
        type_id: "002",
        status_code: status_code,
        message: msg,
      });
      return res.status(status_code).json({
        status: false,
        message: msg,
        data: null,
      });
    }

    if (decision == "reject") {
      const data = await updateUserById(id, { status: "blokir" });
      const aprovalHistory = await insertAprovalHistory({
        user_id: id,
        level: before.level,
        decision: decision,
        note: note,
        ap_user_id: req.session.userId,
        ap_username: req.session.username,
      });
      const msg = "Data aproval berhasil di simpan";
      const status_code = 200;
      await audit(req, res, {
        type: "USER_STATUS",
        type_id: "002",
        status_code: status_code,
        before: { data: before },
        after: { data: { aprovalHistory, data } },
        message: msg,
      });
      return res.status(status_code).json({
        status: true,
        message: msg,
        data: { aprovalHistory, data },
      });
    }

    const after = await updateUserById(id, { status: status });
    const aprovalHistory = await insertAprovalHistory({
      user_id: id,
      level: after.level,
      decision: "accept",
      note: note,
      ap_user_id: req.session.userId,
      ap_username: req.session.username,
    });
    const status_code = 200;
    const msg = "Data aproval berhasil di simpan";
    await audit(req, res, {
      type: "USER_STATUS",
      type_id: "002",
      status_code: status_code,
      before: { data: before },
      after: { data: { aprovalHistory, after } },
      message: msg,
    });
    return res.status(status_code).json({
      status: true,
      message: msg,
      data: { aprovalHistory, after },
    });
  } catch (err) {
    return next(err);
  }
};

const deleteUsers = async (req, res, next) => {
  try {
    if (req.session?.role !== "super-admin") {
      const msg = "Yang bisa delete user hanya super admin";
      const status_code = 403;
      await audit(req, res, {
        type: "USER",
        type_id: "002",
        status_code: status_code,
        message: msg,
      });
      return res.status(status_code).json({
        status: false,
        message: msg,
        data: null,
      });
    }

    const id = Number.parseInt(req.params.id, 10);
    if (Number(req.session.userId) === id) {
      const msg = "Anda tidak bisa hapus diri anda sendiri";
      const status_code = 400;
      await audit(req, res, {
        type: "USER",
        type_id: "002",
        status_code: status_code,
        message: msg,
      });
      return res.status(status_code).json({
        status: false,
        message: msg,
        data: null,
      });
    }

    const before = await findUserById(id);
    if (!before) {
      const msg = "User tidak ditemukan";
      const status_code = 404;
      await audit(req, res, {
        type: "USER",
        type_id: "002",
        status_code: status_code,
        message: msg,
      });
      return res.status(status_code).json({
        status: false,
        message: msg,
        data: null,
      });
    }

    const deleted = await hardDeleteUserById(id);
    const msg = "User Berhasi di hapus";
    const status_code = 200;
    await audit(req, res, {
      type: "USER_DELETED",
      type_id: "002",
      status_code: status_code,
      before: { data: before },
      after: { data: deleted },
      message: msg,
    });
    return res.status(status_code).json({
      status: true,
      message: msg,
      data: deleted,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  users,
  createUser,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUsers,
};
