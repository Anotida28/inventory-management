import { IsDateString, IsInt, IsOptional, Min } from "class-validator";
import { Type } from "class-transformer";

export class ReportFiltersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  itemTypeId?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
