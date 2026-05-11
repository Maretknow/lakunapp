const { body, param, query } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");

const listKunjunganRules = [
  query("page").optional().isInt({ min: 1 }).withMessage("page harus angka"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 9999 })
    .withMessage("limit 1-9999"),
  query("ao_username").optional().trim(),
  query("nama_nasabah").optional().trim(),
  query("kode_kantor").optional().trim(),
  query("no_rekening").optional().trim(),
  query("tgl_kunjungan").optional().isISO8601(),
  validateRequest,
];

const getKunjunganByIdRules = [
  param("id").isInt({ min: 1 }).withMessage("id harus berupa angka"),
  validateRequest,
];

const createKunjunganRule = [
  body("ao_user_id").not().exists(),
  body("ao_username").not().exists(),
  body("ao_nama_lengkap")
    .exists()
    .notEmpty()
    .withMessage("Nama AO tidak boleh kosong"),
  body("ao_bagian").not().exists(),
  body("kode_kantor").not().exists(),
  body("tgl_kunjungan")
    .optional()
    .isISO8601()
    .withMessage("tgl_kunjungan harus ISO8601"),
  body("tipe_nasabah")
    .exists()
    .notEmpty()
    .withMessage("tipe nasabah tidak boleh kosong"),
  body("nama_nasabah")
    .trim()
    .notEmpty()
    .withMessage("nama_nasabah wajib diisi"),
  body("no_rekening").optional().trim(),
  body("kol_nsb")
    .optional({ nullable: true })
    .isInt({ min: 0, max: 5 })
    .withMessage("kol_nsb harus angka 0 - 5"),
  body("alamat_nsb").trim().notEmpty().withMessage("alamat_nsb wajib diisi"),
  body("ket_hasil").trim().notEmpty().withMessage("ket_hasil wajib diisi"),
  body().custom((_, { req }) => {
    if (!req.file) throw new Error("Foto wajib di upload(field : foto_nsb)");
    return true;
  }),
  validateRequest,
];

const updateKunjunganRule = [
  param("id").isInt({ min: 1 }).withMessage("id harus berupa angka"),

  body("ao_user_id").not().exists(),
  body("ao_username").not().exists(),
  body("ao_nama_lengkap").optional().trim().notEmpty(),
  body("ao_bagian").not().exists(),
  body("kode_kantor").not().exists(),
  body("tgl_kunjungan").optional().isISO8601(),
  body("tipe_nasabah").optional().trim().notEmpty(),
  body("nama_nasabah").optional().trim().notEmpty(),
  body("no_rekening").optional().trim(),
  body("kol_nsb").optional({ nullable: true }).isInt(),
  body("alamat_nsb").optional().trim().notEmpty(),
  body("ket_hasil").optional().trim().notEmpty(),
  body().custom((_, { req }) => {
    const allowed = [
      "ao_nama_lengkap",
      "tgl_kunjungan",
      "tipe_nasabah",
      "nama_nasabah",
      "no_rekening",
      "kol_nsb",
      "alamat_nsb",
      "ket_hasil",
    ];
    const hasAnyField = allowed.some((k) => req.body?.[k] !== undefined);
    const hasFile = !!req.file;
    if (!hasAnyField && !hasFile)
      throw new Error("minimal 1 field atau foto harus di isi");
    return true;
  }),
  validateRequest,
];

const deleteKunjunganRule = [
  param("id").isInt({ min: 1 }).withMessage("id harus berupa angka"),
  validateRequest,
];

module.exports = {
  listKunjunganRules,
  getKunjunganByIdRules,
  createKunjunganRule,
  updateKunjunganRule,
  deleteKunjunganRule,
};
