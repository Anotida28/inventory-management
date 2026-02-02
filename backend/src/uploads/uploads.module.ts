import { Module } from "@nestjs/common";
import { UploadsController } from "./uploads.controller";
import { UsernameGuard } from "../common/guards/username.guard";

@Module({
  controllers: [UploadsController],
  providers: [UsernameGuard],
})
export class UploadsModule {}
