import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "langchain/prompts";
import { GitHubCommit } from "./github.service";

export interface LLMSummaryResult {
  summary: string;
  tokensUsed: number;
  costUsd: number;
  model: string;
}

@Injectable()
export class LLMService {
  private llm: ChatOpenAI;

  constructor(private configService: ConfigService) {
    this.llm = new ChatOpenAI({
      openAIApiKey: this.configService.get("OPENAI_API_KEY"),
      modelName: "gpt-4o-mini",
      temperature: 0.3,
    });
  }

  async generateCommitSummary(
    commits: GitHubCommit[],
    timeframe: string,
  ): Promise<LLMSummaryResult> {
    if (commits.length === 0) {
      return {
        summary: `# Git Commit Report (${timeframe})\n\nNo commits found for this period.`,
        tokensUsed: 0,
        costUsd: 0,
        model: "gpt-4o-mini",
      };
    }

    const commitMessages = commits
      .map((commit) => {
        const author = commit.author?.login || commit.commit.author.name;
        const date = new Date(commit.commit.author.date).toLocaleDateString();
        return `- ${commit.commit.message} (by ${author} on ${date})`;
      })
      .join("\n");

    const promptTemplate = new PromptTemplate({
      template: `You are an expert at summarizing Git commit histories.
Given the following list of commit messages from the past {timeframe}, please generate a concise, human-readable report in Markdown format.
Focus on highlighting:
1. New features or significant additions.
2. Important bug fixes.
3. Any breaking changes (if discernible).
Keep the summary clear and easy for a project manager or team lead to understand.

Commit Messages:
---
{commitMessages}
---

Please generate a well-structured Markdown report with appropriate headings and bullet points. Return ONLY the report content - do not include any meta-commentary, explanations about the summary, or concluding statements about the report itself.`,
      inputVariables: ["timeframe", "commitMessages"],
    });

    try {
      const prompt = await promptTemplate.format({
        timeframe,
        commitMessages,
      });

      const response = await this.llm.invoke(prompt);

      // Calculate approximate token usage and cost
      // Note: This is an approximation. For exact usage, you'd need to use the OpenAI API directly
      // or access the usage information from the response if available
      const inputTokens = this.estimateTokens(prompt);
      const outputTokens = this.estimateTokens(response.content as string);
      const totalTokens = inputTokens + outputTokens;

      // GPT-4o-mini pricing (as of 2024): $0.00015 per 1K input tokens, $0.0006 per 1K output tokens
      const inputCost = (inputTokens / 1000) * 0.00015;
      const outputCost = (outputTokens / 1000) * 0.0006;
      const totalCost = inputCost + outputCost;

      return {
        summary: response.content as string,
        tokensUsed: totalTokens,
        costUsd: totalCost,
        model: "gpt-4o-mini",
      };
    } catch (error) {
      console.error("Error generating commit summary:", error);
      return {
        summary: `# Git Commit Report (${timeframe})\n\n## Error\n\nFailed to generate AI summary. Raw commits:\n\n${commitMessages}`,
        tokensUsed: 0,
        costUsd: 0,
        model: "gpt-4o-mini",
      };
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
