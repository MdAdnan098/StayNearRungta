const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "staynearrungta/properties",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "heic", "heif", "avif", "bmp", "tiff", "tif", "gif"],
    format: "jpg",
    transformation: [{ width: 1200, height: 900, crop: "limit", quality: "auto" }],
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
    files: 10,
  },
});

module.exports = upload;
