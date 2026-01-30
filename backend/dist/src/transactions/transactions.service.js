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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/utils/prisma.service");
const pagination_1 = require("../common/utils/pagination");
const money_sync_1 = require("../common/utils/money-sync");
const errors_1 = require("../common/utils/errors");
const transaction_shape_1 = require("../common/utils/transaction-shape");
let TransactionsService = class TransactionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findMany(params) {
        const { page, limit, skip } = (0, pagination_1.normalizePagination)(params.page, params.limit);
        const where = {};
        if (params.type)
            where.type = params.type;
        if (params.itemTypeId)
            where.itemTypeId = params.itemTypeId;
        if (params.startDate || params.endDate) {
            where.createdAt = {};
            if (params.startDate)
                where.createdAt.gte = new Date(params.startDate);
            if (params.endDate)
                where.createdAt.lte = new Date(params.endDate);
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
            transactions: transactions.map((txn) => (0, transaction_shape_1.toTransactionShape)(txn)),
            pagination: (0, pagination_1.buildPagination)(page, limit, total),
        };
    }
    async findOne(id) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id },
            include: {
                itemType: true,
                batch: true,
                createdBy: true,
                attachments: true,
            },
        });
        if (!transaction)
            throw (0, errors_1.notFoundError)("Transaction not found");
        return (0, transaction_shape_1.toTransactionShape)(transaction);
    }
    async update(id, dto, mode) {
        return this.prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.findUnique({
                where: { id },
                include: { batch: true },
            });
            if (!transaction)
                throw (0, errors_1.notFoundError)("Transaction not found");
            if (transaction.status !== "POSTED") {
                throw (0, errors_1.forbiddenError)("Only posted transactions can be edited");
            }
            let nextQty = transaction.qty;
            if (dto.qty !== undefined) {
                if (!Number.isFinite(dto.qty) || dto.qty <= 0) {
                    throw (0, errors_1.validationError)("qty must be > 0", { qty: "Must be > 0" });
                }
                nextQty = dto.qty;
            }
            if (transaction.batchId) {
                const batch = await tx.batch.findUnique({
                    where: { id: transaction.batchId },
                });
                if (!batch)
                    throw (0, errors_1.notFoundError)("Batch not found");
                if (transaction.type === "RECEIVE" && nextQty !== transaction.qty) {
                    const nextReceived = batch.qtyReceived - transaction.qty + nextQty;
                    if (nextReceived < batch.qtyIssued) {
                        throw (0, errors_1.validationError)("Quantity lower than issued amount", {
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
                        throw (0, errors_1.validationError)("Insufficient batch inventory", {
                            qty: "Exceeds available inventory",
                        });
                    }
                    await tx.batch.update({
                        where: { id: batch.id },
                        data: { qtyIssued: nextIssued },
                    });
                }
            }
            const updateData = { qty: nextQty };
            if (transaction.type === "RECEIVE") {
                const hasUnit = Object.prototype.hasOwnProperty.call(dto, "unitCost");
                const hasTotal = Object.prototype.hasOwnProperty.call(dto, "totalCost");
                const changedField = hasUnit ? "unit" : hasTotal ? "total" : dto.qty !== undefined ? "qty" : null;
                if (changedField) {
                    const { unit, total } = (0, money_sync_1.syncUnitTotal)({
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
                }
                else {
                    const hasUnit = Object.prototype.hasOwnProperty.call(dto, "unitPrice");
                    const hasTotal = Object.prototype.hasOwnProperty.call(dto, "totalPrice");
                    const changedField = hasUnit ? "unit" : hasTotal ? "total" : dto.qty !== undefined ? "qty" : null;
                    if (changedField) {
                        const { unit, total } = (0, money_sync_1.syncUnitTotal)({
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
            return (0, transaction_shape_1.toTransactionShape)(updated);
        });
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransactionsService);
