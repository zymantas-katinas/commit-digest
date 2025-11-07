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
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import { isValidCronExpression } from "@/lib/cron-utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  REPORT_STYLE,
  TONE_OF_VOICE,
  REPORT_CONFIGURATION_DEFAULTS,
  REPORT_STYLE_OPTIONS,
  TONE_OF_VOICE_OPTIONS,
} from "@/lib/report-config-enums";

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
  // New report configuration settings
  report_style: z
    .nativeEnum(REPORT_STYLE)
    .default(REPORT_CONFIGURATION_DEFAULTS.REPORT_STYLE),
  tone_of_voice: z
    .nativeEnum(TONE_OF_VOICE)
    .default(REPORT_CONFIGURATION_DEFAULTS.TONE_OF_VOICE),
  author_display: z
    .boolean()
    .default(REPORT_CONFIGURATION_DEFAULTS.AUTHOR_DISPLAY),
  link_to_commits: z
    .boolean()
    .default(REPORT_CONFIGURATION_DEFAULTS.LINK_TO_COMMITS),
  if_no_updates: z
    .boolean()
    .default(REPORT_CONFIGURATION_DEFAULTS.IF_NO_UPDATES),
  include_diffs: z
    .boolean()
    .default(REPORT_CONFIGURATION_DEFAULTS.INCLUDE_DIFFS),
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
  // New report configuration settings
  report_style?: string;
  tone_of_voice?: string;
  author_display?: boolean;
  link_to_commits?: boolean;
  if_no_updates?: boolean;
  include_diffs?: boolean;
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
  const [selectedReportStyle, setSelectedReportStyle] = useState<REPORT_STYLE>(
    REPORT_STYLE.STANDARD,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<EditReportConfigFormData>({
    resolver: zodResolver(reportConfigSchema),
    mode: "onSubmit",
  });

  const queryClient = useQueryClient();

  // Branches are now fetched internally by BranchSelector

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

      // Set new report configuration settings with defaults
      const reportStyle =
        (configuration.report_style as REPORT_STYLE) ||
        REPORT_CONFIGURATION_DEFAULTS.REPORT_STYLE;
      setValue("report_style", reportStyle);
      setSelectedReportStyle(reportStyle);
      setValue(
        "tone_of_voice",
        (configuration.tone_of_voice as TONE_OF_VOICE) ||
          REPORT_CONFIGURATION_DEFAULTS.TONE_OF_VOICE,
      );
      setValue(
        "author_display",
        configuration.author_display ??
          REPORT_CONFIGURATION_DEFAULTS.AUTHOR_DISPLAY,
      );
      setValue(
        "link_to_commits",
        configuration.link_to_commits ??
          REPORT_CONFIGURATION_DEFAULTS.LINK_TO_COMMITS,
      );
      setValue(
        "if_no_updates",
        configuration.if_no_updates ??
          REPORT_CONFIGURATION_DEFAULTS.IF_NO_UPDATES,
      );
      setValue(
        "include_diffs",
        configuration.include_diffs ??
          REPORT_CONFIGURATION_DEFAULTS.INCLUDE_DIFFS,
      );

      // Handle schedule
      const scheduleOptions = [
        { value: "0 9 * * *", label: "Daily at 9:00 AM" },
        { value: "0 9 * * 1-5", label: "Weekdays at 9:00 AM" },
        { value: "0 9 * * 1", label: "Weekly on Monday at 9:00 AM" },
        { value: "0 9 1 * *", label: "Monthly on the 1st at 9:00 AM" },
      ];

      const isPresetSchedule = scheduleOptions.some(
        (option) => option.value === configuration.schedule,
      );

      if (isPresetSchedule) {
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
      setSelectedReportStyle(REPORT_STYLE.STANDARD);
    }
    onOpenChange(newOpen);
  };

  const scheduleOptions = [
    { value: "0 9 * * *", label: "Daily at 9:00 AM" },
    { value: "0 9 * * 1-5", label: "Weekdays at 9:00 AM" },
    { value: "0 9 * * 1", label: "Weekly on Monday at 9:00 AM" },
    { value: "0 9 1 * *", label: "Monthly on the 1st at 9:00 AM" },
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
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
            <BranchSelector
              repositoryId={configuration.repository_id}
              value={watch("branch")}
              onValueChange={(value) => setValue("branch", value)}
              placeholder="Select a branch"
              disabled={updateMutation.isPending}
            />
            {errors.branch && (
              <p className="text-sm text-red-600">{errors.branch.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule">Schedule</Label>
            {!isCustomSchedule ? (
              <Select
                onValueChange={handleScheduleTypeChange}
                value={watch("schedule")}
                disabled={updateMutation.isPending}
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
                    setValue("schedule", "0 9 * * *");
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

          {/* <div className="flex items-center space-x-2">
            <Switch
              id="enabled"
              checked={watch("enabled")}
              onCheckedChange={(checked) => setValue("enabled", checked)}
              disabled={updateMutation.isPending}
            />
            <Label htmlFor="enabled">Configuration Enabled</Label>
          </div> */}

          {/* Report Settings Section */}
          <div className="border-t pt-4 space-y-4">
            <h3 className="text-lg font-medium">Report Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="report_style">Report Style</Label>
                <Select
                  onValueChange={(value) => {
                    const reportStyle = value as REPORT_STYLE;
                    setValue("report_style", reportStyle);
                    setSelectedReportStyle(reportStyle);
                  }}
                  value={watch("report_style")}
                  disabled={updateMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select report style" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_STYLE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.report_style && (
                  <p className="text-sm text-red-600">
                    {errors.report_style.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone_of_voice">Tone of Voice</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("tone_of_voice", value as TONE_OF_VOICE)
                  }
                  value={watch("tone_of_voice")}
                  disabled={updateMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone of voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {TONE_OF_VOICE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tone_of_voice && (
                  <p className="text-sm text-red-600">
                    {errors.tone_of_voice.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {selectedReportStyle !== REPORT_STYLE.SUMMARY && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="author_display">Show Author Names</Label>
                      <p className="text-sm text-gray-500">
                        Display author names in the report
                      </p>
                    </div>
                    <Switch
                      id="author_display"
                      checked={watch("author_display")}
                      onCheckedChange={(checked) =>
                        setValue("author_display", checked)
                      }
                      disabled={updateMutation.isPending}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="link_to_commits">Link to Commits</Label>
                      <p className="text-sm text-gray-500">
                        Include clickable links to commits in the report
                      </p>
                    </div>
                    <Switch
                      id="link_to_commits"
                      checked={watch("link_to_commits")}
                      onCheckedChange={(checked) =>
                        setValue("link_to_commits", checked)
                      }
                      disabled={updateMutation.isPending}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="include_diffs">Include Code Diffs</Label>
                      <p className="text-sm text-gray-500">
                        Include code changes (diffs) in the report for deeper analysis
                      </p>
                    </div>
                    <Switch
                      id="include_diffs"
                      checked={watch("include_diffs")}
                      onCheckedChange={(checked) =>
                        setValue("include_diffs", checked)
                      }
                      disabled={updateMutation.isPending}
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="if_no_updates">
                    Send "No Updates" Message
                  </Label>
                  <p className="text-sm text-gray-500">
                    Send a message when there are no updates to report
                  </p>
                </div>
                <Switch
                  id="if_no_updates"
                  checked={watch("if_no_updates")}
                  onCheckedChange={(checked) =>
                    setValue("if_no_updates", checked)
                  }
                  disabled={updateMutation.isPending}
                />
              </div>
            </div>
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
