"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TimezoneSettings } from "@/components/timezone-settings";
import { api } from "@/lib/api";
import { getTimezoneOffset } from "@/lib/timezone-utils";
import { Clock, Globe, Settings } from "lucide-react";

interface TimezoneStatusProps {
  showLabel?: boolean;
  className?: string;
}

export function TimezoneStatus({
  showLabel = true,
  className = "",
}: TimezoneStatusProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

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
    <div className={`flex items-center flex-wrap justify-between ${className}`}>
      <div className="flex items-center flex-wrap gap-2 text-xs text-muted-foreground">
        {showLabel && (
          <div className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            <span>Your timezone:</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <span className="font-medium text-foreground font-mono">
            {formatTimezone(currentTimezone)} (UTC
            {getTimezoneOffset(currentTimezone)})
          </span>
          <span className="text-muted-foreground">•</span>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span className="font-mono">{currentTime}</span>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Timezone Settings
            </DialogTitle>
            <DialogDescription>
              Configure your timezone to ensure scheduled reports are delivered
              at the correct time.
            </DialogDescription>
          </DialogHeader>
          <TimezoneSettings
            showHeader={false}
            onSuccess={() => {
              setDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
