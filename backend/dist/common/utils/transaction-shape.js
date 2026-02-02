"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toTransactionShape = void 0;
const path_1 = require("path");
const toTransactionShape = (transaction) => {
    const createdBy = transaction.createdBy
        ? {
            id: transaction.createdBy.id,
            username: transaction.createdBy.username,
        }
        : null;
    return {
        id: transaction.id,
        type: transaction.type,
        status: transaction.status,
        createdAt: transaction.createdAt,
        itemType: transaction.itemType
            ? {
                id: transaction.itemType.id,
                name: transaction.itemType.name,
                code: transaction.itemType.code,
            }
            : null,
        batch: transaction.batch
            ? { id: transaction.batch.id, batchCode: transaction.batch.batchCode }
            : null,
        qty: transaction.qty,
        unitCost: transaction.unitCost,
        totalCost: transaction.totalCost,
        unitPrice: transaction.unitPrice,
        totalPrice: transaction.totalPrice,
        createdBy,
        issuedToBranch: null,
        issuedToType: transaction.issuedToType,
        issuedToName: transaction.issuedToName,
        notes: transaction.notes,
        attachments: (transaction.attachments || []).map((file) => ({
            fileName: file.fileName,
            fileUrl: `/api/uploads/${(0, path_1.basename)(file.path)}`,
            mimeType: file.mimeType,
            size: file.size,
            uploadedAt: file.uploadedAt,
        })),
    };
};
exports.toTransactionShape = toTransactionShape;
