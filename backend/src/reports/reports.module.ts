import { Module } from "@nestjs/common";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";
import { UsernameGuard } from "../common/guards/username.guard";

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, UsernameGuard],
})
export class ReportsModule {}
