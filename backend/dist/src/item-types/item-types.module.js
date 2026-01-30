"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemTypesModule = void 0;
const common_1 = require("@nestjs/common");
const item_types_controller_1 = require("./item-types.controller");
const item_types_service_1 = require("./item-types.service");
let ItemTypesModule = class ItemTypesModule {
};
exports.ItemTypesModule = ItemTypesModule;
exports.ItemTypesModule = ItemTypesModule = __decorate([
    (0, common_1.Module)({
        controllers: [item_types_controller_1.ItemTypesController],
        providers: [item_types_service_1.ItemTypesService],
        exports: [item_types_service_1.ItemTypesService],
    })
], ItemTypesModule);
