import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  private detectPlatform(webhookUrl: string): "slack" | "discord" | "generic" {
    if (webhookUrl.includes("hooks.slack.com")) {
      return "slack";
    }
    if (webhookUrl.includes("discord.com/api/webhooks")) {
      return "discord";
    }
    return "generic";
  }

  private formatContentForSlack(markdownContent: string): string {
    // Convert markdown to Slack's format
    return (
      markdownContent
        // Convert headers
        .replace(/^### (.*$)/gim, "*$1*")
        .replace(/^## (.*$)/gim, "*$1*")
        .replace(/^# (.*$)/gim, "*$1*")
        // Convert bold
        .replace(/\*\*(.*?)\*\*/g, "*$1*")
        // Convert code blocks to Slack format
        .replace(/```[\s\S]*?```/g, (match) => {
          const content = match.replace(/```/g, "").trim();
          return "```\n" + content + "\n```";
        })
        // Convert inline code
        .replace(/`([^`]+)`/g, "`$1`")
        // Convert bullet points
        .replace(/^- (.*$)/gim, "• $1")
        // Limit message length (Slack has limits)
        .substring(0, 4000)
    );
  }

  private createSlackPayload(content: string, metadata?: any): any {
    const formattedContent = this.formatContentForSlack(content);

    // Create Slack blocks format for better rendering
    const blocks: any[] = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: formattedContent,
        },
      },
    ];

    // Add metadata as context if available
    if (metadata?.repository || metadata?.branch || metadata?.commitsCount) {
      const contextElements: any[] = [];

      if (metadata.repository) {
        contextElements.push({
          type: "mrkdwn",
          text: `*Repository:* <${metadata.repository}|${metadata.repository.split("/").slice(-2).join("/")}>`,
        });
      }

      if (metadata.branch) {
        contextElements.push({
          type: "mrkdwn",
          text: `*Branch:* ${metadata.branch}`,
        });
      }

      if (metadata.commitsCount) {
        contextElements.push({
          type: "mrkdwn",
          text: `*Commits:* ${metadata.commitsCount}`,
        });
      }

      if (contextElements.length > 0) {
        blocks.push({
          type: "context",
          elements: contextElements,
        });
      }
    }

    return {
      text: formattedContent, // Fallback for clients that don't support blocks
      blocks: blocks,
      timestamp: new Date().toISOString(),
      ...metadata,
    };
  }

  private createDiscordPayload(content: string, metadata?: any) {
    return {
      content: content,
      timestamp: new Date().toISOString(),
      ...metadata,
    };
  }

  private createGenericPayload(content: string, metadata?: any) {
    return {
      content: content,
      timestamp: new Date().toISOString(),
      ...metadata,
    };
  }

  async sendWebhook(
    webhookUrl: string,
    reportContent: string,
    metadata?: {
      repository?: string;
      branch?: string;
      commitsCount?: number;
      dateRange?: { since: string; until: string };
      isTest?: boolean;
      isManual?: boolean;
    },
  ): Promise<boolean> {
    const maxRetries = 2;
    let attempt = 0;

    const platform = this.detectPlatform(webhookUrl);
    let payload: any;

    // Create platform-specific payload
    switch (platform) {
      case "slack":
        payload = this.createSlackPayload(reportContent, metadata);
        break;
      case "discord":
        payload = this.createDiscordPayload(reportContent, metadata);
        break;
      default:
        payload = this.createGenericPayload(reportContent, metadata);
        break;
    }

    while (attempt <= maxRetries) {
      try {
        await axios.post(webhookUrl, payload, {
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Git-Report-AI/1.0.0",
          },
          timeout: 10000, // 10 seconds timeout
        });

        this.logger.log(
          `Webhook sent successfully to ${webhookUrl} (platform: ${platform})`,
        );
        return true;
      } catch (error) {
        attempt++;
        this.logger.error(
          `Webhook attempt ${attempt} failed for ${webhookUrl} (platform: ${platform}):`,
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

    this.logger.error(
      `All webhook attempts failed for ${webhookUrl} (platform: ${platform})`,
    );
    return false;
  }
}
