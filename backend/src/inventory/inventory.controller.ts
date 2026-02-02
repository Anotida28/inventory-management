import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseInterceptors,
  UploadedFiles,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { InventoryService } from "./inventory.service";
import { ReceiveInventoryDto } from "./dto/receive-inventory.dto";
import { IssueInventoryDto } from "./dto/issue-inventory.dto";
import { buildDiskStorage } from "../uploads/storage/disk.storage";
import { getModeFromRequest } from "../common/utils/mode";
import { validationError } from "../common/utils/errors";
import { UsernameGuard } from "../common/guards/username.guard";

const UPLOAD_FIELDS = [{ name: "files", maxCount: 10 }];
const STORAGE_DIR = process.env.UPLOAD_DIR || "uploads";
const MAX_UPLOAD_SIZE =
  Number(process.env.UPLOAD_MAX_FILE_SIZE) || 10 * 1024 * 1024;
const parseMimeTypes = (value?: string | null) => {
  if (!value) {
    return [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};
const ALLOWED_MIME_TYPES = parseMimeTypes(
  process.env.UPLOAD_ALLOWED_MIME_TYPES,
);

const inventoryUploadInterceptor = FileFieldsInterceptor(UPLOAD_FIELDS, {
  storage: buildDiskStorage(STORAGE_DIR),
  limits: {
    fileSize: MAX_UPLOAD_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    if (
      ALLOWED_MIME_TYPES.length > 0 &&
      !ALLOWED_MIME_TYPES.includes(file.mimetype)
    ) {
      cb(new BadRequestException("Unsupported file type"), false);
      return;
    }
    cb(null, true);
  },
});

@Controller("inventory")
@UseGuards(UsernameGuard)
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
  ) {}

  @Get("batches")
  async getBatches(
    @Query("itemTypeId") itemTypeId?: string,
    @Query("itemtype") itemtype?: string, // Add itemtype filter
    @Req() req?: any,
  ) {
    const id = Number(itemTypeId);
    if (!Number.isFinite(id)) {
      return { batches: [] };
    }
    const resolvedItemtype = itemtype || getModeFromRequest(req);
    const batches = await this.inventoryService.getBatches(id, resolvedItemtype);
    return { batches };
  }

  @Post("receive")
  @UseInterceptors(inventoryUploadInterceptor)
  async receive(
    @Body() dto: ReceiveInventoryDto,
    @UploadedFiles() files: { files?: Express.Multer.File[] },
    @Req() req: any,
  ) {
    if (!dto.itemTypeId) {
      throw validationError("itemTypeId is required", { itemTypeId: "Required" });
    }
    
    const userId = req?.user?.id;
    if (!userId) {
      throw new UnauthorizedException("Missing user");
    }

    // Get itemtype from request body or default to INVENTORY
    const itemtype = dto.itemtype || getModeFromRequest(req) || "INVENTORY";
    
    const result = await this.inventoryService.receive(
      dto,
      files?.files || [],
      userId,
      itemtype, // Pass itemtype parameter
    );
    return result;
  }

  @Post("issue")
  @UseInterceptors(inventoryUploadInterceptor)
  async issue(
    @Body() dto: IssueInventoryDto,
    @UploadedFiles() files: { files?: Express.Multer.File[] },
    @Req() req: any,
  ) {
    const userId = req?.user?.id;
    if (!userId) {
      throw new UnauthorizedException("Missing user");
    }

    // Get itemtype from request body or default to INVENTORY
    const itemtype = dto.itemtype || getModeFromRequest(req) || "INVENTORY";
    
    const result = await this.inventoryService.issue(
      dto,
      files?.files || [],
      userId,
      itemtype, // Changed from mode to itemtype
    );
    return result;
  }
}
