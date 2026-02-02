import { basename } from "path";

export const toTransactionShape = (transaction: any) => {
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
    attachments: (transaction.attachments || []).map((file: any) => ({
      fileName: file.fileName,
      fileUrl: `/api/uploads/${basename(file.path)}`,
      mimeType: file.mimeType,
      size: file.size,
      uploadedAt: file.uploadedAt,
    })),
  };
};
