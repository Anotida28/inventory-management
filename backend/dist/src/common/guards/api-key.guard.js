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
exports.ApiKeyGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let ApiKeyGuard = class ApiKeyGuard {
    constructor(configService) {
        this.configService = configService;
    }
    canActivate(context) {
        const requiredKey = this.configService.get("apiKey");
        if (!requiredKey) {
            throw new common_1.UnauthorizedException("API key is not configured");
        }
        const request = context.switchToHttp().getRequest();
        const headerValue = request.headers?.["x-api-key"] ||
            request.headers?.authorization ||
            request.headers?.Authorization;
        if (!headerValue) {
            throw new common_1.UnauthorizedException("Missing API key");
        }
        const providedKey = Array.isArray(headerValue) ? headerValue[0] : String(headerValue);
        const normalized = providedKey.indexOf(" ") > -1 ? providedKey.split(" ").pop() : providedKey;
        if (!normalized || normalized !== requiredKey) {
            throw new common_1.UnauthorizedException("Invalid API key");
        }
        return true;
    }
};
exports.ApiKeyGuard = ApiKeyGuard;
exports.ApiKeyGuard = ApiKeyGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ApiKeyGuard);
