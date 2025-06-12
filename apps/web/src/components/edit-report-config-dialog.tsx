"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { BranchSelector, Branch } from "@/components/ui/branch-selector";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { api } from "@/lib/api";
import { isValidCronExpression } from "@/lib/cron-utils";
import { useQueryClient } from "@tanstack/react-query";

const reportConfigSchema = z.object({
  name: z.string().min(1, "Configuration name is required"),
  branch: z.string().min(1, "Branch is required"),
  schedule: z
    .string()
    .min(1, "Schedule is required")
    .refine((val) => isValidCronExpression(val), {
      message:
        "Must be a valid cron expression (e.g., '0 9 * * *' for daily at 9 AM)",
    }),
  webhook_url: z
    .string()
    .regex(/^https?:\/\/.+/, "Must be a valid HTTP or HTTPS URL"),
  enabled: z.boolean().default(true),
});

type EditReportConfigFormData = z.infer<typeof reportConfigSchema>;

interface ReportConfiguration {
  id: string;
  name?: string;
  repository_id: string;
  branch: string;
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
  const [isCustomSchedule, setIsCustomSchedule] = useState(false);
  const [customSchedule, setCustomSchedule] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<EditReportConfigFormData>({
    resolver: zodResolver(reportConfigSchema),
  });

  const queryClient = useQueryClient();

  // Fetch branches for the repository
  const {
    data: branches,
    isLoading: branchesLoading,
    error: branchesError,
  } = useQuery({
    queryKey: ["repository-branches", configuration?.repository_id],
    queryFn: () =>
      api
        .getRepositoryBranches(configuration!.repository_id)
        .then((res) => res.data),
    enabled: !!configuration?.repository_id && open,
  });

  const updateMutation = useMutation({
    mutationFn: (data: EditReportConfigFormData) =>
      api.updateReportConfiguration(configuration!.id, data),
    onSuccess: () => {
      onSuccess();
      reset();
      setError(null);
      setIsCustomSchedule(false);
      setCustomSchedule("");
      queryClient.invalidateQueries({ queryKey: ["usage-stats"] });
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
      setValue("branch", configuration.branch);
      setValue("webhook_url", configuration.webhook_url);
      setValue("enabled", configuration.enabled);

      // Handle schedule
      const scheduleOptions = [
        { value: "0 9 * * *", label: "Daily at 9:00 AM" },
        { value: "0 9 * * 1", label: "Weekly on Monday at 9:00 AM" },
        { value: "0 9 1 * *", label: "Monthly on the 1st at 9:00 AM" },
        { value: "0 7 * * *", label: "Daily at 7:00 AM" },
        { value: "0 */6 * * *", label: "Every 6 hours" },
        { value: "0 9 * * 1-5", label: "Weekdays at 9:00 AM" },
      ];

      const isPredefined = scheduleOptions.some(
        (option) => option.value === configuration.schedule,
      );

      if (isPredefined) {
        setIsCustomSchedule(false);
        setValue("schedule", configuration.schedule);
      } else {
        setIsCustomSchedule(true);
        setCustomSchedule(configuration.schedule);
        setValue("schedule", configuration.schedule);
      }
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
      setIsCustomSchedule(false);
      setCustomSchedule("");
    }
    onOpenChange(newOpen);
  };

  const scheduleOptions = [
    { value: "0 9 * * *", label: "Daily at 9:00 AM" },
    { value: "0 9 * * 1", label: "Weekly on Monday at 9:00 AM" },
    { value: "0 9 1 * *", label: "Monthly on the 1st at 9:00 AM" },
    { value: "0 7 * * *", label: "Daily at 7:00 AM" },
    { value: "0 */6 * * *", label: "Every 6 hours" },
    { value: "0 9 * * 1-5", label: "Weekdays at 9:00 AM" },
  ];

  const handleScheduleTypeChange = (value: string) => {
    if (value === "custom") {
      setIsCustomSchedule(true);
      setValue("schedule", customSchedule);
    } else {
      setIsCustomSchedule(false);
      setValue("schedule", value);
    }
  };

  const handleCustomScheduleChange = (value: string) => {
    setCustomSchedule(value);
    setValue("schedule", value);
  };

  if (!configuration) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
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
            <Label htmlFor="branch">Branch</Label>
            {branchesError ? (
              <div className="p-3 border border-red-200 bg-red-50 rounded-md">
                <p className="text-sm text-red-600">
                  Failed to load branches. Please check your repository
                  connection.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    // Force retry by reloading
                    window.location.reload();
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <BranchSelector
                branches={branches || []}
                value={watch("branch")}
                onValueChange={(value) => setValue("branch", value)}
                placeholder="Select a branch"
                disabled={updateMutation.isPending}
                loading={branchesLoading}
                error={false}
              />
            )}
            {errors.branch && (
              <p className="text-sm text-red-600">{errors.branch.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule">Schedule</Label>
            {!isCustomSchedule ? (
              <Select
                onValueChange={handleScheduleTypeChange}
                disabled={updateMutation.isPending}
                value={isCustomSchedule ? "custom" : watch("schedule")}
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
                  <SelectItem value="custom">
                    🔧 Custom cron expression
                  </SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="Enter cron expression (e.g., 0 9 * * *)"
                  value={customSchedule}
                  onChange={(e) => handleCustomScheduleChange(e.target.value)}
                  disabled={updateMutation.isPending}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCustomSchedule(false);
                    setCustomSchedule("");
                    setValue("schedule", "");
                  }}
                  disabled={updateMutation.isPending}
                >
                  ← Back to presets
                </Button>
              </div>
            )}
            {errors.schedule && (
              <p className="text-sm text-red-600">{errors.schedule.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook_url">Webhook URL</Label>
            <Input
              id="webhook_url"
              placeholder="https://your-app.com/webhook"
              {...register("webhook_url")}
              disabled={updateMutation.isPending}
            />
            {errors.webhook_url && (
              <p className="text-sm text-red-600">
                {errors.webhook_url.message}
              </p>
            )}
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
                  Updating Configuration...
                </>
              ) : (
                "Update Configuration"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
