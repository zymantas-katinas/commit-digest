import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  async sendWebhook(
    webhookUrl: string,
    reportContent: string,
    metadata?: {
      repository?: string;
      branch?: string;
      commitsCount?: number;
      dateRange?: { since: string; until: string };
      isTest?: boolean;
    },
  ): Promise<boolean> {
    const maxRetries = 2;
    let attempt = 0;

    const payload = {
      content: reportContent,
      timestamp: new Date().toISOString(),
      ...metadata,
    };

    while (attempt <= maxRetries) {
      try {
        await axios.post(webhookUrl, payload, {
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Git-Report-AI/1.0.0",
          },
          timeout: 10000, // 10 seconds timeout
        });

        this.logger.log(`Webhook sent successfully to ${webhookUrl}`);
        return true;
      } catch (error) {
        attempt++;
        this.logger.error(
          `Webhook attempt ${attempt} failed for ${webhookUrl}:`,
          error.message,
        );

        if (attempt <= maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000),
          );
        }
      }
    }

    this.logger.error(`All webhook attempts failed for ${webhookUrl}`);
    return false;
  }
}
