"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

interface Repository {
  id: string;
  github_url: string;
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
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<RepositoryFormData>({
    resolver: zodResolver(repositorySchema),
  });

  useEffect(() => {
    if (repository && open) {
      setValue("githubUrl", repository.github_url);
    }
  }, [repository, open, setValue]);

  const updateMutation = useMutation({
    mutationFn: (data: RepositoryFormData) =>
      api.updateRepository(repository!.id, data),
    onSuccess: () => {
      onSuccess();
      reset();
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["usage-stats"] });
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
            <Label htmlFor="pat">Personal Access Token (PAT)</Label>
            <Input
              id="pat"
              type="password"
              placeholder="Leave empty to keep current token"
              {...register("pat")}
              disabled={updateMutation.isPending}
            />
            {errors.pat && (
              <p className="text-sm text-red-600">{errors.pat.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Leave empty to keep the current token. Enter a new token to update
              it.
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
              disabled={updateMutation.isPending}
              className="w-full"
            >
              {updateMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Updating Repository...
                </>
              ) : (
                "Update Repository"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
