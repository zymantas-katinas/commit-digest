"use client";

import { useState } from "react";
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

interface AddRepositoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddRepositoryDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddRepositoryDialogProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RepositoryFormData>({
    resolver: zodResolver(repositorySchema),
    defaultValues: {
      branch: "main",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: RepositoryFormData) => api.createRepository(data),
    onSuccess: () => {
      onSuccess();
      reset();
      setError(null);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || "Failed to add repository");
    },
  });

  const onSubmit = (data: RepositoryFormData) => {
    setError(null);
    createMutation.mutate(data);
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
          <DialogTitle>Add Repository</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="githubUrl">GitHub Repository URL</Label>
            <Input
              id="githubUrl"
              placeholder="https://github.com/username/repository"
              {...register("githubUrl")}
              disabled={createMutation.isPending}
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
              disabled={createMutation.isPending}
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
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (optional for public repos)"
              {...register("pat")}
              disabled={createMutation.isPending}
            />
            {errors.pat && (
              <p className="text-sm text-red-600">{errors.pat.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Optional for public repositories. Required for private
              repositories. Create a token at{" "}
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
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : null}
              Add Repository
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
