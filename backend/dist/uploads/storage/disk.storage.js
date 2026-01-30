"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDiskStorage = void 0;
const multer_1 = require("multer");
const fs_1 = require("fs");
const path_1 = require("path");
const buildDiskStorage = (uploadDir) => {
    const resolved = (0, path_1.join)(process.cwd(), uploadDir);
    if (!(0, fs_1.existsSync)(resolved)) {
        (0, fs_1.mkdirSync)(resolved, { recursive: true });
    }
    return (0, multer_1.diskStorage)({
        destination: (_req, _file, cb) => {
            cb(null, resolved);
        },
        filename: (_req, file, cb) => {
            const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
            cb(null, `${Date.now()}_${safeName}`);
        },
    });
};
exports.buildDiskStorage = buildDiskStorage;
