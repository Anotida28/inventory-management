import { diskStorage } from "multer";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

export const buildDiskStorage = (uploadDir: string) => {
  const resolved = join(process.cwd(), uploadDir);
  if (!existsSync(resolved)) {
    mkdirSync(resolved, { recursive: true });
  }

  return diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, resolved);
    },
    filename: (_req, file, cb) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      cb(null, `${Date.now()}_${safeName}`);
    },
  });
};
