import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
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
  async fetchCommits(
    githubUrl: string,
    branch: string,
    pat: string,
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

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `token ${pat}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Git-Report-AI",
        },
        params,
      });

      return response.data;
    } catch (error) {
      console.log({
        error,
      });
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new HttpException(
            "Invalid GitHub token",
            HttpStatus.UNAUTHORIZED,
          );
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
