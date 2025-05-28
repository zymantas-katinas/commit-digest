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
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DatePicker } from "@/components/ui/date-picker";
import { api } from "@/lib/api";
import { Calendar, AlertCircle } from "lucide-react";

const manualTriggerSchema = z
  .object({
    fromDate: z.string().min(1, "Start date is required"),
    toDate: z.string().min(1, "End date is required"),
  })
  .refine(
    (data) => {
      const fromDate = new Date(data.fromDate);
      const toDate = new Date(data.toDate);

      // Check if fromDate is before toDate
      if (fromDate >= toDate) {
        return false;
      }

      // Check if date range is not more than 1 month (31 days)
      const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays <= 31;
    },
    {
      message: "Date range must be valid and not exceed 1 month (31 days)",
      path: ["toDate"],
    },
  );

type ManualTriggerFormData = z.infer<typeof manualTriggerSchema>;

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

interface ManualTriggerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  configuration: ReportConfiguration | null;
  onSuccess: (result: any) => void;
}

export function ManualTriggerDialog({
  open,
  onOpenChange,
  configuration,
  onSuccess,
}: ManualTriggerDialogProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ManualTriggerFormData>({
    resolver: zodResolver(manualTriggerSchema),
  });

  const fromDate = watch("fromDate");
  const toDate = watch("toDate");

  const triggerMutation = useMutation({
    mutationFn: (data: ManualTriggerFormData) =>
      api.manualTriggerReport(configuration!.id, {
        fromDate: data.fromDate,
        toDate: data.toDate,
      }),
    onSuccess: (result: any) => {
      onSuccess(result.data);
      reset();
      setError(null);
    },
    onError: (error: any) => {
      setError(
        error.response?.data?.message || "Failed to trigger manual report",
      );
    },
  });

  // Set default dates when dialog opens
  useEffect(() => {
    if (open && configuration) {
      const today = new Date();
      const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      setValue("fromDate", oneWeekAgo.toISOString().split("T")[0]);
      setValue("toDate", today.toISOString().split("T")[0]);
    }
  }, [open, configuration, setValue]);

  const onSubmit = (data: ManualTriggerFormData) => {
    setError(null);
    triggerMutation.mutate(data);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
      setError(null);
    }
    onOpenChange(newOpen);
  };

  // Calculate date range info
  const getDateRangeInfo = () => {
    if (!fromDate || !toDate) return null;

    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      days: diffDays,
      isValid: diffDays <= 31 && from < to,
    };
  };

  const dateRangeInfo = getDateRangeInfo();

  if (!configuration) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Manual Report Trigger</span>
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Generate a report for{" "}
            <span className="font-medium">
              {configuration.name || "Unnamed Configuration"}
            </span>{" "}
            with a custom date range.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromDate">From Date</Label>
              <DatePicker
                id="fromDate"
                {...register("fromDate")}
                disabled={triggerMutation.isPending}
                max={new Date().toISOString().split("T")[0]}
              />
              {errors.fromDate && (
                <p className="text-sm text-red-600">
                  {errors.fromDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="toDate">To Date</Label>
              <DatePicker
                id="toDate"
                {...register("toDate")}
                disabled={triggerMutation.isPending}
                max={new Date().toISOString().split("T")[0]}
              />
              {errors.toDate && (
                <p className="text-sm text-red-600">{errors.toDate.message}</p>
              )}
            </div>
          </div>

          {/* Date Range Info */}
          {dateRangeInfo && (
            <div
              className={`p-3 rounded-lg text-sm ${
                dateRangeInfo.isValid
                  ? "bg-green-500/10 text-green-600 border border-green-500/20"
                  : "bg-red-500/10 text-red-600 border border-red-500/20"
              }`}
            >
              <div className="flex items-center space-x-2">
                {dateRangeInfo.isValid ? (
                  <>
                    <span>
                      ✓ Date range: {dateRangeInfo.days} day
                      {dateRangeInfo.days !== 1 ? "s" : ""}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      {dateRangeInfo.days > 31
                        ? `Date range too long: ${dateRangeInfo.days} days (max 31 days)`
                        : "End date must be after start date"}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Warning about manual triggers */}
          <div className="p-3 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-lg text-sm">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">Manual Trigger</p>
                <p>
                  This will generate a report for the selected date range and
                  send it to your configured webhook URL. This action counts
                  towards your monthly usage limit.
                </p>
              </div>
            </div>
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
              disabled={triggerMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={triggerMutation.isPending || !dateRangeInfo?.isValid}
            >
              {triggerMutation.isPending ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : null}
              Generate Report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
