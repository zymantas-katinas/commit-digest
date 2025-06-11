"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getTimezoneOffset } from "@/lib/timezone-utils";
import { Clock, Globe } from "lucide-react";

interface TimezoneStatusProps {
  showLabel?: boolean;
  className?: string;
}

export function TimezoneStatus({
  showLabel = true,
  className = "",
}: TimezoneStatusProps) {
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => api.getUserProfile(),
  });

  const currentTimezone = userProfile?.data?.timezone || "UTC";
  const currentTime = new Date().toLocaleString("en-US", {
    timeZone: currentTimezone,
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const formatTimezone = (tz: string) => {
    if (tz === "UTC") return "UTC";

    const parts = tz.split("/");
    if (parts.length === 2) {
      const city = parts[1].replace(/_/g, " ");
      return city;
    }

    return tz;
  };

  if (isLoading) {
    return (
      <div
        className={`flex items-center gap-1 text-xs text-muted-foreground ${className}`}
      >
        <Globe className="h-3 w-3 animate-pulse" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 text-xs text-muted-foreground ${className}`}
    >
      {showLabel && (
        <div className="flex items-center gap-1">
          <Globe className="h-3 w-3" />
          <span>Your timezone:</span>
        </div>
      )}
      <div className="flex items-center gap-1">
        <span className="font-medium text-foreground">
          {formatTimezone(currentTimezone)} (UTC
          {getTimezoneOffset(currentTimezone)})
        </span>
        <span className="text-muted-foreground">•</span>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{currentTime}</span>
        </div>
      </div>
    </div>
  );
}
