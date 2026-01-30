"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundError = exports.forbiddenError = exports.validationError = void 0;
const common_1 = require("@nestjs/common");
const validationError = (message, fields) => new common_1.BadRequestException({
    error: "ValidationError",
    message,
    fields,
});
exports.validationError = validationError;
const forbiddenError = (message) => new common_1.ForbiddenException({
    error: "Forbidden",
    message,
});
exports.forbiddenError = forbiddenError;
const notFoundError = (message) => new common_1.NotFoundException({
    error: "NotFound",
    message,
});
exports.notFoundError = notFoundError;
