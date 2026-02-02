import { Controller, Get, Param, Res, UseGuards, BadRequestException, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { existsSync } from "fs";
import { basename, resolve } from "path";
import { UsernameGuard } from "../common/guards/username.guard";

@Controller("uploads")
@UseGuards(UsernameGuard)
export class UploadsController {
  constructor(private readonly configService: ConfigService) {}

  @Get(":filename")
  async download(@Param("filename") filename: string, @Res() res: Response) {
    const safeName = basename(filename);
    if (!safeName || safeName !== filename) {
      throw new BadRequestException("Invalid filename");
    }

    const uploadDir = this.configService.get<string>("uploadDir") || "uploads";
    const fullPath = resolve(process.cwd(), uploadDir, safeName);

    if (!existsSync(fullPath)) {
      throw new NotFoundException("File not found");
    }

    return res.sendFile(fullPath);
  }
}
