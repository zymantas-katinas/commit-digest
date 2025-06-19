"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  REPORT_STYLE,
  TONE_OF_VOICE,
  REPORT_CONFIGURATION_DEFAULTS,
  REPORT_STYLE_OPTIONS,
  TONE_OF_VOICE_OPTIONS,
} from "@/lib/report-config-enums";

// Cron expression validation regex
const cronRegex =
  /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/;

const reportConfigSchema = z.object({
  name: z.string().min(1, "Configuration name is required"),
  repositoryId: z.string().min(1, "Repository is required"),
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
});

type ReportConfigFormData = z.infer<typeof reportConfigSchema>;

interface Repository {
  id: string;
  github_url: string;
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
  const [isCustomSchedule, setIsCustomSchedule] = useState(false);
  const [customSchedule, setCustomSchedule] = useState("");
  const [selectedRepoId, setSelectedRepoId] = useState<string>("");
  const [selectedReportStyle, setSelectedReportStyle] = useState<REPORT_STYLE>(
    REPORT_CONFIGURATION_DEFAULTS.REPORT_STYLE,
  );
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ReportConfigFormData>({
    resolver: zodResolver(reportConfigSchema),
    defaultValues: {
      enabled: true,
      report_style: REPORT_CONFIGURATION_DEFAULTS.REPORT_STYLE,
      tone_of_voice: REPORT_CONFIGURATION_DEFAULTS.TONE_OF_VOICE,
      author_display: REPORT_CONFIGURATION_DEFAULTS.AUTHOR_DISPLAY,
      link_to_commits: REPORT_CONFIGURATION_DEFAULTS.LINK_TO_COMMITS,
      if_no_updates: REPORT_CONFIGURATION_DEFAULTS.IF_NO_UPDATES,
    },
    mode: "onSubmit",
  });

  // Branches are now fetched internally by BranchSelector

  const createMutation = useMutation({
    mutationFn: (data: ReportConfigFormData) =>
      api.createReportConfiguration(data),
    onSuccess: () => {
      onSuccess();
      reset();
      setError(null);
      setIsCustomSchedule(false);
      setCustomSchedule("");
      setSelectedRepoId("");
      queryClient.invalidateQueries({ queryKey: ["usage-stats"] });
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
      setIsCustomSchedule(false);
      setCustomSchedule("");
      setSelectedRepoId("");
      setSelectedReportStyle(REPORT_CONFIGURATION_DEFAULTS.REPORT_STYLE);
    }
    onOpenChange(newOpen);
  };

  const getRepositoryName = (url: string) => {
    try {
      const match = url.match(/github\.com\/([^\/]+\/[^\/]+)/);
      return match ? `${match[1]}` : url;
    } catch {
      return url;
    }
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

  const handleRepositoryChange = (value: string) => {
    setSelectedRepoId(value);
    setValue("repositoryId", value);
    // Reset branch selection when repository changes
    setValue("branch", "");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Report Configuration</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Configuration Name</Label>
            <Input
              id="name"
              placeholder="e.g., Weekly Team Report"
              {...register("name")}
              disabled={createMutation.isPending}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="repositoryId">Repository</Label>
            <Select
              onValueChange={handleRepositoryChange}
              disabled={createMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a repository" />
              </SelectTrigger>
              <SelectContent>
                {repositories.map((repo) => (
                  <SelectItem key={repo.id} value={repo.id}>
                    <span className="text-sm font-medium truncate">
                      {getRepositoryName(repo.github_url)}
                    </span>
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
            <Label htmlFor="branch">Branch</Label>
            <BranchSelector
              repositoryId={selectedRepoId}
              value={watch("branch")}
              onValueChange={(value) => setValue("branch", value)}
              placeholder={
                !selectedRepoId
                  ? "Select a repository first"
                  : "Select a branch"
              }
              disabled={createMutation.isPending || !selectedRepoId}
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
                  disabled={createMutation.isPending}
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
                  disabled={createMutation.isPending}
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
              disabled={createMutation.isPending}
            />
            {errors.webhook_url && (
              <p className="text-sm text-red-600">
                {errors.webhook_url.message}
              </p>
            )}
          </div>

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
                  defaultValue={REPORT_CONFIGURATION_DEFAULTS.REPORT_STYLE}
                  disabled={createMutation.isPending}
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
                  defaultValue={REPORT_CONFIGURATION_DEFAULTS.TONE_OF_VOICE}
                  disabled={createMutation.isPending}
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
                      disabled={createMutation.isPending}
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
                      disabled={createMutation.isPending}
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
                  disabled={createMutation.isPending}
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
              disabled={createMutation.isPending}
              className="w-full"
            >
              {createMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating Configuration...
                </>
              ) : (
                "Create Configuration"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
