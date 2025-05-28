"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { api } from "@/lib/api";
import { Trash2, ExternalLink, GitBranch } from "lucide-react";

interface Repository {
  id: string;
  github_url: string;
  branch: string;
  created_at: string;
}

interface RepositoryListProps {
  repositories: Repository[];
  onRefetch: () => void;
}

export function RepositoryList({
  repositories,
  onRefetch,
}: RepositoryListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteRepository(id),
    onSuccess: () => {
      onRefetch();
      setDeletingId(null);
    },
    onError: (error) => {
      console.error("Delete repository error:", error);
      setDeletingId(null);
    },
  });

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this repository?")) {
      setDeletingId(id);
      deleteMutation.mutate(id);
    }
  };

  const getRepoName = (url: string) => {
    try {
      const match = url.match(/github\.com\/([^\/]+\/[^\/]+)/);
      return match ? match[1] : url;
    } catch {
      return url;
    }
  };

  if (repositories.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <GitBranch className="h-8 w-8 mx-auto text-gray-300 mb-2" />
        <p className="text-sm">No repositories</p>
        <p className="text-xs mt-1 text-gray-400">Add one to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {repositories.map((repo) => (
        <div
          key={repo.id}
          className="group relative p-3 border border-gray-100 rounded-md hover:border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1 mb-1">
                <GitBranch className="h-3 w-3 text-gray-400 flex-shrink-0" />
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {getRepoName(repo.github_url)}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {repo.branch}
                </span>
                <a
                  href={repo.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Open in GitHub"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(repo.id)}
              disabled={deletingId === repo.id}
              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
              title="Delete repository"
            >
              {deletingId === repo.id ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
