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
            <Label htmlFor="pat">Personal Access Token (PAT)</Label>
            <Input
              id="pat"
              type="password"
              placeholder="Optional - Required for private repositories"
              {...register("pat")}
              disabled={createMutation.isPending}
            />
            {errors.pat && (
              <p className="text-sm text-red-600">{errors.pat.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              A PAT is required for private repositories and improves rate
              limits for public ones.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full"
            >
              {createMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Adding Repository...
                </>
              ) : (
                "Add Repository"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
