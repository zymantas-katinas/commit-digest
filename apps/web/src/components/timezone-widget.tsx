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
import { Card, CardContent } from "@/components/ui/card";
import { TimezoneSettings } from "@/components/timezone-settings";
import { api } from "@/lib/api";
import { getTimezoneOffset } from "@/lib/timezone-utils";
import { Clock, Globe, Settings } from "lucide-react";

export function TimezoneWidget() {
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
      const region = parts[0];
      const city = parts[1].replace(/_/g, " ");

      const regionMap: { [key: string]: string } = {
        America: "🇺🇸",
        Europe: "🇪🇺",
        Asia: "🌏",
        Australia: "🇦🇺",
        Africa: "🌍",
        Pacific: "🌊",
      };

      const flag = regionMap[region] || "🌍";
      return `${flag} ${city}`;
    }

    return tz;
  };

  if (isLoading) {
    return (
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-green-600 animate-pulse" />
            <span className="text-sm text-muted-foreground">
              Loading timezone...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-600" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {formatTimezone(currentTimezone)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    UTC{getTimezoneOffset(currentTimezone)}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {currentTime}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                title="Change timezone"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Timezone Settings
                </DialogTitle>
                <DialogDescription>
                  Configure your timezone to ensure scheduled reports are
                  delivered at the correct time.
                </DialogDescription>
              </DialogHeader>
              <TimezoneSettings
                onSuccess={() => {
                  setDialogOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
