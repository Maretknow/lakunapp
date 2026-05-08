const {
  listKunjungans,
  getKunjunganById,
  createKunjungan,
  updateKunjungan,
  deleteKunjungan,
} = require("../controllers/kunjunganController");
const {
  listKunjunganRules,
  getKunjunganByIdRules,
  createKunjunganRule,
  updateKunjunganRule,
  deleteKunjunganRule,
} = require("../validator/kunjunganValidator");

const {
  upload,
  compressKunjunganFoto,
} = require("../middleware/uploadKunjunganFoto");

const router = require("express").Router();

router.get("/", listKunjunganRules, listKunjungans);
router.get("/:id", getKunjunganByIdRules, getKunjunganById);
router.post(
  "/",
  upload.single("foto_nsb"),
  compressKunjunganFoto,
  createKunjunganRule,
  createKunjungan,
);
router.put(
  "/:id",
  upload.single("foto_nsb"),
  compressKunjunganFoto,
  updateKunjunganRule,
  updateKunjungan,
);
router.delete("/:id", deleteKunjunganRule, deleteKunjungan);

module.exports = router;
