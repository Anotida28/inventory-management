import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/utils/prisma.service";
import { CreateItemTypeDto } from "./dto/create-item-type.dto";

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

  async findAll(includeInactive = false) {
    return this.prisma.itemType.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { name: "asc" },
    });
  }

  async create(dto: CreateItemTypeDto) {
    const code = dto.code?.trim() || toItemTypeCode(dto.name);
    return this.prisma.itemType.create({
      data: {
        name: dto.name.trim(),
        code,
        isActive: true,
      },
    });
  }
}
