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

const upload = require("../middleware/uploadKunjunganFoto");

const router = require("express").Router();

router.get("/", listKunjunganRules, listKunjungans);
router.get("/:id", getKunjunganByIdRules, getKunjunganById);
router.post(
  "/",
  upload.single("foto_nsb"),
  createKunjunganRule,
  createKunjungan,
);
router.put(
  "/:id",
  upload.single("foto_nsb"),
  updateKunjunganRule,
  updateKunjungan,
);
router.delete("/:id", deleteKunjunganRule, deleteKunjungan);

module.exports = router;
