import { Module } from "@nestjs/common";
import { ItemTypesController } from "./item-types.controller";
import { ItemTypesService } from "./item-types.service";
import { UsernameGuard } from "../common/guards/username.guard";

@Module({
  controllers: [ItemTypesController],
  providers: [ItemTypesService, UsernameGuard],
  exports: [ItemTypesService],
})
export class ItemTypesModule {}
