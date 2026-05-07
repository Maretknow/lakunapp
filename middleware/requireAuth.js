const { audit } = require("../config/configAudit");
const { log } = require("../config/configLogger");

module.exports = async (req, res, next) => {
  if (!req.session?.userId) {
    const msg = "Dilarang mengakses halaman ini, authorized only";
    const status_code = 401;
    log("warn", {}, req, msg);
    await audit(req, res, {
      type: "AUTH_ERROR",
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
  next();
};
