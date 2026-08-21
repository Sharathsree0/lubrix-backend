import multer from "multer";
import path from "path";

export function createUploader(folder, allowedExtensions) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, `public/uploads/${folder}`),
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
      cb(null, uniqueName);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!allowedExtensions || allowedExtensions.some((ext) => file.originalname.toLowerCase().endsWith(ext))) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file type"));
      }
    },
  });
}

export const uploadBanner = createUploader("subcategories", [".jpg", ".jpeg", ".png", ".webp"]);
export const uploadDatasheet = createUploader("datasheets", [".pdf"]);