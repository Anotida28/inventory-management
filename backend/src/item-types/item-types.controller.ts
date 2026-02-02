import { Controller, Get, Post, Body, Query, Req, UseGuards } from "@nestjs/common";
import { ItemTypesService } from "./item-types.service";
import { CreateItemTypeDto } from "./dto/create-item-type.dto";
import { UsernameGuard } from "../common/guards/username.guard";
import { getModeFromRequest } from "../common/utils/mode";

@Controller("item-types")
@UseGuards(UsernameGuard)
export class ItemTypesController {
  constructor(private readonly itemTypesService: ItemTypesService) {}

  @Get()
  async getItemTypes(
    @Req() req: any,
    @Query("includeInactive") includeInactive?: string,
  ) {
    const mode = getModeFromRequest(req);
    const itemTypes = await this.itemTypesService.findAll(
      includeInactive === "true",
      mode,
    );
    return { itemTypes };
  }

  @Post()
  async createItemType(@Body() dto: CreateItemTypeDto, @Req() req: any) {
    const mode = getModeFromRequest(req);
    return this.itemTypesService.create(dto, mode);
  }
}
