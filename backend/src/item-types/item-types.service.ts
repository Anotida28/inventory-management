import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/utils/prisma.service";
import { CreateItemTypeDto } from "./dto/create-item-type.dto";
import { type SystemMode } from "../common/utils/mode";

const toItemTypeCode = (value: string) =>
  value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 20) || "NEW";

@Injectable()
export class ItemTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(includeInactive = false, mode?: SystemMode) {
    const where: any = includeInactive ? {} : { isActive: true };
    if (mode) {
      where.itemtype = mode;
    }
    return this.prisma.itemType.findMany({
      where,
      orderBy: { name: "asc" },
    });
  }

  async create(dto: CreateItemTypeDto, mode?: SystemMode) {
    const code = dto.code?.trim() || toItemTypeCode(dto.name);
    return this.prisma.itemType.create({
      data: {
        name: dto.name.trim(),
        code,
        isActive: true,
        itemtype: mode ?? null,
      },
    });
  }
}
