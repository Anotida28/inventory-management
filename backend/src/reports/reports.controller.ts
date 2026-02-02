import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { ReportFiltersDto } from "./dto/report-filters.dto";
import { getModeFromRequest } from "../common/utils/mode";
import { UsernameGuard } from "../common/guards/username.guard";

@Controller("reports")
@UseGuards(UsernameGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("dashboard")
  async getDashboard(@Query() filters: ReportFiltersDto, @Req() req: any) {
    const mode = getModeFromRequest(req);
    return this.reportsService.getDashboard(filters, mode);
  }

  @Get("stock-balance")
  async getStockBalance(@Query() filters: ReportFiltersDto, @Req() req: any) {
    const mode = getModeFromRequest(req);
    return this.reportsService.getStockBalance(filters, mode);
  }

  @Get("issues")
  async getIssues(@Query() filters: ReportFiltersDto, @Req() req: any) {
    const mode = getModeFromRequest(req);
    return this.reportsService.getIssues(filters, mode);
  }

  @Get("receipts")
  async getReceipts(@Query() filters: ReportFiltersDto, @Req() req: any) {
    const mode = getModeFromRequest(req);
    return this.reportsService.getReceipts(filters, mode);
  }

  @Get("user-activity")
  async getUserActivity(@Query() filters: ReportFiltersDto, @Req() req: any) {
    const mode = getModeFromRequest(req);
    return this.reportsService.getUserActivity(filters, mode);
  }
}
