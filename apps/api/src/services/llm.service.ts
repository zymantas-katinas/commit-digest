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
      maxRetries: 2,
      timeout: 30000,
    });
  }

  async generateCommitSummary(
    commits: GitHubCommit[],
    timeframe: string,
  ): Promise<LLMSummaryResult> {
    if (commits.length === 0) {
      return {
        summary: `No commits found for this period.`,
        tokensUsed: 0,
        costUsd: 0,
        model: "gpt-4o-mini",
      };
    }

    // Limit commits to prevent excessive token usage and memory consumption
    const maxCommits = 100;
    const limitedCommits = commits.slice(0, maxCommits);
    if (commits.length > maxCommits) {
      console.warn(
        `Limited commits from ${commits.length} to ${maxCommits} for memory management`,
      );
    }

    const commitMessages = limitedCommits
      .map((commit) => {
        const author = commit.author?.login || commit.commit.author.name;
        const date = new Date(commit.commit.author.date).toLocaleDateString();
        return `- ${commit.commit.message} (by ${author} on ${date})`;
      })
      .join("\n");

    const promptTemplate = new PromptTemplate({
      template: `You are an expert at summarizing Git commit histories for team reports.

Given the following commit messages, create a clean, natural summary in **markdown format**.

IMPORTANT RULES:
- Do NOT include dates, repository info, or commit counts (this is already provided separately)
- Do NOT create empty sections like "Bug Fixes: None" 
- Only mention what actually happened
- Use markdown headers (##) and bullet points (-) for structure
- Keep it concise and focused
- If there's only one trivial change, just describe it simply without headers

Commit Messages:
{commitMessages}

Generate a brief, natural markdown summary. Examples of good summaries:

For multiple changes:
## 🚀 New Features
- Added user authentication system
- Redesigned dashboard layout

## 🐛 Bug Fixes
- Fixed login redirect issue
- Resolved mobile layout problems

For single change: "Added user authentication system."

For trivial changes: "Empty commit for testing purposes."

Write ONLY the summary content in markdown - no meta-commentary.`,
      inputVariables: ["commitMessages"],
    });

    try {
      const prompt = await promptTemplate.format({
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
        summary: `Failed to generate AI summary. Raw commits:\n\n${commitMessages}`,
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
