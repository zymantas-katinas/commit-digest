import { Injectable } from "@nestjs/common";

export interface HealthStatus {
  status: "operational" | "degraded" | "down";
  timestamp: string;
  services: {
    database: "operational" | "degraded" | "down";
    api: "operational" | "degraded" | "down";
    scheduler: "operational" | "degraded" | "down";
  };
  uptime: number;
}

@Injectable()
export class HealthService {
  private startTime = Date.now();

  async getHealthStatus(): Promise<HealthStatus> {
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
      // Add your scheduler health check logic here
      // For now, we'll assume it's operational
      return "operational";
    } catch (error) {
      console.error("Scheduler health check failed:", error);
      return "down";
    }
  }
}
