import { Controller, Get, Post } from "@nestjs/common";
import { HealthService } from "./health.service";
import { SchedulerService } from "../services/scheduler.service";

@Controller("health")
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    private readonly schedulerService: SchedulerService,
  ) {}

  @Get()
  async getHealth() {
    return this.healthService.getHealthStatus();
  }

  @Get("keepalive")
  async keepalive() {
    return {
      status: "awake",
      timestamp: new Date().toISOString(),
      message: "Function is awake and ready",
    };
  }

  @Post("trigger-scheduler")
  async triggerScheduler() {
    const result = await this.schedulerService.triggerManualRun();
    return {
      ...result,
      timestamp: new Date().toISOString(),
    };
  }
}
