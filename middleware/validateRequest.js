const { validationResult } = require("express-validator");
const { log } = require("../config/configLogger");

module.exports = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array({ onlyFirstError: true }).map((e) => ({
    field: e.path,
    message: e.msg,
  }));

  const msg = "Gagal Menyimpan, Validasi gagal";
  log("warn", { errors }, req, msg);
  return res.status(400).json({
    status: false,
    message: msg,
    data: errors,
  });
};
