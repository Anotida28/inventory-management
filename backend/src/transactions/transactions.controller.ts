import { Controller, Get, Param, ParseIntPipe, Patch, Query, Body, Req, UseGuards } from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { TransactionsQueryDto } from "./dto/transactions-query.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { getModeFromRequest } from "../common/utils/mode";
import { UsernameGuard } from "../common/guards/username.guard";

@Controller("transactions")
@UseGuards(UsernameGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async getTransactions(@Query() query: TransactionsQueryDto, @Req() req: any) {
    const mode = getModeFromRequest(req);
    return this.transactionsService.findMany(query, mode);
  }

  @Get(":id")
  async getTransaction(@Param("id", ParseIntPipe) id: number, @Req() req: any) {
    const mode = getModeFromRequest(req);
    return this.transactionsService.findOne(id, mode);
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
