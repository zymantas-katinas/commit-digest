import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

export interface GitLabCommit {
  id: string;
  message: string;
  author_name: string;
  author_email: string;
  authored_date: string;
  committer_name: string;
  committer_email: string;
  committed_date: string;
}

export interface GitLabBranch {
  name: string;
  commit: {
    id: string;
  };
}

export interface BranchesResponse {
  branches: GitLabBranch[];
  hasMore: boolean;
  totalCount?: number;
}

@Injectable()
export class GitLabService {
  constructor(private configService: ConfigService) {}

  private extractProjectPath(gitlabUrl: string): string {
    try {
      const url = new URL(gitlabUrl);
      const path = url.pathname.replace(/^\/|\/$/g, "").replace(/\.git$/, "");
      if (!path) {
        throw new Error("Invalid GitLab URL format");
      }
      return encodeURIComponent(path);
    } catch (error) {
      throw new Error("Invalid GitLab URL format");
    }
  }

  async fetchBranches(
    gitlabUrl: string,
    pat?: string,
    options?: {
      search?: string;
      page?: number;
      perPage?: number;
    },
  ): Promise<BranchesResponse> {
    try {
      const projectPath = this.extractProjectPath(gitlabUrl);
      const page = options?.page || 1;
      const perPage = Math.min(options?.perPage || 30, 100);

      let branches: GitLabBranch[] = [];
      let hasMore = false;
      let totalCount: number | undefined;

      const headers: any = {
        "User-Agent": "CommitDigest",
      };

      const token =
        pat && pat.trim()
          ? pat
          : this.configService.get<string>("GITLAB_TOKEN");

      if (token) {
        headers["PRIVATE-TOKEN"] = token;
      }

      if (options?.search) {
        const allBranchesUrl = `https://gitlab.com/api/v4/projects/${projectPath}/repository/branches`;

        let allBranches: GitLabBranch[] = [];
        let currentPage = 1;
        let fetchMore = true;

        while (fetchMore && currentPage <= 10) {
          const response = await axios.get(allBranchesUrl, {
            headers,
            params: {
              per_page: 100,
              page: currentPage,
            },
          });

          const pageBranches = response.data;
          allBranches = allBranches.concat(pageBranches);

          const totalPages = parseInt(
            response.headers["x-total-pages"] || "1",
            10,
          );
          fetchMore = currentPage < totalPages;
          currentPage++;
        }

        const filteredBranches = allBranches.filter((branch) =>
          branch.name.toLowerCase().includes(options.search!.toLowerCase()),
        );

        totalCount = filteredBranches.length;

        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        branches = filteredBranches.slice(startIndex, endIndex);
        hasMore = endIndex < filteredBranches.length;
      } else {
        const apiUrl = `https://gitlab.com/api/v4/projects/${projectPath}/repository/branches`;

        const response = await axios.get(apiUrl, {
          headers,
          params: {
            per_page: perPage,
            page: page,
          },
        });

        branches = response.data;

        const totalPages = parseInt(
          response.headers["x-total-pages"] || "1",
          10,
        );
        hasMore = page < totalPages;
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
              "Invalid GitLab token",
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
          throw new HttpException(
            "GitLab API rate limit exceeded or access forbidden",
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }
        if (error.response?.status === 404) {
          throw new HttpException("Repository not found", HttpStatus.NOT_FOUND);
        }
      }
      throw new HttpException(
        "Failed to fetch branches from GitLab",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async fetchCommits(
    gitlabUrl: string,
    branch: string,
    pat?: string,
    since?: Date,
  ): Promise<GitLabCommit[]> {
    try {
      const projectPath = this.extractProjectPath(gitlabUrl);

      const apiUrl = `https://gitlab.com/api/v4/projects/${projectPath}/repository/commits`;
      const params: any = {
        ref_name: branch,
        per_page: 100,
      };

      if (since) {
        params.since = since.toISOString();
      }

      const headers: any = {
        "User-Agent": "CommitDigest",
      };

      const token =
        pat && pat.trim()
          ? pat
          : this.configService.get<string>("GITLAB_TOKEN");

      if (token) {
        headers["PRIVATE-TOKEN"] = token;
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
              "Invalid GitLab token",
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
          throw new HttpException(
            "GitLab API rate limit exceeded or access forbidden",
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }
        if (error.response?.status === 404) {
          throw new HttpException("Repository not found", HttpStatus.NOT_FOUND);
        }
      }
      throw new HttpException(
        "Failed to fetch commits from GitLab",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async fetchCommitDiff(
    gitlabUrl: string,
    sha: string,
    pat?: string,
  ): Promise<string> {
    try {
      const projectPath = this.extractProjectPath(gitlabUrl);

      const apiUrl = `https://gitlab.com/api/v4/projects/${projectPath}/repository/commits/${sha}/diff`;

      const headers: any = {
        "User-Agent": "CommitDigest",
      };

      const token =
        pat && pat.trim()
          ? pat
          : this.configService.get<string>("GITLAB_TOKEN");

      if (token) {
        headers["PRIVATE-TOKEN"] = token;
      }

      const response = await axios.get(apiUrl, {
        headers,
      });

      // GitLab returns an array of file diffs, we need to format them
      const diffs = response.data;
      console.log({
        diffs,
      });
      if (!Array.isArray(diffs) || diffs.length === 0) {
        return "";
      }
    } catch (error) {
      console.log({
        error,
      });
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          if (pat && pat.trim()) {
            throw new HttpException(
              "Invalid GitLab token",
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
          throw new HttpException(
            "GitLab API rate limit exceeded or access forbidden",
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }
        if (error.response?.status === 404) {
          throw new HttpException("Commit not found", HttpStatus.NOT_FOUND);
        }
      }
      throw new HttpException(
        "Failed to fetch commit diff from GitLab",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
