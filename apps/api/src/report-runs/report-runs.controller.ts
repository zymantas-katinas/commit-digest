import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from "@nestjs/common";
import { SupabaseAuthGuard } from "../guards/supabase-auth.guard";
import { ReportRunsService } from "../services/report-runs.service";

@Controller("report-runs")
@UseGuards(SupabaseAuthGuard)
export class ReportRunsController {
  constructor(private readonly reportRunsService: ReportRunsService) {}

  @Get()
  async getReportRuns(
    @Request() req,
    @Query("limit", new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query("offset", new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    const userId = req.user.id;
    return this.reportRunsService.getReportRunsByUserId(userId, limit, offset);
  }

  @Get("usage")
  async getUsageStats(@Request() req) {
    const userId = req.user.id;
    const monthlyUsage = await this.reportRunsService.getMonthlyUsage(userId);
    const canRun = await this.reportRunsService.checkUsageLimit(userId);

    return {
      monthlyUsage: monthlyUsage || {
        user_id: userId,
        month: new Date().toISOString().slice(0, 7) + "-01",
        total_runs: 0,
        successful_runs: 0,
        failed_runs: 0,
        total_tokens: 0,
        total_cost_usd: 0,
        last_run_at: null,
      },
      canRunMore: canRun,
      monthlyLimit: 50,
    };
  }

  @Get(":id")
  async getReportRun(@Request() req, @Param("id") id: string) {
    const userId = req.user.id;
    return this.reportRunsService.getReportRunById(id, userId);
  }
}
