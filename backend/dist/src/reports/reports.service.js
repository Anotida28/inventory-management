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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/utils/prisma.service");
const transaction_shape_1 = require("../common/utils/transaction-shape");
const sumCost = (txn) => {
    if (txn.totalCost != null)
        return txn.totalCost;
    if (txn.unitCost != null)
        return txn.unitCost * txn.qty;
    return 0;
};
const sumRevenue = (txn) => {
    if (txn.totalPrice != null)
        return txn.totalPrice;
    if (txn.unitPrice != null)
        return txn.unitPrice * txn.qty;
    return 0;
};
let ReportsService = class ReportsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    buildWhere(filters) {
        const where = {};
        if (filters.itemTypeId)
            where.itemTypeId = filters.itemTypeId;
        if (filters.startDate || filters.endDate) {
            where.createdAt = {};
            if (filters.startDate)
                where.createdAt.gte = new Date(filters.startDate);
            if (filters.endDate)
                where.createdAt.lte = new Date(filters.endDate);
        }
        return where;
    }
    async fetchTransactions(filters) {
        const where = this.buildWhere(filters);
        return this.prisma.transaction.findMany({
            where,
            include: {
                itemType: true,
                batch: true,
                createdBy: true,
                attachments: true,
            },
            orderBy: { createdAt: "desc" },
        });
    }
    async getDashboard(filters, mode) {
        const isInventory = mode === "INVENTORY";
        const [itemTypes, transactions] = await this.prisma.$transaction([
            this.prisma.itemType.findMany({ orderBy: { name: "asc" } }),
            this.fetchTransactions(filters),
        ]);
        const byItemType = itemTypes
            .filter((itemType) => !filters.itemTypeId || itemType.id === filters.itemTypeId)
            .map((itemType) => {
            const itemTransactions = transactions.filter((txn) => txn.itemTypeId === itemType.id);
            const receives = itemTransactions.filter((txn) => txn.type === "RECEIVE");
            const issues = itemTransactions.filter((txn) => txn.type === "ISSUE");
            const receivedQty = receives.reduce((sum, txn) => sum + txn.qty, 0);
            const receivedCost = receives.reduce((sum, txn) => sum + sumCost(txn), 0);
            const issuedQty = issues.reduce((sum, txn) => sum + txn.qty, 0);
            const issuedRevenue = isInventory
                ? 0
                : issues.reduce((sum, txn) => sum + sumRevenue(txn), 0);
            const balance = receivedQty - issuedQty;
            const avgUnitCost = receivedQty ? receivedCost / receivedQty : 0;
            const avgUnitPrice = issuedQty && !isInventory ? issuedRevenue / issuedQty : 0;
            const inventoryValue = balance * avgUnitCost;
            const profit = isInventory ? 0 : issuedRevenue - receivedCost;
            return {
                itemType: {
                    id: itemType.id,
                    name: itemType.name,
                    code: itemType.code,
                },
                receivedQty,
                receivedCost,
                issuedQty,
                issuedRevenue,
                balance,
                avgUnitCost,
                avgUnitPrice,
                profit,
                inventoryValue,
            };
        });
        const totals = byItemType.reduce((acc, item) => {
            acc.totalReceivedQty += item.receivedQty;
            acc.totalReceivedCost += item.receivedCost;
            acc.totalIssuedQty += item.issuedQty;
            acc.totalIssuedRevenue += item.issuedRevenue;
            acc.outstandingInventoryQty += item.balance;
            acc.estimatedInventoryValue += item.inventoryValue;
            return acc;
        }, {
            totalReceivedQty: 0,
            totalReceivedCost: 0,
            totalIssuedQty: 0,
            totalIssuedRevenue: 0,
            outstandingInventoryQty: 0,
            estimatedInventoryValue: 0,
        });
        const avgReceiveCost = totals.totalReceivedQty
            ? totals.totalReceivedCost / totals.totalReceivedQty
            : 0;
        const avgIssuePrice = totals.totalIssuedQty && !isInventory
            ? totals.totalIssuedRevenue / totals.totalIssuedQty
            : 0;
        const estimatedProfit = isInventory
            ? 0
            : totals.totalIssuedRevenue - totals.totalReceivedCost;
        const profitMargin = totals.totalIssuedRevenue && !isInventory
            ? (estimatedProfit / totals.totalIssuedRevenue) * 100
            : 0;
        const chartBuckets = new Map();
        transactions.forEach((txn) => {
            const date = new Date(txn.createdAt);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            if (!chartBuckets.has(key)) {
                chartBuckets.set(key, { cost: 0, revenue: 0, profit: 0 });
            }
            const bucket = chartBuckets.get(key);
            if (!bucket)
                return;
            if (txn.type === "RECEIVE") {
                const cost = sumCost(txn);
                bucket.cost += cost;
                if (!isInventory)
                    bucket.profit -= cost;
            }
            if (txn.type === "ISSUE" && !isInventory) {
                const revenue = sumRevenue(txn);
                bucket.revenue += revenue;
                bucket.profit += revenue;
            }
        });
        const chartData = Array.from(chartBuckets.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([bucket, values]) => ({
            date: bucket,
            receivedCost: values.cost,
            issuedRevenue: values.revenue,
            profit: values.profit,
        }))
            .slice(-6);
        const receipts = transactions
            .filter((txn) => txn.type === "RECEIVE")
            .slice(0, 5)
            .map((txn) => ({
            id: txn.id,
            type: "RECEIVE",
            itemType: {
                id: txn.itemType.id,
                name: txn.itemType.name,
                code: txn.itemType.code,
            },
            status: txn.status,
            qty: txn.qty,
            unitCost: txn.unitCost ?? null,
            totalCost: txn.totalCost ?? null,
            calculatedTotalCost: sumCost(txn),
            createdAt: txn.createdAt,
        }));
        const issues = transactions
            .filter((txn) => txn.type === "ISSUE")
            .slice(0, 5)
            .map((txn) => ({
            id: txn.id,
            type: "ISSUE",
            itemType: {
                id: txn.itemType.id,
                name: txn.itemType.name,
                code: txn.itemType.code,
            },
            status: txn.status,
            qty: txn.qty,
            unitPrice: txn.unitPrice ?? null,
            totalPrice: txn.totalPrice ?? null,
            calculatedTotalPrice: sumRevenue(txn),
            createdAt: txn.createdAt,
        }));
        return {
            totals: {
                ...totals,
                inventoryValue: totals.estimatedInventoryValue,
                avgReceiveCost,
                avgIssuePrice,
                estimatedProfit,
                profitMargin,
            },
            byItemType,
            chartData,
            recent: { receipts, issues },
        };
    }
    async getStockBalance(filters) {
        const [itemTypes, transactions] = await this.prisma.$transaction([
            this.prisma.itemType.findMany({ orderBy: { name: "asc" } }),
            this.fetchTransactions(filters),
        ]);
        const byItemType = itemTypes.map((itemType) => {
            const itemTransactions = transactions.filter((txn) => txn.itemTypeId === itemType.id);
            const balance = itemTransactions.reduce((sum, txn) => {
                if (txn.type === "RECEIVE")
                    return sum + txn.qty;
                if (txn.type === "ISSUE")
                    return sum - txn.qty;
                return sum;
            }, 0);
            const lastUpdatedAt = itemTransactions.length > 0
                ? itemTransactions[0].createdAt
                : new Date().toISOString();
            return {
                itemType: {
                    id: itemType.id,
                    name: itemType.name,
                    code: itemType.code,
                },
                balance,
                lastUpdatedAt,
            };
        });
        return {
            summary: {
                totalCount: byItemType.length,
                totalQty: byItemType.reduce((sum, item) => sum + item.balance, 0),
            },
            byItemType,
        };
    }
    async getIssues(filters) {
        const transactions = await this.fetchTransactions(filters);
        const issues = transactions.filter((txn) => txn.type === "ISSUE");
        const byItemType = new Map();
        issues.forEach((txn) => {
            const current = byItemType.get(txn.itemTypeId) || {
                itemType: txn.itemType,
                totalQty: 0,
                totalCount: 0,
            };
            current.totalQty += txn.qty;
            current.totalCount += 1;
            byItemType.set(txn.itemTypeId, current);
        });
        const byItemTypeList = Array.from(byItemType.values()).map((entry) => ({
            itemType: {
                id: entry.itemType.id,
                name: entry.itemType.name,
                code: entry.itemType.code,
            },
            totalQty: entry.totalQty,
            totalCount: entry.totalCount,
        }));
        return {
            summary: {
                totalCount: issues.length,
                totalQty: issues.reduce((sum, txn) => sum + txn.qty, 0),
                byItemType: byItemTypeList,
            },
            byItemType: byItemTypeList,
            issues: issues.map((txn) => (0, transaction_shape_1.toTransactionShape)(txn)),
        };
    }
    async getReceipts(filters) {
        const transactions = await this.fetchTransactions(filters);
        const receipts = transactions.filter((txn) => txn.type === "RECEIVE");
        const byItemType = new Map();
        receipts.forEach((txn) => {
            const current = byItemType.get(txn.itemTypeId) || {
                itemType: txn.itemType,
                totalQty: 0,
                totalCount: 0,
                totalReceivedCost: 0,
            };
            current.totalQty += txn.qty;
            current.totalCount += 1;
            current.totalReceivedCost += sumCost(txn);
            byItemType.set(txn.itemTypeId, current);
        });
        const byItemTypeList = Array.from(byItemType.values()).map((entry) => ({
            itemType: {
                id: entry.itemType.id,
                name: entry.itemType.name,
                code: entry.itemType.code,
            },
            totalQty: entry.totalQty,
            totalCount: entry.totalCount,
            totalReceivedCost: entry.totalReceivedCost,
        }));
        return {
            summary: {
                totalCount: receipts.length,
                totalQty: receipts.reduce((sum, txn) => sum + txn.qty, 0),
                totalReceivedCost: receipts.reduce((sum, txn) => sum + sumCost(txn), 0),
                byItemType: byItemTypeList,
            },
            byItemType: byItemTypeList,
            receipts: receipts.map((txn) => (0, transaction_shape_1.toTransactionShape)(txn)),
        };
    }
    async getUserActivity(filters) {
        const transactions = await this.fetchTransactions(filters);
        const byUser = new Map();
        transactions.forEach((txn) => {
            const user = txn.createdBy;
            if (!user)
                return;
            if (!byUser.has(user.id)) {
                byUser.set(user.id, {
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                    },
                    receipts: 0,
                    issues: 0,
                    adjustments: 0,
                    reversals: 0,
                    transactions: [],
                    counts: {},
                });
            }
            const entry = byUser.get(user.id);
            entry.transactions.push((0, transaction_shape_1.toTransactionShape)(txn));
            entry.counts[txn.type] = (entry.counts[txn.type] || 0) + 1;
            if (txn.type === "RECEIVE")
                entry.receipts += 1;
            if (txn.type === "ISSUE")
                entry.issues += 1;
            if (txn.type === "ADJUSTMENT")
                entry.adjustments += 1;
            if (txn.type === "REVERSAL")
                entry.reversals += 1;
        });
        const byUserList = Array.from(byUser.values()).map((entry) => ({
            ...entry,
            totalTransactions: entry.transactions.length,
        }));
        return {
            summary: {
                totalUsers: byUserList.length,
                totalTransactions: transactions.length,
            },
            byUser: byUserList,
            transactions: transactions.map((txn) => (0, transaction_shape_1.toTransactionShape)(txn)),
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
