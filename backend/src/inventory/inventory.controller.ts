import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseInterceptors,
  UploadedFiles,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { InventoryService } from "./inventory.service";
import { ReceiveInventoryDto } from "./dto/receive-inventory.dto";
import { IssueInventoryDto } from "./dto/issue-inventory.dto";
import { buildDiskStorage } from "../uploads/storage/disk.storage";
import { getModeFromRequest } from "../common/utils/mode";
import { validationError } from "../common/utils/errors";

@Controller("inventory")
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
  ) {}

  @Get("batches")
  async getBatches(@Query("itemTypeId") itemTypeId?: string) {
    const id = Number(itemTypeId);
    if (!Number.isFinite(id)) {
      return { batches: [] };
    }
    const batches = await this.inventoryService.getBatches(id);
    return { batches };
  }

  @Post("receive")
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "files", maxCount: 10 }], {
      storage: buildDiskStorage(process.env.UPLOAD_DIR || "uploads"),
    }),
  )
  async receive(
    @Body() dto: ReceiveInventoryDto,
    @UploadedFiles() files: { files?: Express.Multer.File[] },
  ) {
    if (!dto.itemTypeId) {
      throw validationError("itemTypeId is required", { itemTypeId: "Required" });
    }
    const result = await this.inventoryService.receive(
      dto,
      files?.files || [],
      1,
    );
    return result;
  }

  @Post("issue")
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "files", maxCount: 10 }], {
      storage: buildDiskStorage(process.env.UPLOAD_DIR || "uploads"),
    }),
  )
  async issue(
    @Body() dto: IssueInventoryDto,
    @UploadedFiles() files: { files?: Express.Multer.File[] },
    @Req() req: any,
  ) {
    const mode = getModeFromRequest(req);
    const result = await this.inventoryService.issue(
      dto,
      files?.files || [],
      1,
      mode,
    );
    return result;
  }
}
