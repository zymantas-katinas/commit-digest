"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EditRepositoryDialog } from "@/components/edit-repository-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import {
  Trash2,
  ExternalLink,
  GitBranch,
  Edit,
  MoreVertical,
} from "lucide-react";

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
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteRepository(id),
    onSuccess: () => {
      onRefetch();
      setDeletingId(null);
      queryClient.invalidateQueries({ queryKey: ["usage-stats"] });
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
      if (url.includes("github.com")) {
        const match = url.match(/github\.com\/([^\/]+\/[^\/]+)/);
        return match ? match[1] : url;
      } else if (url.includes("gitlab.com")) {
        const urlObj = new URL(url);
        const path = urlObj.pathname
          .replace(/^\/|\/$/g, "")
          .replace(/\.git$/, "");
        return path || url;
      }
      return url;
    } catch {
      return url;
    }
  };

  if (repositories.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground bg-card rounded-lg p-4 sm:p-6">
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
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1">
                <GitBranch className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <h3 className="text-sm font-medium truncate font-mono">
                  {getRepoName(repo.github_url)}
                </h3>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem
                  onClick={() => handleEdit(repo)}
                  className="cursor-pointer"
                >
                  <Edit className="h-3 w-3 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    window.open(
                      repo.github_url,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                  className="cursor-pointer"
                >
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Open Repository
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(repo.id)}
                  disabled={deletingId === repo.id}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  {deletingId === repo.id ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Trash2 className="h-3 w-3 mr-2" />
                  )}
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
