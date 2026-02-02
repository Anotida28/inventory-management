// src/inventory/inventory.service.ts - FIXED FOR STRING ENUMS
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/utils/prisma.service";
import { ReceiveInventoryDto } from "./dto/receive-inventory.dto";
import { IssueInventoryDto } from "./dto/issue-inventory.dto";
import { syncUnitTotal } from "../common/utils/money-sync";
import { notFoundError, validationError } from "../common/utils/errors";
import { SystemMode } from "../common/utils/mode";
import { toTransactionShape } from "../common/utils/transaction-shape";

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

async getBatches(itemTypeId: number, itemtype?: string) {
  // If itemtype filter is provided, we need to check if it matches the ItemType
  if (itemtype) {
    const batches = await this.prisma.batch.findMany({
      where: {
        itemTypeId,
        itemType: { // Join with ItemType table
          itemtype: itemtype,
        },
      },
      include: { // IMPORTANT: Include the itemType relation
        itemType: true,
      },
      orderBy: { receivedAt: "asc" },
    });

    return batches
      .map((batch) => ({
        id: batch.id,
        itemTypeId: batch.itemTypeId,
        batchCode: batch.batchCode,
        qtyReceived: batch.qtyReceived,
        qtyIssued: batch.qtyIssued,
        availableQty: Math.max(batch.qtyReceived - batch.qtyIssued, 0),
        receivedAt: batch.receivedAt,
        notes: batch.notes ?? null,
        itemtype: batch.itemType?.itemtype, // Safe access with optional chaining
      }))
      .filter((batch) => batch.availableQty > 0);
  } else {
    // No itemtype filter, just get batches
    const batches = await this.prisma.batch.findMany({
      where: { itemTypeId },
      include: { // Still include itemType relation
        itemType: true,
      },
      orderBy: { receivedAt: "asc" },
    });

    return batches
      .map((batch) => ({
        id: batch.id,
        itemTypeId: batch.itemTypeId,
        batchCode: batch.batchCode,
        qtyReceived: batch.qtyReceived,
        qtyIssued: batch.qtyIssued,
        availableQty: Math.max(batch.qtyReceived - batch.qtyIssued, 0),
        receivedAt: batch.receivedAt,
        notes: batch.notes ?? null,
        itemtype: batch.itemType?.itemtype, // Safe access
      }))
      .filter((batch) => batch.availableQty > 0);
  }
}

async receive(
  dto: ReceiveInventoryDto, 
  files: Express.Multer.File[], 
  userId: number,
  itemtype: string
) {
  console.log(`Processing receive in ${itemtype} mode`);
  
  const itemType = await this.prisma.itemType.findUnique({
    where: { id: dto.itemTypeId },
  });

  if (!itemType) throw notFoundError("Item type not found");
  if (itemType.itemtype && itemType.itemtype !== itemtype) {
    throw validationError("Item type belongs to another mode", {
      itemtype: `Expected ${itemType.itemtype}`,
    });
  }
  if (!itemType.itemtype) {
    await this.prisma.itemType.update({
      where: { id: dto.itemTypeId },
      data: { itemtype },
    });
  }

  const batchCode = dto.batchCode?.trim() || `BATCH-${Date.now()}`;
  const receivedAt = dto.receivedAt ? new Date(dto.receivedAt) : new Date();

  let unitCost = dto.unitCost ?? null;
  let totalCost = dto.totalCost ?? null;
  const changedField = unitCost != null ? "unit" : totalCost != null ? "total" : null;
  if (changedField) {
    const synced = syncUnitTotal({
      qty: dto.qtyReceived,
      unit: unitCost,
      total: totalCost,
      changedField,
    });
    unitCost = synced.unit;
    totalCost = synced.total;
  }

  const result = await this.prisma.$transaction(async (tx) => {
    // Create batch WITHOUT itemtype field
    const batch = await tx.batch.create({
      data: {
        itemTypeId: dto.itemTypeId,
        batchCode,
        qtyReceived: dto.qtyReceived,
        qtyIssued: 0,
        unitCost,
        totalCost,
        receivedAt,
        notes: dto.notes?.trim() || null,
        // NO itemtype here - it's already set on ItemType
      },
    });

    const transaction = await tx.transaction.create({
      data: {
        type: "RECEIVE",
        status: "POSTED",
        itemTypeId: dto.itemTypeId,
        batchId: batch.id,
        qty: dto.qtyReceived,
        unitCost,
        totalCost,
        createdAt: receivedAt,
        createdById: userId,
        notes: dto.notes?.trim() || null,
        // NO itemtype here - it's on ItemType
        attachments: {
          create: files.map((file) => ({
            fileName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            path: file.path,
            uploadedById: userId,
          })),
        },
      },
      include: {
        itemType: true, // This includes the itemtype from ItemType
        batch: true,
        createdBy: true,
        attachments: true,
      },
    });

    return { batch, transaction };
  });

  return {
    batch: {
      id: result.batch.id,
      batchCode: result.batch.batchCode,
      itemTypeId: result.batch.itemTypeId,
    },
    transaction: toTransactionShape(result.transaction),
  };
}
async issue(
  dto: IssueInventoryDto, 
  files: Express.Multer.File[], 
  userId: number, 
  itemtype: string
) {
  const itemType = await this.prisma.itemType.findUnique({
    where: { id: dto.itemTypeId },
  });
  
  if (!itemType) throw notFoundError("Item type not found");
  
  if (itemType.itemtype && itemType.itemtype !== itemtype) {
    throw validationError("Item type belongs to another mode", {
      itemtype: `Expected ${itemType.itemtype}`,
    });
  }
  if (!itemType.itemtype) {
    await this.prisma.itemType.update({
      where: { id: dto.itemTypeId },
      data: { itemtype },
    });
  }

  const batch = await this.prisma.batch.findUnique({
    where: { id: dto.batchId },
  });

  if (!batch || batch.itemTypeId !== dto.itemTypeId) {
    throw notFoundError("Batch not found for item type");
  }

  const availableQty = Math.max(batch.qtyReceived - batch.qtyIssued, 0);
  if (!Number.isFinite(dto.qty) || dto.qty <= 0) {
    throw validationError("qty must be > 0", { qty: "Must be > 0" });
  }
  if (dto.qty > availableQty) {
    throw validationError("Insufficient batch inventory", {
      qty: "Exceeds available inventory",
    });
  }

  const issuedAt = new Date();

  const result = await this.prisma.$transaction(async (tx) => {
    const updatedBatch = await tx.batch.update({
      where: { id: batch.id },
      data: { qtyIssued: batch.qtyIssued + dto.qty },
    });

    const transaction = await tx.transaction.create({
      data: {
        type: "ISSUE",
        status: "POSTED",
        itemTypeId: dto.itemTypeId,
        batchId: batch.id,
        qty: dto.qty,
        unitPrice: null,
        totalPrice: null,
        issuedToType: dto.issuedToType,
        issuedToName: dto.issuedToName?.trim() || null,
        createdAt: issuedAt,
        createdById: userId,
        notes: dto.notes?.trim() || null,
        attachments: {
          create: files.map((file) => ({
            fileName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            path: file.path,
            uploadedById: userId,
          })),
        },
      },
      include: {
        itemType: true,
        batch: true,
        createdBy: true,
        attachments: true,
      },
    });

    return { batch: updatedBatch, transaction };
  });

  return {
    batch: {
      id: result.batch.id,
      batchCode: result.batch.batchCode,
      itemTypeId: result.batch.itemTypeId,
    },
    transaction: toTransactionShape(result.transaction),
  };
}
}
