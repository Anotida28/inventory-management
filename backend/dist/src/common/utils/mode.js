"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModeFromRequest = exports.normalizeMode = void 0;
const normalizeMode = (value) => {
    const upper = (value || "").toUpperCase();
    return upper === "INVENTORY" ? "INVENTORY" : "CARDS";
};
exports.normalizeMode = normalizeMode;
const getModeFromRequest = (req) => {
    const header = req?.headers?.["x-system-mode"];
    const query = req?.query?.mode;
    const fallback = process.env.SYSTEM_MODE || null;
    return (0, exports.normalizeMode)(header || query || fallback);
};
exports.getModeFromRequest = getModeFromRequest;
