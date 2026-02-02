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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const inventory_service_1 = require("./inventory.service");
const receive_inventory_dto_1 = require("./dto/receive-inventory.dto");
const issue_inventory_dto_1 = require("./dto/issue-inventory.dto");
const disk_storage_1 = require("../uploads/storage/disk.storage");
const mode_1 = require("../common/utils/mode");
const errors_1 = require("../common/utils/errors");
const username_guard_1 = require("../common/guards/username.guard");
const UPLOAD_FIELDS = [{ name: "files", maxCount: 10 }];
const STORAGE_DIR = process.env.UPLOAD_DIR || "uploads";
const MAX_UPLOAD_SIZE = Number(process.env.UPLOAD_MAX_FILE_SIZE) || 10 * 1024 * 1024;
const parseMimeTypes = (value) => {
    if (!value) {
        return [
            "application/pdf",
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
        ];
    }
    return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
};
const ALLOWED_MIME_TYPES = parseMimeTypes(process.env.UPLOAD_ALLOWED_MIME_TYPES);
const inventoryUploadInterceptor = (0, platform_express_1.FileFieldsInterceptor)(UPLOAD_FIELDS, {
    storage: (0, disk_storage_1.buildDiskStorage)(STORAGE_DIR),
    limits: {
        fileSize: MAX_UPLOAD_SIZE,
    },
    fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME_TYPES.length > 0 &&
            !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            cb(new common_1.BadRequestException("Unsupported file type"), false);
            return;
        }
        cb(null, true);
    },
});
let InventoryController = class InventoryController {
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    async getBatches(itemTypeId, itemtype, req) {
        const id = Number(itemTypeId);
        if (!Number.isFinite(id)) {
            return { batches: [] };
        }
        const resolvedItemtype = itemtype || (0, mode_1.getModeFromRequest)(req);
        const batches = await this.inventoryService.getBatches(id, resolvedItemtype);
        return { batches };
    }
    async receive(dto, files, req) {
        if (!dto.itemTypeId) {
            throw (0, errors_1.validationError)("itemTypeId is required", { itemTypeId: "Required" });
        }
        const userId = req?.user?.id;
        if (!userId) {
            throw new common_1.UnauthorizedException("Missing user");
        }
        // Get itemtype from request body or default to INVENTORY
        const itemtype = dto.itemtype || (0, mode_1.getModeFromRequest)(req) || "INVENTORY";
        const result = await this.inventoryService.receive(dto, files?.files || [], userId, itemtype);
        return result;
    }
    async issue(dto, files, req) {
        const userId = req?.user?.id;
        if (!userId) {
            throw new common_1.UnauthorizedException("Missing user");
        }
        // Get itemtype from request body or default to INVENTORY
        const itemtype = dto.itemtype || (0, mode_1.getModeFromRequest)(req) || "INVENTORY";
        const result = await this.inventoryService.issue(dto, files?.files || [], userId, itemtype);
        return result;
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Get)("batches"),
    __param(0, (0, common_1.Query)("itemTypeId")),
    __param(1, (0, common_1.Query)("itemtype")),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getBatches", null);
__decorate([
    (0, common_1.Post)("receive"),
    (0, common_1.UseInterceptors)(inventoryUploadInterceptor),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [receive_inventory_dto_1.ReceiveInventoryDto, Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "receive", null);
__decorate([
    (0, common_1.Post)("issue"),
    (0, common_1.UseInterceptors)(inventoryUploadInterceptor),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [issue_inventory_dto_1.IssueInventoryDto, Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "issue", null);
exports.InventoryController = InventoryController = __decorate([
    (0, common_1.Controller)("inventory"),
    (0, common_1.UseGuards)(username_guard_1.UsernameGuard),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
