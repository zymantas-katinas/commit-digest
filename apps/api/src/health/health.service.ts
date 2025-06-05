import { Injectable } from "@nestjs/common";
import { SchedulerService } from "../services/scheduler.service";

export interface HealthStatus {
  status: "operational" | "degraded" | "down";
  timestamp: string;
  services: {
    database: "operational" | "degraded" | "down";
    api: "operational" | "degraded" | "down";
    scheduler: "operational" | "degraded" | "down";
  };
  uptime: number;
  schedulerStats?: any;
}

@Injectable()
export class HealthService {
  private startTime = Date.now();

  constructor(private schedulerService: SchedulerService) {}

  async getHealthStatus(): Promise<HealthStatus> {
    const schedulerStats = this.schedulerService.getSchedulerStats();

    const services = {
      database: await this.checkDatabase(),
      api: "operational" as const,
      scheduler: await this.checkScheduler(),
    };

    // Determine overall status
    const hasDown = Object.values(services).includes("down");
    const hasDegraded = Object.values(services).includes("degraded");

    let overallStatus: "operational" | "degraded" | "down";
    if (hasDown) {
      overallStatus = "down";
    } else if (hasDegraded) {
      overallStatus = "degraded";
    } else {
      overallStatus = "operational";
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services,
      uptime: Date.now() - this.startTime,
      schedulerStats,
    };
  }

  private async checkDatabase(): Promise<"operational" | "degraded" | "down"> {
    try {
      // Add your database health check logic here
      // For now, we'll assume it's operational
      return "operational";
    } catch (error) {
      console.error("Database health check failed:", error);
      return "down";
    }
  }

  private async checkScheduler(): Promise<"operational" | "degraded" | "down"> {
    try {
      const stats = this.schedulerService.getSchedulerStats();

      // If scheduler has never run, it might be down
      if (!stats.lastRunTime) {
        return "down";
      }

      // If last run was more than 2 hours ago, consider it down
      const timeSinceLastRun = Date.now() - stats.lastRunTime.getTime();
      if (timeSinceLastRun > 2 * 60 * 60 * 1000) {
        return "down";
      }

      // If more than 50% of recent runs failed, consider degraded
      const totalRuns = stats.successfulRuns + stats.failedRuns;
      if (totalRuns > 0 && stats.failedRuns / totalRuns > 0.5) {
        return "degraded";
      }

      return "operational";
    } catch (error) {
      console.error("Scheduler health check failed:", error);
      return "down";
    }
  }
}
