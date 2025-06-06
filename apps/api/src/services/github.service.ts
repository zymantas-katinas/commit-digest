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

@Injectable()
export class GitHubService {
  constructor(private configService: ConfigService) {}

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
}
