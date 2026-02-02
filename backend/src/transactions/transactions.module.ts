import { Module } from "@nestjs/common";
import { TransactionsController } from "./transactions.controller";
import { TransactionsService } from "./transactions.service";
import { UsernameGuard } from "../common/guards/username.guard";

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService, UsernameGuard],
  exports: [TransactionsService],
})
export class TransactionsModule {}
