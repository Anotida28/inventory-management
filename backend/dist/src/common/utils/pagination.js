"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPagination = exports.normalizePagination = void 0;
const normalizePagination = (page, limit) => {
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;
    return { page: safePage, limit: safeLimit, skip };
};
exports.normalizePagination = normalizePagination;
const buildPagination = (page, limit, total) => ({
    page,
    limit,
    total,
    totalPages: Math.max(Math.ceil(total / limit), 1),
});
exports.buildPagination = buildPagination;
