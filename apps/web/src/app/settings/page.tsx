"use client";

import { TimezoneSettings } from "@/components/timezone-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your account preferences and configurations.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <TimezoneSettings
              onSuccess={() => {
                // Show success notification or toast
                console.log("Timezone updated successfully");
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
