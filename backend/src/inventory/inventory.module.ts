import { Module } from "@nestjs/common";
import { InventoryController } from "./inventory.controller";
import { InventoryService } from "./inventory.service";
import { UsernameGuard } from "../common/guards/username.guard";

@Module({
  controllers: [InventoryController],
  providers: [InventoryService, UsernameGuard],
})
export class InventoryModule {}
