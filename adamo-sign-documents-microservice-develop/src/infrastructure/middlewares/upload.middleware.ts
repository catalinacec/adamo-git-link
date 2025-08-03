// src/infrastructure/middlewares/upload.middleware.ts
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;