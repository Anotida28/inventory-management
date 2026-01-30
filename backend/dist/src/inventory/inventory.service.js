"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/utils/prisma.service");
const money_sync_1 = require("../common/utils/money-sync");
const errors_1 = require("../common/utils/errors");
const transaction_shape_1 = require("../common/utils/transaction-shape");
let InventoryService = class InventoryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getBatches(itemTypeId) {
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
    async receive(dto, files, userId) {
        const itemType = await this.prisma.itemType.findUnique({
            where: { id: dto.itemTypeId },
        });
        if (!itemType)
            throw (0, errors_1.notFoundError)("Item type not found");
        const batchCode = dto.batchCode?.trim() || `BATCH-${Date.now()}`;
        const receivedAt = dto.receivedAt ? new Date(dto.receivedAt) : new Date();
        let unitCost = dto.unitCost ?? null;
        let totalCost = dto.totalCost ?? null;
        const changedField = unitCost != null ? "unit" : totalCost != null ? "total" : null;
        if (changedField) {
            const synced = (0, money_sync_1.syncUnitTotal)({
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
            transaction: (0, transaction_shape_1.toTransactionShape)(result.transaction),
        };
    }
    async issue(dto, files, userId, mode) {
        const itemType = await this.prisma.itemType.findUnique({
            where: { id: dto.itemTypeId },
        });
        if (!itemType)
            throw (0, errors_1.notFoundError)("Item type not found");
        if (!dto.issuedToName?.trim()) {
            throw (0, errors_1.validationError)("issuedToName is required", { issuedToName: "Required" });
        }
        return this.prisma.$transaction(async (tx) => {
            const batch = await tx.batch.findUnique({ where: { id: dto.batchId } });
            if (!batch || batch.itemTypeId !== dto.itemTypeId) {
                throw (0, errors_1.validationError)("Batch selection is required for this issue.", {
                    batchId: "Invalid batch",
                });
            }
            const availableQty = Math.max(batch.qtyReceived - batch.qtyIssued, 0);
            if (availableQty < dto.qty) {
                throw (0, errors_1.validationError)("Insufficient batch inventory", {
                    qty: "Exceeds available inventory",
                });
            }
            await tx.batch.update({
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
                    issuedToType: dto.issuedToType,
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
            return { transaction: (0, transaction_shape_1.toTransactionShape)(transaction) };
        });
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryService);
