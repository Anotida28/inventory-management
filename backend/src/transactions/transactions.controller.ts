import { Controller, Get, Param, ParseIntPipe, Patch, Query, Body, Req } from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { TransactionsQueryDto } from "./dto/transactions-query.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { getModeFromRequest } from "../common/utils/mode";

@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async getTransactions(@Query() query: TransactionsQueryDto) {
    return this.transactionsService.findMany(query);
  }

  @Get(":id")
  async getTransaction(@Param("id", ParseIntPipe) id: number) {
    return this.transactionsService.findOne(id);
  }

  @Patch(":id")
  async updateTransaction(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateTransactionDto,
    @Req() req: any,
  ) {
    const mode = getModeFromRequest(req);
    return this.transactionsService.update(id, dto, mode);
  }
}
