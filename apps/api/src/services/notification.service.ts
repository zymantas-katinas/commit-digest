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
    
    const provider = metadata?.provider || "github";
    const emoji = provider === "gitlab" ? ":gitlab:" : ":github:";

    const blocks: any[] = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${emoji} ${formattedContent}`,
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
      text: `${emoji} ${formattedContent}`, // Fallback for clients that don't support blocks
      blocks: blocks,
      timestamp: new Date().toISOString(),
      ...metadata,
    };
  }

  private createDiscordPayload(content: string, metadata?: any) {
    // Discord has a 2000 character limit
    let truncatedContent = content;

    if (content.length > 2000) {
      // Try smart truncation by reducing links first
      truncatedContent = this.smartTruncateForDiscord(content);

      // If still too long, do regular truncation
      if (truncatedContent.length > 2000) {
        truncatedContent =
          content.substring(0, 1950) +
          "\n\n*[Message truncated due to length]*";
      }

      this.logger.warn(
        `Discord message truncated from ${content.length} to ${truncatedContent.length} characters`,
      );
    }

    // Check for excessive links (Discord can be sensitive to too many links)
    const linkCount = (truncatedContent.match(/\[.*?\]\(.*?\)/g) || []).length;
    if (linkCount > 10) {
      this.logger.warn(
        `Discord message contains ${linkCount} links, which might cause delivery issues`,
      );
    }

    return {
      content: truncatedContent,
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

  /**
   * Smart truncation for Discord that tries to preserve message readability
   * by removing links progressively rather than cutting off mid-sentence
   */
  private smartTruncateForDiscord(content: string): string {
    if (content.length <= 2000) {
      return content;
    }

    // Split content into header and body
    const lines = content.split("\n");
    const headerLine = lines[0]; // The "Code Report" header line
    const bodyLines = lines.slice(1);
    const body = bodyLines.join("\n");

    // If header itself is too long, just return it truncated
    if (headerLine.length > 1900) {
      return headerLine.substring(0, 1900) + "...";
    }

    // Try removing links progressively
    let processedBody = body;
    const linkRegex = /\[([^\]]+)\]\([^)]+\)/g;

    // First, try replacing links with just the text (no URL)
    let linkCount = (processedBody.match(linkRegex) || []).length;
    if (linkCount > 0) {
      processedBody = processedBody.replace(linkRegex, "$1");

      const testContent = headerLine + "\n" + processedBody;
      if (testContent.length <= 2000) {
        this.logger.log(
          `Removed ${linkCount} commit links to fit Discord character limit`,
        );
        return testContent;
      }
    }

    // If still too long, try removing commit lines from the end
    const bodyLinesArray = processedBody.split("\n");
    let truncatedLines = [...bodyLinesArray];

    while (truncatedLines.length > 1) {
      // Remove lines from the end, but keep at least the first few lines
      const testContent =
        headerLine +
        "\n" +
        truncatedLines.join("\n") +
        "\n\n*[Report shortened for Discord]*";

      if (testContent.length <= 2000) {
        const removedLines = bodyLinesArray.length - truncatedLines.length;
        this.logger.log(
          `Removed ${removedLines} lines to fit Discord character limit`,
        );
        return testContent;
      }

      truncatedLines.pop();
    }

    // Last resort: just take the header and first part of body
    const maxBodyLength = 2000 - headerLine.length - 50; // Leave room for truncation message
    const truncatedBody = processedBody.substring(0, maxBodyLength);
    return (
      headerLine + "\n" + truncatedBody + "\n\n*[Report shortened for Discord]*"
    );
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
      provider?: string;
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
          {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            payloadLength: JSON.stringify(payload).length,
          },
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
