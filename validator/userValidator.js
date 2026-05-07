const { body, param } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");

const createUserRules = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username wajib diisi")
    .isLength({ min: 3, max: 64 })
    .withMessage("username 3-64 karakter") //selalu sesuaikan dengan login username
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage("username hanya boleh huruf/angka . _ -"),
  body("nama_lengkap")
    .trim()
    .notEmpty()
    .withMessage("nama lengkap wajib diisi")
    .isLength({ max: 120 })
    .withMessage("nama lengkap maksimal 120 karakter"),
  body("password")
    .notEmpty()
    .withMessage("password wajib diisi")
    .isLength({ min: 8, max: 128 })
    .withMessage("password 8-128 karakter"),
  body("role")
    .notEmpty()
    .withMessage("role wajib diisi")
    .isIn(["operator", "aproval-1", "aproval-2", "aproval-3", "super-admin"])
    .withMessage("role tidak sesuai"),
  body("status")
    .optional()
    .isIn(["pending"])
    .withMessage("status tidak sesuai"),
  body("level")
    .isInt({ min: 1, max: 10 })
    .withMessage("Level hanya berisi angka dari 1 - 10")
    .notEmpty()
    .withMessage("Level wajib di isi"),
  body("kode_kantor").notEmpty().withMessage("Level wajib di isi"),
  validateRequest,
];

const getUserByIdRules = [
  param("id").isInt({ min: 1 }).withMessage("id harus berupa angka"),
  validateRequest,
];

const updateUserRule = [
  param("id").isInt({ min: 1 }).withMessage("id harus berupa angka"),
  body("username").not().exists().withMessage("username tidak dapat dirubah"),
  body("nama_lengkap")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("nama lengkap wajib diisi")
    .isLength({ max: 120 })
    .withMessage("nama lengkap maksimal 120 karakter"),
  body("password")
    .optional()
    .isLength({ min: 8, max: 128 })
    .withMessage("password 8-128 karakter"),
  body("level")
    .isInt({ min: 1, max: 10 })
    .withMessage("Level wajib hanya di isi dari angka 1 - 10")
    .optional(),
  body("kode_kantor").optional(),
  body("role")
    .optional()
    .isIn(["operator", "otorisator", "super-admin"])
    .withMessage("role tidak sesuai"),
  body().custom((_, { req }) => {
    const allowed = [
      "nama_lengkap",
      "password",
      "role",
      "level",
      "kode_kantor",
    ];
    const hasAny = allowed.some((k) => req.body?.[k] !== undefined);
    if (!hasAny) throw new Error("minimal 1 field harus di isi");
    return true;
  }),
  body().custom((_, { req }) => {
    const allowed = [
      "nama_lengkap",
      "password",
      "role",
      "level",
      "kode_kantor",
    ];
    const keys = Object.keys(req.body || {});
    const unknown = keys.filter((k) => !allowed.includes(k));
    if (unknown.length)
      throw new Error(`Field tidak di kenal : ${unknown.join(", ")}`);
    return true;
  }),
  validateRequest,
];

const userStatusRule = [
  param("id").isInt({ min: 1 }).withMessage("Id harus berupa angka"),
  body("status").notEmpty().isIn(["aktif", "blokir"]),
  body("note").trim().notEmpty().withMessage("Note harus di isi"),
  body("decision")
    .trim()
    .isIn(["accept", "reject"])
    .withMessage("decision harus accept/reject"),
  validateRequest,
];

const deleteUserRule = [
  param("id").isInt({ min: 1 }).withMessage("id harus berupa angka"),
  validateRequest,
];

module.exports = {
  createUserRules,
  getUserByIdRules,
  updateUserRule,
  userStatusRule,
  deleteUserRule,
};
