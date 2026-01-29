import { Controller, Get, Query, Req } from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { ReportFiltersDto } from "./dto/report-filters.dto";
import { getModeFromRequest } from "../common/utils/mode";

@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("dashboard")
  async getDashboard(@Query() filters: ReportFiltersDto, @Req() req: any) {
    const mode = getModeFromRequest(req);
    return this.reportsService.getDashboard(filters, mode);
  }

  @Get("stock-balance")
  async getStockBalance(@Query() filters: ReportFiltersDto) {
    return this.reportsService.getStockBalance(filters);
  }

  @Get("issues")
  async getIssues(@Query() filters: ReportFiltersDto) {
    return this.reportsService.getIssues(filters);
  }

  @Get("receipts")
  async getReceipts(@Query() filters: ReportFiltersDto) {
    return this.reportsService.getReceipts(filters);
  }

  @Get("user-activity")
  async getUserActivity(@Query() filters: ReportFiltersDto) {
    return this.reportsService.getUserActivity(filters);
  }
}
