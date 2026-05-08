const multer = require("multer");
const path = require("path");
const fs = require("fs/promises");
const sharp = require("sharp");

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, "..", "uploads", "kunjungan"));
//   },
//   filename: (req, file, cb) => {
//     const uniquename = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const ext = path.extname(file.originalname);
//     cb(null, uniquename + ext);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const allowed = ["image/jpeg", "image/png", "image/webp"];
//   cb(null, allowed.includes(file.mimetype));
// };

// const limits = { fileSize: 5 * 1024 * 1024 };

// module.exports = multer({ storage, fileFilter, limits });

const uploadDir = path.join(__dirname, "..", "uploads", "kunjungan");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  cb(null, allowed.includes(file.mimetype));
};

const limits = { fileSize: 5 * 1024 * 1024 };

const upload = multer({ storage, fileFilter, limits });

async function compressKunjunganFoto(req, res, next) {
  try {
    if (!req.file) return next();

    await fs.mkdir(uploadDir, { recursive: true });

    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `${uniqueName}.webp`;
    const filepath = path.join(uploadDir, filename);

    await sharp(req.file.buffer)
      .resize({
        width: 1280,
        height: 1280,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 75 })
      .toFile(filepath);

    req.file.filename = filename;
    req.file.path = filepath;
    req.file.mimetype = "image/webp";
    next();
  } catch (e) {
    next(e);
  }
}

module.exports = { upload, compressKunjunganFoto };
