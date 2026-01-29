export default () => ({
  port: process.env.PORT ? Number(process.env.PORT) : 5000,
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  systemMode: (process.env.SYSTEM_MODE || "CARDS").toUpperCase(),
});
