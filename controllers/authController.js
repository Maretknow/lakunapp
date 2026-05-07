const { audit } = require("../config/configAudit");
const users = require("../models/modelUsers");
const { compare } = require("bcrypt");

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      const msg = "Username dan Password Required";
      const status_code = 400;
      await audit(req, res, {
        type: "AUTH_LOGIN",
        status_code: status_code,
        type_id: "001",
        message: msg,
      });
      return res.status(status_code).json({
        status: false,
        message: msg,
        data: null,
      });
    }

    const user = await users.findByUsername(username);
    if (!user) {
      const msg = `Username atau password salah`;
      const status_code = 401;
      await audit(req, res, {
        type: "AUTH_LOGIN",
        status_code: status_code,
        type_id: "001",
        message: msg,
      });
      return res
        .status(status_code)
        .json({ status: false, message: msg, data: null });
    }

    const valid = await compare(password, user.password);
    if (!valid) {
      const msg = `Username atau password salah`;
      const status_code = 401;
      await audit(req, res, {
        type: "AUTH_LOGIN",
        status_code: status_code,
        type_id: "001",
        message: msg,
      });
      return res.status(status_code).json({
        status: false,
        message: msg,
        data: null,
      });
    }

    if (user.status !== "aktif") {
      const msg = `Username ${user.username} Belum Aktif`;
      const status_code = 401;
      await audit(req, res, {
        type: "AUTH_LOGIN",
        status_code: status_code,
        type_id: "001",
        message: msg,
      });
      return res.status(status_code).json({
        status: false,
        message: msg,
        data: null,
      });
    }

    const msg = `Username ${user.username} telah login`;
    req.session.userId = user.id_user;
    req.session.role = user.role;
    req.session.username = user.username;
    req.session.kode_kantor = user.kode_kantor;
    const status_code = 200;
    await audit(req, res, {
      type: "AUTH_LOGIN",
      type_id: "001",
      status_code: status_code,
      after: { data: req.session },
      message: msg,
    });
    return res.status(status_code).json({
      status: true,
      message: msg,
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        status: user.status,
        kode_kantor: user.kode_kantor,
      },
    });
  } catch (err) {
    return next(err);
  }
};

const logout = (req, res, next) => {
  try {
    if (!req.session?.userId) {
      return res
        .status(200)
        .json({ status: true, message: "hohoho.... ok", data: null });
    }

    const msg = `Username ${req.session?.username} telah berhasil keluar`;
    const data = req.session;
    req.session.destroy(async (err) => {
      if (err) return next(err);
      const status_code = 200;
      await audit(req, res, {
        type: "AUTH_LOGIN",
        type_id: "001",
        status_code: status_code,
        before: { data: data },
        message: msg,
      });
      return res.status(status_code).json({
        status: true,
        message: msg,
        data: null,
      });
    });
  } catch (err) {
    return next(err);
  }
};

const me = async (req, res, next) => {
  try {
    if (!req.session?.userId) {
      const status_code = 401;
      const msg = `unauthorized`;
      await audit(req, res, {
        type: "AUTH_LOGIN",
        type_id: "001",
        status_code: status_code,
        message: msg,
      });
      return res.status(status_code).json({
        status: false,
        message: msg,
        data: null,
      });
    }

    const { userId, username, role, kode_kantor } = req.session;
    const data = await users.findUserById(userId);
    const status_code = 200;
    const msg = `Data session ${username} berhasil di ambil`;
    await audit(req, res, {
      type: "AUTH_LOGIN",
      type_id: "001",
      status_code: status_code,
      after: { data: data },
      message: msg,
    });
    return res.status(status_code).json({
      status: true,
      message: msg,
      data: data,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = { login, logout, me };
