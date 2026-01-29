import { Controller, Get, Post, Body, Query } from "@nestjs/common";
import { ItemTypesService } from "./item-types.service";
import { CreateItemTypeDto } from "./dto/create-item-type.dto";

@Controller("item-types")
export class ItemTypesController {
  constructor(private readonly itemTypesService: ItemTypesService) {}

  @Get()
  async getItemTypes(@Query("includeInactive") includeInactive?: string) {
    const itemTypes = await this.itemTypesService.findAll(
      includeInactive === "true",
    );
    return { itemTypes };
  }

  @Post()
  async createItemType(@Body() dto: CreateItemTypeDto) {
    return this.itemTypesService.create(dto);
  }
}
