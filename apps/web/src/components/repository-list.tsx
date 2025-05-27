"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { api } from "@/lib/api";
import { Trash2, ExternalLink } from "lucide-react";

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
      <div className="text-center py-8 text-gray-500">
        <p>No repositories added yet.</p>
        <p className="text-sm mt-2">
          Add a repository to start generating reports.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {repositories.map((repo) => (
        <div
          key={repo.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
        >
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900">
                {getRepoName(repo.github_url)}
              </h3>
              <a
                href={repo.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <p className="text-sm text-gray-600">Branch: {repo.branch}</p>
            <p className="text-xs text-gray-500">
              Added {new Date(repo.created_at).toLocaleDateString()}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(repo.id)}
            disabled={deletingId === repo.id}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {deletingId === repo.id ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      ))}
    </div>
  );
}
