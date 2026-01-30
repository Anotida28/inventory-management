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

  async getBatches(itemTypeId: number) {
    const batches = await this.prisma.batch.findMany({
      where: { itemTypeId },
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
      }))
      .filter((batch) => batch.availableQty > 0);
  }

  async receive(dto: ReceiveInventoryDto, files: Express.Multer.File[], userId: number) {
    const itemType = await this.prisma.itemType.findUnique({
      where: { id: dto.itemTypeId },
    });
    if (!itemType) throw notFoundError("Item type not found");

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
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          type: "RECEIVE", // Use string directly
          status: "POSTED", // Use string directly
          itemTypeId: dto.itemTypeId,
          batchId: batch.id,
          qty: dto.qtyReceived,
          unitCost,
          totalCost,
          createdAt: receivedAt,
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

  async issue(dto: IssueInventoryDto, files: Express.Multer.File[], userId: number, mode: SystemMode) {
    const itemType = await this.prisma.itemType.findUnique({
      where: { id: dto.itemTypeId },
    });
    if (!itemType) throw notFoundError("Item type not found");

    if (!dto.issuedToName?.trim()) {
      throw validationError("issuedToName is required", { issuedToName: "Required" });
    }

    return this.prisma.$transaction(async (tx) => {
      const batch = await tx.batch.findUnique({ where: { id: dto.batchId } });
      if (!batch || batch.itemTypeId !== dto.itemTypeId) {
        throw validationError("Batch selection is required for this issue.", {
          batchId: "Invalid batch",
        });
      }

      const availableQty = Math.max(batch.qtyReceived - batch.qtyIssued, 0);
      if (availableQty < dto.qty) {
        throw validationError("Insufficient batch inventory", {
          qty: "Exceeds available inventory",
        });
      }

      await tx.batch.update({
        where: { id: batch.id },
        data: { qtyIssued: batch.qtyIssued + dto.qty },
      });

      const transaction = await tx.transaction.create({
        data: {
          type: "ISSUE", // Use string directly
          status: "POSTED", // Use string directly
          itemTypeId: dto.itemTypeId,
          batchId: batch.id,
          qty: dto.qty,
          issuedToType: dto.issuedToType, // Use string directly
          issuedToName: dto.issuedToName.trim(),
          unitPrice: mode === "INVENTORY" ? null : null,
          totalPrice: mode === "INVENTORY" ? null : null,
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

      return { transaction: toTransactionShape(transaction) };
    });
  }
}