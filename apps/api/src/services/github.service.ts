import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

export interface GitHubCommit {
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
}

export interface CommitDiff {
  sha: string;
  diff: string;
}

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
  };
}

export interface BranchesResponse {
  branches: GitHubBranch[];
  hasMore: boolean;
  totalCount?: number;
}

@Injectable()
export class GitHubService {
  constructor(private configService: ConfigService) {}

  async fetchBranches(
    githubUrl: string,
    pat?: string,
    options?: {
      search?: string;
      page?: number;
      perPage?: number;
    },
  ): Promise<BranchesResponse> {
    try {
      // Extract owner and repo from GitHub URL
      const urlParts = githubUrl.replace("https://github.com/", "").split("/");
      if (urlParts.length < 2) {
        throw new Error("Invalid GitHub URL format");
      }

      const owner = urlParts[0];
      const repo = urlParts[1].replace(".git", "");

      const page = options?.page || 1;
      const perPage = Math.min(options?.perPage || 30, 100); // GitHub API max is 100

      let branches: GitHubBranch[] = [];
      let hasMore = false;
      let totalCount: number | undefined;

      const headers: any = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "CommitDigest",
      };

      // Use provided PAT or fallback to app's default GitHub token
      const token =
        pat && pat.trim()
          ? pat
          : this.configService.get<string>("GITHUB_TOKEN");

      if (token) {
        headers.Authorization = `token ${token}`;
      }

      if (options?.search) {
        // Use search API for filtering branches
        const searchQuery = `${options.search} repo:${owner}/${repo}`;
        const searchUrl = `https://api.github.com/search/repositories`;

        // First, search for branches using the search API (limited functionality)
        // Since GitHub doesn't have a direct branch search API, we'll fetch all branches
        // and filter them server-side for better performance than client-side filtering
        const allBranchesUrl = `https://api.github.com/repos/${owner}/${repo}/branches`;

        let allBranches: GitHubBranch[] = [];
        let currentPage = 1;
        let fetchMore = true;

        // Fetch all branches first (for search filtering)
        while (fetchMore && currentPage <= 10) {
          // Limit to prevent infinite loops
          const response = await axios.get(allBranchesUrl, {
            headers,
            params: {
              per_page: 100,
              page: currentPage,
            },
          });

          const pageBranches = response.data;
          allBranches = allBranches.concat(pageBranches);

          fetchMore = pageBranches.length === 100;
          currentPage++;
        }

        // Filter branches by search term
        const filteredBranches = allBranches.filter((branch) =>
          branch.name.toLowerCase().includes(options.search!.toLowerCase()),
        );

        totalCount = filteredBranches.length;

        // Apply pagination to filtered results
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        branches = filteredBranches.slice(startIndex, endIndex);
        hasMore = endIndex < filteredBranches.length;
      } else {
        // Regular pagination without search
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/branches`;

        const response = await axios.get(apiUrl, {
          headers,
          params: {
            per_page: perPage,
            page: page,
          },
        });

        branches = response.data;

        // Check if there are more pages
        // GitHub API includes Link header for pagination info
        const linkHeader = response.headers.link;
        hasMore = linkHeader
          ? linkHeader.includes('rel="next"')
          : branches.length === perPage;
      }

      return {
        branches,
        hasMore,
        totalCount,
      };
    } catch (error) {
      console.log({
        error,
      });
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          if (pat && pat.trim()) {
            throw new HttpException(
              "Invalid GitHub token",
              HttpStatus.UNAUTHORIZED,
            );
          } else {
            throw new HttpException(
              "This repository is private and requires a Personal Access Token",
              HttpStatus.UNAUTHORIZED,
            );
          }
        }
        if (error.response?.status === 403) {
          // Handle rate limiting
          const resetTime = error.response?.headers["x-ratelimit-reset"];
          let message = "GitHub API rate limit exceeded";

          if (resetTime) {
            const resetDate = new Date(parseInt(resetTime) * 1000);
            message += `. Rate limit resets at ${resetDate.toISOString()}`;
          }

          if (!pat || !pat.trim()) {
            message +=
              ". Consider adding a Personal Access Token to increase rate limits.";
          }

          throw new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
        }
        if (error.response?.status === 404) {
          throw new HttpException("Repository not found", HttpStatus.NOT_FOUND);
        }
      }
      throw new HttpException(
        "Failed to fetch branches from GitHub",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async fetchCommits(
    githubUrl: string,
    branch: string,
    pat?: string,
    since?: Date,
  ): Promise<GitHubCommit[]> {
    try {
      // Extract owner and repo from GitHub URL
      const urlParts = githubUrl.replace("https://github.com/", "").split("/");
      if (urlParts.length < 2) {
        throw new Error("Invalid GitHub URL format");
      }

      const owner = urlParts[0];
      const repo = urlParts[1].replace(".git", "");

      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits`;
      const params: any = {
        sha: branch,
        per_page: 100,
      };

      if (since) {
        params.since = since.toISOString();
      }

      const headers: any = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "CommitDigest",
      };

      // Use provided PAT or fallback to app's default GitHub token
      const token =
        pat && pat.trim()
          ? pat
          : this.configService.get<string>("GITHUB_TOKEN");

      if (token) {
        headers.Authorization = `token ${token}`;
      }

      const response = await axios.get(apiUrl, {
        headers,
        params,
      });

      return response.data;
    } catch (error) {
      console.log({
        error,
      });
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          if (pat && pat.trim()) {
            throw new HttpException(
              "Invalid GitHub token",
              HttpStatus.UNAUTHORIZED,
            );
          } else {
            throw new HttpException(
              "This repository is private and requires a Personal Access Token",
              HttpStatus.UNAUTHORIZED,
            );
          }
        }
        if (error.response?.status === 403) {
          // Handle rate limiting
          const resetTime = error.response?.headers["x-ratelimit-reset"];
          let message = "GitHub API rate limit exceeded";

          if (resetTime) {
            const resetDate = new Date(parseInt(resetTime) * 1000);
            message += `. Rate limit resets at ${resetDate.toISOString()}`;
          }

          if (!pat || !pat.trim()) {
            message +=
              ". Consider adding a Personal Access Token to increase rate limits.";
          }

          throw new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
        }
        if (error.response?.status === 404) {
          throw new HttpException("Repository not found", HttpStatus.NOT_FOUND);
        }
      }
      throw new HttpException(
        "Failed to fetch commits from GitHub",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async fetchCommitDiff(
    githubUrl: string,
    sha: string,
    pat?: string,
  ): Promise<string> {
    try {
      // Extract owner and repo from GitHub URL
      const urlParts = githubUrl.replace("https://github.com/", "").split("/");
      if (urlParts.length < 2) {
        throw new Error("Invalid GitHub URL format");
      }

      const owner = urlParts[0];
      const repo = urlParts[1].replace(".git", "");

      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`;
      
      const headers: any = {
        Accept: "application/vnd.github.v3.diff",
        "User-Agent": "CommitDigest",
      };

      // Use provided PAT or fallback to app's default GitHub token
      const token =
        pat && pat.trim()
          ? pat
          : this.configService.get<string>("GITHUB_TOKEN");

      if (token) {
        headers.Authorization = `token ${token}`;
      }

      // Fetch the diff directly
      const diffResponse = await axios.get(apiUrl, {
        headers,
      });

      return diffResponse.data;
    } catch (error) {
      console.log({
        error,
      });
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          if (pat && pat.trim()) {
            throw new HttpException(
              "Invalid GitHub token",
              HttpStatus.UNAUTHORIZED,
            );
          } else {
            throw new HttpException(
              "This repository is private and requires a Personal Access Token",
              HttpStatus.UNAUTHORIZED,
            );
          }
        }
        if (error.response?.status === 403) {
          const resetTime = error.response?.headers["x-ratelimit-reset"];
          let message = "GitHub API rate limit exceeded";

          if (resetTime) {
            const resetDate = new Date(parseInt(resetTime) * 1000);
            message += `. Rate limit resets at ${resetDate.toISOString()}`;
          }

          if (!pat || !pat.trim()) {
            message +=
              ". Consider adding a Personal Access Token to increase rate limits.";
          }

          throw new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
        }
        if (error.response?.status === 404) {
          throw new HttpException("Commit not found", HttpStatus.NOT_FOUND);
        }
      }
      throw new HttpException(
        "Failed to fetch commit diff from GitHub",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
