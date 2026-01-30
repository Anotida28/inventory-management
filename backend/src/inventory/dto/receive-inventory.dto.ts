import { Type } from "class-transformer";
import { IsDateString, IsInt, IsOptional, IsString, Min } from "class-validator";

export class ReceiveInventoryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  itemTypeId!: number;

  @IsOptional()
  @IsString()
  batchCode?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  qtyReceived!: number;

  @IsOptional()
  @IsDateString()
  receivedAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  itemtype?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  unitCost?: number | null;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  totalCost?: number | null;
}
