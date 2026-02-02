import { normalizeMode, type SystemMode } from "../common/utils/mode";

const DEFAULT_UPLOAD_MAX_FILE_SIZE = 10 * 1024 * 1024;
const DEFAULT_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const parseAllowedMimeTypes = (value?: string | null) => {
  if (!value) return DEFAULT_ALLOWED_MIME_TYPES;
  return value
    .split(",")
    .map((type) => type.trim())
    .filter(Boolean);
};

const parseUploadMaxSize = (value?: string | null) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_UPLOAD_MAX_FILE_SIZE;
  }
  return Math.min(parsed, 50 * 1024 * 1024);
};

export default () => {
  const systemMode: SystemMode = normalizeMode(process.env.SYSTEM_MODE);

  return {
    port: process.env.PORT ? Number(process.env.PORT) : 3400,
    uploadDir: process.env.UPLOAD_DIR || "uploads",
    systemMode,
    uploadMaxFileSize: parseUploadMaxSize(process.env.UPLOAD_MAX_FILE_SIZE),
    uploadAllowedMimeTypes: parseAllowedMimeTypes(
      process.env.UPLOAD_ALLOWED_MIME_TYPES,
    ),
  };
};
