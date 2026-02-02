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
exports.UploadsController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs_1 = require("fs");
const path_1 = require("path");
const username_guard_1 = require("../common/guards/username.guard");
let UploadsController = class UploadsController {
    constructor(configService) {
        this.configService = configService;
    }
    async download(filename, res) {
        const safeName = (0, path_1.basename)(filename);
        if (!safeName || safeName !== filename) {
            throw new common_1.BadRequestException("Invalid filename");
        }
        const uploadDir = this.configService.get("uploadDir") || "uploads";
        const fullPath = (0, path_1.resolve)(process.cwd(), uploadDir, safeName);
        if (!(0, fs_1.existsSync)(fullPath)) {
            throw new common_1.NotFoundException("File not found");
        }
        return res.sendFile(fullPath);
    }
};
exports.UploadsController = UploadsController;
__decorate([
    (0, common_1.Get)(":filename"),
    __param(0, (0, common_1.Param)("filename")),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "download", null);
exports.UploadsController = UploadsController = __decorate([
    (0, common_1.Controller)("uploads"),
    (0, common_1.UseGuards)(username_guard_1.UsernameGuard),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UploadsController);
