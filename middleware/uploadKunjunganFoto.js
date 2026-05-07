const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads", "kunjungan"));
  },
  filename: (req, file, cb) => {
    const uniquename = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniquename + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  cb(null, allowed.includes(file.mimetype));
};

const limits = { fileSize: 5 * 1024 * 1024 };

module.exports = multer({ storage, fileFilter, limits });
