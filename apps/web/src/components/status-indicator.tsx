"use client";

import { useEffect, useState } from "react";

interface HealthStatus {
  status: "operational" | "degraded" | "down";
  timestamp: string;
  services: {
    database: "operational" | "degraded" | "down";
    api: "operational" | "degraded" | "down";
    scheduler: "operational" | "degraded" | "down";
  };
  uptime: number;
}

export function StatusIndicator() {
  const [status, setStatus] = useState<
    "loading" | "operational" | "degraded" | "down"
  >("loading");
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch("/api/health");
        if (response.ok) {
          const data: HealthStatus = await response.json();
          setStatus(data.status);
          setLastChecked(new Date());
        } else {
          setStatus("degraded");
          setLastChecked(new Date());
        }
      } catch (error) {
        console.error("Health check failed:", error);
        setStatus("down");
        setLastChecked(new Date());
      }
    };

    checkHealth();
    // Check status every 30 seconds
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case "operational":
        return "bg-green-500";
      case "degraded":
        return "bg-yellow-500";
      case "down":
        return "bg-red-500";
      default:
        return "bg-slate-400 animate-pulse";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "operational":
        return "All systems operational";
      case "degraded":
        return "Some systems degraded";
      case "down":
        return "System maintenance";
      default:
        return "Checking status...";
    }
  };

  return (
    <div
      className="flex items-center space-x-2"
      title={
        lastChecked
          ? `Last checked: ${lastChecked.toLocaleTimeString()}`
          : undefined
      }
    >
      <div className={`h-2 w-2 rounded-full ${getStatusColor()}`}></div>
      <span className="text-sm">{getStatusText()}</span>
    </div>
  );
}
