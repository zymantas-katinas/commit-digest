import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "langchain/prompts";
import { GitCommit } from "./git.service";

export const MODEL_NAME = "gpt-4.1-mini";

// pricing is per million tokens
const MODEL_PRICING = {
  "gpt-4.1-mini": {
    input: 0.4,
    output: 1.6,
  },
};

export interface LLMSummaryResult {
  summary: string;
  tokensUsed: number;
  costUsd: number;
  model: string;
}

export interface ReportConfigSettings {
  reportStyle: string; // 'Summary', 'Standard', 'Changelog'
  toneOfVoice: string; // 'Professional', 'Informative', 'Friendly & Casual'
  authorDisplay: boolean; // true = show author names, false = hide
  linkToCommits: boolean; // true = include commit links, false = don't include
  includeDiffs?: boolean; // true = include code diffs, false = don't include
  repositoryUrl?: string; // GitHub repository URL for constructing commit links
}

@Injectable()
export class LLMService {
  private llm: ChatOpenAI;

  constructor(private configService: ConfigService) {
    this.llm = new ChatOpenAI({
      openAIApiKey: this.configService.get("OPENAI_API_KEY"),
      modelName: MODEL_NAME,
      temperature: 0.3,
      maxRetries: 2,
      timeout: 30000,
    });
  }

  async generateCommitSummary(
    commits: GitCommit[],
    timeframe: string,
    config?: ReportConfigSettings,
  ): Promise<LLMSummaryResult> {
    if (commits.length === 0) {
      return {
        summary: `No commits found for this period.`,
        tokensUsed: 0,
        costUsd: 0,
        model: MODEL_NAME,
      };
    }

    // Default configuration if not provided
    const settings: ReportConfigSettings = {
      reportStyle: config?.reportStyle || "Standard",
      toneOfVoice: config?.toneOfVoice || "Informative",
      // For Summary style, force these to false since they're not applicable
      authorDisplay:
        config?.reportStyle === "Summary"
          ? false
          : (config?.authorDisplay ?? true),
      linkToCommits:
        config?.reportStyle === "Summary"
          ? false
          : (config?.linkToCommits ?? false),
      includeDiffs: config?.includeDiffs ?? false,
      repositoryUrl: config?.repositoryUrl,
    };

    // Limit commits based on report style and webhook constraints
    let maxCommits = 100;

    // Adjust limits based on report style
    if (settings.reportStyle === "Summary") {
      maxCommits = Math.min(maxCommits, 50); // Summary can work with more commits since it condenses them
    } else if (settings.reportStyle === "Changelog") {
      maxCommits = Math.min(maxCommits, 25); // Changelog shows all commits, so be more conservative
    } else {
      maxCommits = Math.min(maxCommits, 35); // Standard is in between
    }

    // If links are enabled, be even more conservative to avoid webhook size limits
    if (settings.linkToCommits) {
      maxCommits = Math.min(maxCommits, 15);
    }

    // If diffs are enabled, be very conservative due to large token usage
    if (settings.includeDiffs) {
      maxCommits = Math.min(maxCommits, 10);
    }

    const limitedCommits = commits.slice(0, maxCommits);
    if (commits.length > maxCommits) {
      const reason = settings.includeDiffs
        ? "(reduced due to diff inclusion)"
        : settings.linkToCommits
          ? "(reduced due to link inclusion)"
          : `(${settings.reportStyle} style limit)`;
      console.warn(
        `Limited commits from ${commits.length} to ${maxCommits} ${reason}`,
      );
    }

    const commitMessages = limitedCommits
      .map((commit) => {
        const author = commit.author?.login || commit.commit.author.name;
        const date = new Date(commit.commit.author.date).toLocaleDateString();
        const sha = commit.sha.substring(0, 7);

        // Build commit line based on configuration
        let commitLine = `- ${commit.commit.message}`;

        if (settings.authorDisplay) {
          commitLine += ` (by ${author} on ${date})`;
        }

        if (settings.linkToCommits && settings.repositoryUrl) {
          // Construct GitHub commit URL
          const commitUrl = this.buildCommitUrl(
            settings.repositoryUrl,
            commit.sha,
          );
          commitLine += ` [${sha}](${commitUrl})`;
        }

        // Add diff if enabled and available
        if (settings.includeDiffs) {
          if (commit.diff) {
            // Truncate very long diffs to avoid token limits
            const maxDiffLength = 2000;
            const truncatedDiff =
              commit.diff.length > maxDiffLength
                ? commit.diff.substring(0, maxDiffLength) +
                  "\n... (diff truncated)"
                : commit.diff;
            commitLine += `\n\n\`\`\`diff\n${truncatedDiff}\n\`\`\``;
          } else {
            // Log warning if diff was requested but not available
            console.warn(
              `Diff requested for commit ${commit.sha} but diff not available`,
            );
          }
        }

        return commitLine;
      })
      .join("\n\n");

    // Build prompt based on configuration settings
    const styleInstructions = this.getStyleInstructions(settings.reportStyle);
    const toneInstructions = this.getToneInstructions(settings.toneOfVoice);
    const formatInstructions = this.getFormatInstructions(settings);

    const promptTemplate = new PromptTemplate({
      template: `You are an expert at creating Git commit reports for development teams.

${toneInstructions}

Given the following commit messages${settings.includeDiffs ? " and code diffs" : ""}, create a report in **markdown format**.

${styleInstructions}

${formatInstructions}

IMPORTANT RULES:
- Do NOT include a main title/heading (like "# Git Report" or "# Commit Report") - start directly with content
- Do NOT include dates, repository info, or commit counts in headers (this is already provided separately)
- Do NOT create empty sections like "Bug Fixes: None"
- If there's only one trivial change, just show it simply without headers
- Use ## for section headers only when needed for organization
- Adapt your approach based on the style requirements above
${settings.includeDiffs ? "- When diffs are included, analyze the actual code changes, not just commit messages\n- Focus on what changed in the code and the impact of those changes" : ""}

Commit Messages${settings.includeDiffs ? " and Diffs" : ""}:
{commitMessages}

Write ONLY the report content in markdown - no meta-commentary, no main title.`,
      inputVariables: ["commitMessages"],
    });

    try {
      const prompt = await promptTemplate.format({
        commitMessages,
      });

      // Log if diffs are included for debugging
      if (settings.includeDiffs) {
        const commitsWithDiffs = limitedCommits.filter((c) => c.diff);
        console.log(
          `[LLM] Generating report with ${commitsWithDiffs.length}/${limitedCommits.length} commits having diffs`,
        );
      }

      const response = await this.llm.invoke(prompt);

      // Calculate approximate token usage and cost
      const inputTokens = this.estimateTokens(prompt);
      const outputTokens = this.estimateTokens(response.content as string);
      const totalTokens = inputTokens + outputTokens;

      const inputCost =
        (inputTokens / 1000000) * MODEL_PRICING[MODEL_NAME].input;
      const outputCost =
        (outputTokens / 1000000) * MODEL_PRICING[MODEL_NAME].output;
      const totalCost = inputCost + outputCost;

      return {
        summary: response.content as string,
        tokensUsed: totalTokens,
        costUsd: totalCost,
        model: MODEL_NAME,
      };
    } catch (error) {
      console.error("Error generating commit summary:", error);
      return {
        summary: `Failed to generate AI summary. Raw commits:\n\n${commitMessages}`,
        tokensUsed: 0,
        costUsd: 0,
        model: MODEL_NAME,
      };
    }
  }

  private getStyleInstructions(reportStyle: string): string {
    switch (reportStyle) {
      case "Summary":
        return `STYLE: Create a brief, factual summary of what was accomplished. 
- Focus on CONCRETE CHANGES made, not individual commits
- Group related changes into 2-4 main areas
- Use simple, direct language - avoid flowery or speculative wording
- Stick to what actually happened based on the commit messages
- Be concise - 1 sentence per area maximum
- Don't embellish or assume impact beyond what's evident in the commits
- Do NOT mention individual commit SHAs, author names, or dates (Summary style excludes these details)`;

      case "Changelog":
        return `STYLE: Create a detailed changelog format listing all individual commits. 
- Group commits by type (Added, Changed, Fixed, Removed, etc.)
- List each commit as a separate bullet point under its category
- Include the actual commit messages
- Use clear category headers (## Added, ## Fixed, etc.)
- This should be comprehensive and detailed`;

      case "Standard":
      default:
        return `STYLE: Create a balanced report showing key commits with some organization.
- Group related commits together under logical sections
- Show important individual commits but summarize minor ones
- Use markdown headers (##) for major areas of work
- Balance detail with readability - more than Summary, less than Changelog`;
    }
  }

  private getToneInstructions(toneOfVoice: string): string {
    switch (toneOfVoice) {
      case "Professional":
        return `TONE: Write in a formal, business-appropriate tone. Use precise technical language. 
Avoid casual expressions, emojis, or colloquialisms. Focus on facts and outcomes.`;

      case "Friendly & Casual":
        return `TONE: Write in a warm, conversational tone. Feel free to use emojis, casual expressions, and friendly language. 
Make it engaging and approachable while still being informative.`;

      case "Informative":
      default:
        return `TONE: Write in a clear, straightforward tone. Balance professionalism with accessibility. 
Use simple, direct language that's easy to understand. Include relevant details without being overly technical.`;
    }
  }

  private getFormatInstructions(settings: ReportConfigSettings): string {
    let instructions = "";

    if (!settings.authorDisplay) {
      instructions +=
        "- Do NOT mention author names or dates (this information has been excluded from the commit data)\n";
    }

    if (!settings.linkToCommits) {
      instructions +=
        "- Do NOT include commit links or references to specific commits\n";
    } else {
      instructions +=
        "- Commit links are included in the data - you may reference them if relevant\n";
    }

    if (settings.includeDiffs) {
      instructions +=
        "- Code diffs are included - analyze the actual changes made in the code\n";
      instructions +=
        "- Focus on what changed technically and the implications of those changes\n";
    }

    return instructions;
  }

  /**
   * Build commit URL from repository URL and commit SHA
   */
  private buildCommitUrl(repositoryUrl: string, sha: string): string {
    try {
      const cleanUrl = repositoryUrl.replace(/\.git$/, "");

      if (cleanUrl.includes("github.com")) {
        const match = cleanUrl.match(/github\.com\/([^\/]+\/[^\/]+)/);
        if (match) {
          const ownerRepo = match[1];
          return `https://github.com/${ownerRepo}/commit/${sha}`;
        }
      } else if (cleanUrl.includes("gitlab.com")) {
        const url = new URL(cleanUrl);
        const path = url.pathname.replace(/^\/|\/$/g, "");
        return `https://gitlab.com/${path}/-/commit/${sha}`;
      }

      return `${cleanUrl}/commit/${sha}`;
    } catch {
      return `${repositoryUrl}/commit/${sha}`;
    }
  }

  /**
   * Estimate token count for a given text
   * This is a rough approximation: 1 token ≈ 4 characters for English text
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
