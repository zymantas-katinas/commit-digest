"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  getTimezoneOptions,
  getBrowserTimezone,
  formatTimezoneDisplay,
  getTimezoneOffset,
} from "@/lib/timezone-utils";
import { Clock, Globe, MapPin } from "lucide-react";

const timezoneSchema = z.object({
  timezone: z.string().min(1, "Timezone is required"),
});

type TimezoneFormData = z.infer<typeof timezoneSchema>;

interface TimezoneSettingsProps {
  onSuccess?: () => void;
}

export function TimezoneSettings({ onSuccess }: TimezoneSettingsProps) {
  const [error, setError] = useState<string | null>(null);
  const [browserTimezone, setBrowserTimezone] = useState<string>("");
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TimezoneFormData>({
    resolver: zodResolver(timezoneSchema),
  });

  const watchedTimezone = watch("timezone");

  // Get user profile with timezone
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => api.getUserProfile(),
  });

  // Update timezone mutation
  const updateTimezoneMutation = useMutation({
    mutationFn: (timezone: string) => api.updateUserTimezone(timezone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setError(null);
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || "Failed to update timezone");
    },
  });

  // Get browser timezone on mount
  useEffect(() => {
    try {
      const detected = getBrowserTimezone();
      setBrowserTimezone(detected);
    } catch (error) {
      console.error("Failed to detect browser timezone:", error);
    }
  }, []);

  // Set form value when user profile loads
  useEffect(() => {
    if (userProfile?.data?.timezone) {
      setValue("timezone", userProfile.data.timezone);
    }
  }, [userProfile, setValue]);

  const onSubmit = (data: TimezoneFormData) => {
    setError(null);
    updateTimezoneMutation.mutate(data.timezone);
  };

  const handleUseBrowserTimezone = () => {
    if (browserTimezone) {
      setValue("timezone", browserTimezone);
    }
  };

  const timezoneOptions = getTimezoneOptions();
  const currentTimezone = userProfile?.data?.timezone || "UTC";
  const currentTime = new Date().toLocaleString("en-US", {
    timeZone: currentTimezone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Timezone Settings
        </h3>
        <p className="text-sm text-muted-foreground">
          Set your timezone to receive scheduled reports at the correct time.
        </p>
      </div>

      {/* Current Time Display */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">Current Time</span>
        </div>
        <p className="text-sm text-muted-foreground">{currentTime}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Timezone: {currentTimezone} (UTC{getTimezoneOffset(currentTimezone)})
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select
            onValueChange={(value) => setValue("timezone", value)}
            disabled={updateTimezoneMutation.isPending}
            value={watchedTimezone}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your timezone" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {timezoneOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {option.value} ({option.offset})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.timezone && (
            <p className="text-sm text-red-600">{errors.timezone.message}</p>
          )}
        </div>

        {/* Browser Timezone Detection */}
        {browserTimezone && browserTimezone !== watchedTimezone && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Detected Timezone
              </span>
            </div>
            <p className="text-sm text-blue-700 mb-2">
              We detected your browser timezone as {browserTimezone}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUseBrowserTimezone}
              className="text-blue-700 border-blue-300 hover:bg-blue-100"
            >
              Use Detected Timezone
            </Button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={updateTimezoneMutation.isPending}
          className="w-full"
        >
          {updateTimezoneMutation.isPending ? (
            <>
              <LoadingSpinner className="mr-2" />
              Updating...
            </>
          ) : (
            "Update Timezone"
          )}
        </Button>
      </form>

      {/* Schedule Information */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-800">
            About Scheduled Reports
          </span>
        </div>
        <p className="text-sm text-amber-700">
          When you set a schedule like "Daily at 9:00 AM", reports will be
          generated at 9:00 AM in your selected timezone. This ensures you
          receive reports at the right time regardless of where the server is
          located.
        </p>
      </div>
    </div>
  );
}
