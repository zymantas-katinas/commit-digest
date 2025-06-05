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
import { isValidCronExpression } from "@/lib/cron-utils";

// Predefined cron expressions with display names
const PRESET_SCHEDULES = [
  { value: "0 9 * * *", label: "Daily at 9:00 AM" },
  { value: "0 7 * * *", label: "Daily at 7:00 AM" },
  { value: "0 9 * * 1", label: "Weekly on Monday at 9:00 AM" },
  { value: "0 9 1 * *", label: "Monthly on the 1st at 9:00 AM" },
  { value: "0 */6 * * *", label: "Every 6 hours" },
  { value: "0 9 * * 1-5", label: "Weekdays at 9:00 AM" },
  { value: "custom", label: "🔧 Custom cron expression" },
];

const reportConfigSchema = z.object({
  name: z.string().min(1, "Configuration name is required"),
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

  // Watch the schedule field to keep Select in sync
  const watchedSchedule = watch("schedule");

  const updateMutation = useMutation({
    mutationFn: (data: EditReportConfigFormData) =>
      api.updateReportConfiguration(configuration!.id, data),
    onSuccess: () => {
      onSuccess();
      reset();
      setError(null);
      setIsCustomSchedule(false);
      setCustomSchedule("");
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
      setValue("webhook_url", configuration.webhook_url);
      setValue("enabled", configuration.enabled);

      // Check if the current schedule is one of the predefined options
      const isPredefined = PRESET_SCHEDULES.some(
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
            <Label htmlFor="schedule">Schedule</Label>
            {!isCustomSchedule ? (
              <Select
                onValueChange={handleScheduleTypeChange}
                disabled={updateMutation.isPending}
                value={isCustomSchedule ? "custom" : watchedSchedule}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select schedule" />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_SCHEDULES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="0 9 * * *"
                    value={customSchedule}
                    onChange={(e) => handleCustomScheduleChange(e.target.value)}
                    disabled={updateMutation.isPending}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleScheduleTypeChange("")}
                    disabled={updateMutation.isPending}
                  >
                    Use Preset
                  </Button>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>
                    <strong>Cron format:</strong> minute hour day month weekday
                  </p>
                  <p>
                    <strong>Examples:</strong>
                  </p>
                  <ul className="ml-4 space-y-0.5">
                    <li>
                      • <code>0 9 * * *</code> - Daily at 9:00 AM
                    </li>
                    <li>
                      • <code>0 9 * * 1</code> - Weekly on Monday at 9:00 AM
                    </li>
                    <li>
                      • <code>0 */6 * * *</code> - Every 6 hours
                    </li>
                    <li>
                      • <code>30 8 1 * *</code> - Monthly on 1st at 8:30 AM
                    </li>
                  </ul>
                </div>
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
