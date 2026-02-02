// transactions.service.ts - FIXED
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/utils/prisma.service";
import { normalizePagination, buildPagination } from "../common/utils/pagination";
import { syncUnitTotal } from "../common/utils/money-sync";
import { notFoundError, validationError, forbiddenError } from "../common/utils/errors";
// Remove: import { TransactionType } from "@prisma/client";
import { TransactionType } from "../common/enums"; // Add custom enum
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { SystemMode } from "../common/utils/mode";
import { toTransactionShape } from "../common/utils/transaction-shape";

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(params: {
    type?: TransactionType;
    itemTypeId?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }, mode?: SystemMode) {
    const { page, limit, skip } = normalizePagination(params.page, params.limit);
    const where: any = {};

    if (params.type) where.type = params.type;
    if (params.itemTypeId) where.itemTypeId = params.itemTypeId;
    if (mode) {
      where.itemType = { itemtype: mode };
    }
    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = new Date(params.startDate);
      if (params.endDate) where.createdAt.lte = new Date(params.endDate);
    }

    const [total, transactions] = await this.prisma.$transaction([
      this.prisma.transaction.count({ where }),
      this.prisma.transaction.findMany({
        where,
        include: {
          itemType: true,
          batch: true,
          createdBy: true,
          attachments: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return {
      transactions: transactions.map((txn) => toTransactionShape(txn)),
      pagination: buildPagination(page, limit, total),
    };
  }

  async findOne(id: number, mode?: SystemMode) {
    const where: any = { id };
    if (mode) {
      where.itemType = { itemtype: mode };
    }
    const transaction = await this.prisma.transaction.findFirst({
      where,
      include: {
        itemType: true,
        batch: true,
        createdBy: true,
        attachments: true,
      },
    });
    if (!transaction) throw notFoundError("Transaction not found");
    return toTransactionShape(transaction);
  }

  async update(id: number, dto: UpdateTransactionDto, mode: SystemMode) {
    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id },
        include: { batch: true, itemType: true },
      });
      if (!transaction) throw notFoundError("Transaction not found");
      if (mode && transaction.itemType?.itemtype && transaction.itemType.itemtype !== mode) {
        throw forbiddenError("Transaction belongs to another mode");
      }
      if (transaction.status !== "POSTED") {
        throw forbiddenError("Only posted transactions can be edited");
      }

      let nextQty = transaction.qty;
      if (dto.qty !== undefined) {
        if (!Number.isFinite(dto.qty) || dto.qty <= 0) {
          throw validationError("qty must be > 0", { qty: "Must be > 0" });
        }
        nextQty = dto.qty;
      }

      if (transaction.batchId) {
        const batch = await tx.batch.findUnique({
          where: { id: transaction.batchId },
        });
        if (!batch) throw notFoundError("Batch not found");

        if (transaction.type === "RECEIVE" && nextQty !== transaction.qty) {
          const nextReceived = batch.qtyReceived - transaction.qty + nextQty;
          if (nextReceived < batch.qtyIssued) {
            throw validationError("Quantity lower than issued amount", {
              qty: "Cannot be lower than issued",
            });
          }
          await tx.batch.update({
            where: { id: batch.id },
            data: { qtyReceived: nextReceived },
          });
        }

        if (transaction.type === "ISSUE" && nextQty !== transaction.qty) {
          const nextIssued = batch.qtyIssued - transaction.qty + nextQty;
          if (nextIssued > batch.qtyReceived) {
            throw validationError("Insufficient batch inventory", {
              qty: "Exceeds available inventory",
            });
          }
          await tx.batch.update({
            where: { id: batch.id },
            data: { qtyIssued: nextIssued },
          });
        }
      }

      const updateData: any = { qty: nextQty };

      if (transaction.type === "RECEIVE") {
        const hasUnit = Object.prototype.hasOwnProperty.call(dto, "unitCost");
        const hasTotal = Object.prototype.hasOwnProperty.call(dto, "totalCost");
        const changedField = hasUnit ? "unit" : hasTotal ? "total" : dto.qty !== undefined ? "qty" : null;

        if (changedField) {
          const { unit, total } = syncUnitTotal({
            qty: nextQty,
            unit: hasUnit ? (dto.unitCost ?? null) : transaction.unitCost,
            total: hasTotal ? (dto.totalCost ?? null) : transaction.totalCost,
            changedField,
          });
          updateData.unitCost = unit;
          updateData.totalCost = total;
        }
      }

      if (transaction.type === "ISSUE") {
        if (mode === "INVENTORY") {
          updateData.unitPrice = null;
          updateData.totalPrice = null;
        } else {
          const hasUnit = Object.prototype.hasOwnProperty.call(dto, "unitPrice");
          const hasTotal = Object.prototype.hasOwnProperty.call(dto, "totalPrice");
          const changedField = hasUnit ? "unit" : hasTotal ? "total" : dto.qty !== undefined ? "qty" : null;

          if (changedField) {
            const { unit, total } = syncUnitTotal({
              qty: nextQty,
              unit: hasUnit ? (dto.unitPrice ?? null) : transaction.unitPrice,
              total: hasTotal ? (dto.totalPrice ?? null) : transaction.totalPrice,
              changedField,
            });
            updateData.unitPrice = unit;
            updateData.totalPrice = total;
          }
        }
      }

      const updated = await tx.transaction.update({
        where: { id: transaction.id },
        data: updateData,
        include: {
          itemType: true,
          batch: true,
          createdBy: true,
          attachments: true,
        },
      });

      return toTransactionShape(updated);
    });
  }
}
