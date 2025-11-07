import { Injectable } from "@nestjs/common";
import { GitHubService, GitHubCommit, GitHubBranch } from "./github.service";
import { GitLabService, GitLabCommit, GitLabBranch } from "./gitlab.service";
import { BranchesResponse } from "./github.service";

export type GitProvider = "github" | "gitlab";

export interface GitCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  author: {
    login: string;
  } | null;
  diff?: string; // Optional diff content
  committed_date?: string; // Optional committed date (for GitLab commits)
}

export interface GitBranch {
  name: string;
  commit: {
    sha: string;
  };
}

@Injectable()
export class GitService {
  constructor(
    private githubService: GitHubService,
    private gitlabService: GitLabService,
  ) {}

  private detectProvider(url: string): GitProvider {
    if (url.includes("github.com")) {
      return "github";
    } else if (url.includes("gitlab.com")) {
      return "gitlab";
    }
    throw new Error(
      "Unsupported Git provider. Only GitHub and GitLab are supported.",
    );
  }

  private normalizeGitLabCommit(gitlabCommit: GitLabCommit): GitCommit {
    try {
      const normalized = {
        sha: gitlabCommit.id,
        commit: {
          message: gitlabCommit.message,
          author: {
            name: gitlabCommit.author_name,
            email: gitlabCommit.author_email,
            date: gitlabCommit.authored_date,
          },
        },
        author: {
          login: gitlabCommit.author_name,
        },
        committed_date: gitlabCommit.committed_date, // Include committed_date for GitLab commits
      };
      return normalized;
    } catch (error) {
      console.error("Error normalizing GitLab commit:", error, gitlabCommit);
      throw error;
    }
  }

  private normalizeGitLabBranch(gitlabBranch: GitLabBranch): GitBranch {
    return {
      name: gitlabBranch.name,
      commit: {
        sha: gitlabBranch.commit.id,
      },
    };
  }

  async fetchBranches(
    repositoryUrl: string,
    provider: GitProvider,
    pat?: string,
    options?: {
      search?: string;
      page?: number;
      perPage?: number;
    },
  ): Promise<BranchesResponse> {
    if (provider === "github") {
      const result = await this.githubService.fetchBranches(
        repositoryUrl,
        pat,
        options,
      );
      return result;
    } else if (provider === "gitlab") {
      const result = await this.gitlabService.fetchBranches(
        repositoryUrl,
        pat,
        options,
      );
      return {
        branches: result.branches.map((b) => this.normalizeGitLabBranch(b)),
        hasMore: result.hasMore,
        totalCount: result.totalCount,
      };
    }
    throw new Error(`Unsupported provider: ${provider}`);
  }

  async fetchCommits(
    repositoryUrl: string,
    provider: GitProvider,
    branch: string,
    pat?: string,
    since?: Date,
  ): Promise<GitCommit[]> {
    if (provider === "github") {
      return await this.githubService.fetchCommits(
        repositoryUrl,
        branch,
        pat,
        since,
      );
    } else if (provider === "gitlab") {
      const commits = await this.gitlabService.fetchCommits(
        repositoryUrl,
        branch,
        pat,
        since,
      );
      const normalized = commits.map((c) => this.normalizeGitLabCommit(c));
      return normalized;
    }
    throw new Error(`Unsupported provider: ${provider}`);
  }

  detectProviderFromUrl(url: string): GitProvider {
    return this.detectProvider(url);
  }

  async fetchCommitDiff(
    repositoryUrl: string,
    provider: GitProvider,
    sha: string,
    pat?: string,
  ): Promise<string> {
    if (provider === "github") {
      return await this.githubService.fetchCommitDiff(repositoryUrl, sha, pat);
    } else if (provider === "gitlab") {
      return await this.gitlabService.fetchCommitDiff(repositoryUrl, sha, pat);
    }
    throw new Error(`Unsupported provider: ${provider}`);
  }
}
