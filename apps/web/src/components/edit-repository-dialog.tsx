"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { api } from "@/lib/api";

const repositorySchema = z.object({
  githubUrl: z
    .string()
    .url("Invalid URL")
    .refine(
      (url) => url.includes("github.com"),
      "Must be a GitHub repository URL",
    ),
  branch: z.string().min(1, "Branch is required"),
  pat: z.string().optional(),
});

type RepositoryFormData = z.infer<typeof repositorySchema>;

interface Repository {
  id: string;
  github_url: string;
  branch: string;
  created_at: string;
}

interface EditRepositoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repository: Repository | null;
  onSuccess: () => void;
}

export function EditRepositoryDialog({
  open,
  onOpenChange,
  repository,
  onSuccess,
}: EditRepositoryDialogProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<RepositoryFormData>({
    resolver: zodResolver(repositorySchema),
  });

  // Set form values when repository changes
  useEffect(() => {
    if (repository) {
      setValue("githubUrl", repository.github_url);
      setValue("branch", repository.branch);
      setValue("pat", ""); // Don't pre-fill PAT for security
    }
  }, [repository, setValue]);

  const updateMutation = useMutation({
    mutationFn: (data: RepositoryFormData) => {
      if (!repository) throw new Error("No repository selected");

      // Only include fields that have values
      const updateData: any = {
        githubUrl: data.githubUrl,
        branch: data.branch,
      };

      // Only include PAT if it's provided
      if (data.pat && data.pat.trim()) {
        updateData.pat = data.pat;
      }

      return api.updateRepository(repository.id, updateData);
    },
    onSuccess: () => {
      onSuccess();
      reset();
      setError(null);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || "Failed to update repository");
    },
  });

  const onSubmit = (data: RepositoryFormData) => {
    setError(null);
    updateMutation.mutate(data);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
      setError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Repository</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="githubUrl">GitHub Repository URL</Label>
            <Input
              id="githubUrl"
              placeholder="https://github.com/username/repository"
              {...register("githubUrl")}
              disabled={updateMutation.isPending}
            />
            {errors.githubUrl && (
              <p className="text-sm text-red-600">{errors.githubUrl.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch">Branch</Label>
            <Input
              id="branch"
              placeholder="main"
              {...register("branch")}
              disabled={updateMutation.isPending}
            />
            {errors.branch && (
              <p className="text-sm text-red-600">{errors.branch.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pat">
              Personal Access Token (Optional for public repos)
            </Label>
            <Input
              id="pat"
              type="password"
              placeholder="Leave empty to keep current or if public repo"
              {...register("pat")}
              disabled={updateMutation.isPending}
            />
            {errors.pat && (
              <p className="text-sm text-red-600">{errors.pat.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Optional for public repositories. Required for private
              repositories. Create a new token at{" "}
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                GitHub Settings
              </a>{" "}
              with repository read access.
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : null}
              Update Repository
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
