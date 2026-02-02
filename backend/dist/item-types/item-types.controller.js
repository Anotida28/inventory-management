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
exports.ItemTypesController = void 0;
const common_1 = require("@nestjs/common");
const item_types_service_1 = require("./item-types.service");
const create_item_type_dto_1 = require("./dto/create-item-type.dto");
const username_guard_1 = require("../common/guards/username.guard");
const mode_1 = require("../common/utils/mode");
let ItemTypesController = class ItemTypesController {
    constructor(itemTypesService) {
        this.itemTypesService = itemTypesService;
    }
    async getItemTypes(req, includeInactive) {
        const mode = (0, mode_1.getModeFromRequest)(req);
        const itemTypes = await this.itemTypesService.findAll(includeInactive === "true", mode);
        return { itemTypes };
    }
    async createItemType(dto, req) {
        const mode = (0, mode_1.getModeFromRequest)(req);
        return this.itemTypesService.create(dto, mode);
    }
};
exports.ItemTypesController = ItemTypesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)("includeInactive")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ItemTypesController.prototype, "getItemTypes", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_item_type_dto_1.CreateItemTypeDto, Object]),
    __metadata("design:returntype", Promise)
], ItemTypesController.prototype, "createItemType", null);
exports.ItemTypesController = ItemTypesController = __decorate([
    (0, common_1.Controller)("item-types"),
    (0, common_1.UseGuards)(username_guard_1.UsernameGuard),
    __metadata("design:paramtypes", [item_types_service_1.ItemTypesService])
], ItemTypesController);
