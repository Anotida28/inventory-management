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
// src/inventory/inventory.service.ts - FIXED FOR STRING ENUMS
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/utils/prisma.service");
const money_sync_1 = require("../common/utils/money-sync");
const errors_1 = require("../common/utils/errors");
const transaction_shape_1 = require("../common/utils/transaction-shape");
let InventoryService = class InventoryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getBatches(itemTypeId, itemtype) {
        // If itemtype filter is provided, we need to check if it matches the ItemType
        if (itemtype) {
            const batches = await this.prisma.batch.findMany({
                where: {
                    itemTypeId,
                    itemType: {
                        itemtype: itemtype,
                    },
                },
                include: {
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
        }
        else {
            // No itemtype filter, just get batches
            const batches = await this.prisma.batch.findMany({
                where: { itemTypeId },
                include: {
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
    async receive(dto, files, userId, itemtype) {
        console.log(`Processing receive in ${itemtype} mode`);
        // First, update the ItemType's itemtype field
        await this.prisma.itemType.update({
            where: { id: dto.itemTypeId },
            data: { itemtype },
        });
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
            transaction: (0, transaction_shape_1.toTransactionShape)(result.transaction),
        };
    }
    async issue(dto, files, userId, itemtype) {
        const itemType = await this.prisma.itemType.findUnique({
            where: { id: dto.itemTypeId },
        });
        if (!itemType)
            throw (0, errors_1.notFoundError)("Item type not found");
        // Update itemtype on ItemType if needed
        if (itemType.itemtype !== itemtype) {
            await this.prisma.itemType.update({
                where: { id: dto.itemTypeId },
                data: { itemtype },
            });
        }
        // Rest of your issue method remains the same
        // but remove itemtype from transaction creation
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryService);
