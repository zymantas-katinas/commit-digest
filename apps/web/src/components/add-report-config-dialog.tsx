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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { api } from "@/lib/api";

const reportConfigSchema = z.object({
  repositoryId: z.string().min(1, "Repository is required"),
  schedule: z.string().min(1, "Schedule is required"),
  webhookUrl: z
    .string()
    .regex(/^https?:\/\/.+/, "Must be a valid HTTP or HTTPS URL"),
});

type ReportConfigFormData = z.infer<typeof reportConfigSchema>;

interface Repository {
  id: string;
  github_url: string;
  branch: string;
}

interface AddReportConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repositories: Repository[];
  onSuccess: () => void;
}

export function AddReportConfigDialog({
  open,
  onOpenChange,
  repositories,
  onSuccess,
}: AddReportConfigDialogProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ReportConfigFormData>({
    resolver: zodResolver(reportConfigSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: ReportConfigFormData) =>
      api.createReportConfiguration(data),
    onSuccess: () => {
      onSuccess();
      reset();
      setError(null);
    },
    onError: (error: any) => {
      setError(
        error.response?.data?.message || "Failed to create configuration",
      );
    },
  });

  const onSubmit = (data: ReportConfigFormData) => {
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

  const getRepositoryName = (url: string) => {
    try {
      const match = url.match(/github\.com\/([^\/]+\/[^\/]+)/);
      return match ? match[1] : url;
    } catch {
      return url;
    }
  };

  const scheduleOptions = [
    { value: "0 9 * * *", label: "Daily at 9:00 AM" },
    { value: "0 9 * * 1", label: "Weekly on Monday at 9:00 AM" },
    { value: "0 9 1 * *", label: "Monthly on the 1st at 9:00 AM" },
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Report Configuration</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="repositoryId">Repository</Label>
            <Select
              onValueChange={(value) => setValue("repositoryId", value)}
              disabled={createMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a repository" />
              </SelectTrigger>
              <SelectContent>
                {repositories.map((repo) => (
                  <SelectItem key={repo.id} value={repo.id}>
                    {getRepositoryName(repo.github_url)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.repositoryId && (
              <p className="text-sm text-red-600">
                {errors.repositoryId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule">Schedule</Label>
            <Select
              onValueChange={(value) => setValue("schedule", value)}
              disabled={createMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select schedule" />
              </SelectTrigger>
              <SelectContent>
                {scheduleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.schedule && (
              <p className="text-sm text-red-600">{errors.schedule.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input
              id="webhookUrl"
              placeholder="http://localhost:3002/webhook"
              {...register("webhookUrl")}
              disabled={createMutation.isPending}
            />
            {errors.webhookUrl && (
              <p className="text-sm text-red-600">
                {errors.webhookUrl.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              The URL where reports will be sent via POST request.
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
              Create Configuration
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
