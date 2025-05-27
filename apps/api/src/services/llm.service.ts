import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "langchain/prompts";
import { GitHubCommit } from "./github.service";

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
  ): Promise<string> {
    if (commits.length === 0) {
      return `# Git Commit Report (${timeframe})\n\nNo commits found for this period.`;
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

Please generate a well-structured Markdown report with appropriate headings and bullet points.`,
      inputVariables: ["timeframe", "commitMessages"],
    });

    try {
      const prompt = await promptTemplate.format({
        timeframe,
        commitMessages,
      });

      const response = await this.llm.invoke(prompt);
      return response.content as string;
    } catch (error) {
      console.error("Error generating commit summary:", error);
      return `# Git Commit Report (${timeframe})\n\n## Error\n\nFailed to generate AI summary. Raw commits:\n\n${commitMessages}`;
    }
  }
}
