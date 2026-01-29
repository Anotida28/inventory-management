import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { IssuedToType } from "@prisma/client";

export class IssueInventoryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  itemTypeId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  qty!: number;

  @IsEnum(IssuedToType)
  issuedToType!: IssuedToType;

  @IsString()
  issuedToName!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  batchId!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
