import { IsEnum, IsOptional } from 'class-validator';
import { TransactionType } from '../../common/enums'; // Changed from @prisma/client

export class TransactionsQueryDto {
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  itemTypeId?: number;

  @IsOptional()
  batchId?: number;

  @IsOptional()
  fromDate?: Date;

  @IsOptional()
  toDate?: Date;
}