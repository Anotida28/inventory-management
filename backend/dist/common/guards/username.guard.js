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
exports.UsernameGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../utils/prisma.service");
const ALLOWED_USERNAMES = new Set(["finance", "sales"]);
let UsernameGuard = class UsernameGuard {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const headerValue = request.headers?.["x-username"];
        const raw = Array.isArray(headerValue) ? headerValue[0] : headerValue;
        const username = raw ? String(raw).trim() : "";
        if (!username) {
            throw new common_1.UnauthorizedException("Missing username");
        }
        if (!ALLOWED_USERNAMES.has(username)) {
            throw new common_1.UnauthorizedException("Invalid username");
        }
        const user = await this.prisma.user.findUnique({ where: { username } });
        if (!user) {
            throw new common_1.UnauthorizedException("Invalid username");
        }
        request.user = { id: user.id, username: user.username };
        return true;
    }
};
exports.UsernameGuard = UsernameGuard;
exports.UsernameGuard = UsernameGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsernameGuard);
