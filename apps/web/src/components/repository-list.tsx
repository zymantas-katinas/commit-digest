"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EditRepositoryDialog } from "@/components/edit-repository-dialog";
import { api } from "@/lib/api";
import { Trash2, ExternalLink, GitBranch, Edit } from "lucide-react";

interface Repository {
  id: string;
  github_url: string;
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
  const [editingRepository, setEditingRepository] = useState<Repository | null>(
    null,
  );

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

  const handleEdit = (repository: Repository) => {
    setEditingRepository(repository);
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
      <div className="text-center py-6 text-muted-foreground">
        <GitBranch className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
        <p className="text-sm">No repositories</p>
        <p className="text-xs mt-1 text-muted-foreground/70">
          Add one to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {repositories.map((repo) => (
        <div
          key={repo.id}
          className="group relative p-3 border border-border rounded-md hover:border-border/80 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1 mb-1">
                <GitBranch className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <h3 className="text-sm font-medium truncate">
                  {getRepoName(repo.github_url)}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={repo.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Open in GitHub"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(repo)}
                className="h-7 w-7 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(repo.id)}
                disabled={deletingId === repo.id}
                className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                {deletingId === repo.id ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>
      ))}

      <EditRepositoryDialog
        open={!!editingRepository}
        onOpenChange={(open) => !open && setEditingRepository(null)}
        repository={editingRepository}
        onSuccess={() => {
          onRefetch();
          setEditingRepository(null);
        }}
      />
    </div>
  );
}
