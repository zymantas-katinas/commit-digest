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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { api } from "@/lib/api";

const editReportConfigSchema = z.object({
  name: z.string().min(1, "Configuration name is required"),
  schedule: z.string().min(1, "Schedule is required"),
  webhook_url: z
    .string()
    .regex(/^https?:\/\/.+/, "Must be a valid HTTP or HTTPS URL"),
  enabled: z.boolean(),
});

type EditReportConfigFormData = z.infer<typeof editReportConfigSchema>;

interface ReportConfiguration {
  id: string;
  name?: string;
  repository_id: string;
  schedule: string;
  webhook_url: string;
  enabled: boolean;
  last_run_at?: string;
  last_run_status?: string;
  created_at: string;
}

interface EditReportConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  configuration: ReportConfiguration | null;
  onSuccess: () => void;
}

export function EditReportConfigDialog({
  open,
  onOpenChange,
  configuration,
  onSuccess,
}: EditReportConfigDialogProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<EditReportConfigFormData>({
    resolver: zodResolver(editReportConfigSchema),
  });

  const updateMutation = useMutation({
    mutationFn: (data: EditReportConfigFormData) =>
      api.updateReportConfiguration(configuration!.id, data),
    onSuccess: () => {
      onSuccess();
      reset();
      setError(null);
    },
    onError: (error: any) => {
      setError(
        error.response?.data?.message || "Failed to update configuration",
      );
    },
  });

  // Populate form when configuration changes
  useEffect(() => {
    if (configuration && open) {
      setValue("name", configuration.name || "");
      setValue("schedule", configuration.schedule);
      setValue("webhook_url", configuration.webhook_url);
      setValue("enabled", configuration.enabled);
    }
  }, [configuration, open, setValue]);

  const onSubmit = (data: EditReportConfigFormData) => {
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

  const scheduleOptions = [
    { value: "0 9 * * *", label: "Daily at 9:00 AM" },
    { value: "0 9 * * 1", label: "Weekly on Monday at 9:00 AM" },
    { value: "0 9 1 * *", label: "Monthly on the 1st at 9:00 AM" },
  ];

  if (!configuration) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Report Configuration</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Configuration Name</Label>
            <Input
              id="name"
              placeholder="e.g., Weekly Team Report"
              {...register("name")}
              disabled={updateMutation.isPending}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule">Schedule</Label>
            <Select
              onValueChange={(value) => setValue("schedule", value)}
              disabled={updateMutation.isPending}
              value={configuration.schedule}
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
            <Label htmlFor="webhook_url">Webhook URL</Label>
            <Input
              id="webhook_url"
              placeholder="http://localhost:3002/webhook"
              {...register("webhook_url")}
              disabled={updateMutation.isPending}
            />
            {errors.webhook_url && (
              <p className="text-sm text-red-600">
                {errors.webhook_url.message}
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
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : null}
              Update Configuration
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
