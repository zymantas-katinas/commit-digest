"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { api } from "@/lib/api";
import {
  Trash2,
  Clock,
  Webhook,
  CheckCircle,
  XCircle,
  TestTube,
} from "lucide-react";

interface Repository {
  id: string;
  github_url: string;
  branch: string;
}

interface ReportConfiguration {
  id: string;
  repository_id: string;
  schedule: string;
  webhook_url: string;
  last_run_at?: string;
  last_run_status?: string;
  created_at: string;
}

interface ReportConfigurationListProps {
  configurations: ReportConfiguration[];
  repositories: Repository[];
  onRefetch: () => void;
}

export function ReportConfigurationList({
  configurations,
  repositories,
  onRefetch,
}: ReportConfigurationListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    configId: string;
    success: boolean;
    message: string;
    commitsFound?: number;
  } | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteReportConfiguration(id),
    onSuccess: () => {
      onRefetch();
      setDeletingId(null);
    },
    onError: (error) => {
      console.error("Delete configuration error:", error);
      setDeletingId(null);
    },
  });

  const testMutation = useMutation({
    mutationFn: (id: string) => api.testWebhook(id),
    onSuccess: (data, configId) => {
      setTestResult({
        configId,
        success: data.data.success,
        message: data.data.message,
        commitsFound: data.data.commitsFound,
      });
      setTestingId(null);
      // Clear test result after 5 seconds
      setTimeout(() => setTestResult(null), 10000);
    },
    onError: (error, configId) => {
      setTestResult({
        configId,
        success: false,
        message: "Failed to test webhook",
      });
      setTestingId(null);
      setTimeout(() => setTestResult(null), 10000);
    },
  });

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this configuration?")) {
      setDeletingId(id);
      deleteMutation.mutate(id);
    }
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    setTestResult(null);
    testMutation.mutate(id);
  };

  const getRepositoryName = (repositoryId: string) => {
    const repo = repositories.find((r) => r.id === repositoryId);
    if (!repo) return "Unknown Repository";

    try {
      const match = repo.github_url.match(/github\.com\/([^\/]+\/[^\/]+)/);
      return match ? match[1] : repo.github_url;
    } catch {
      return repo.github_url;
    }
  };

  const getScheduleDisplay = (schedule: string) => {
    switch (schedule) {
      case "0 9 * * *":
        return "Daily at 9:00 AM";
      case "0 9 * * 1":
        return "Weekly on Monday at 9:00 AM";
      default:
        return schedule;
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  if (configurations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No report configurations yet.</p>
        <p className="text-sm mt-2">
          Configure automated reports for your repositories.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {configurations.map((config) => (
        <div key={config.id} className="p-4 border rounded-lg hover:bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">
                {getRepositoryName(config.repository_id)}
              </h3>
              <div className="mt-2 space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {getScheduleDisplay(config.schedule)}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Webhook className="h-4 w-4 mr-2" />
                  {config.webhook_url}
                </div>
                {config.last_run_at && (
                  <div className="flex items-center text-sm text-gray-600">
                    {getStatusIcon(config.last_run_status)}
                    <span className="ml-2">
                      Last run: {new Date(config.last_run_at).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Test Result Display */}
              {testResult && testResult.configId === config.id && (
                <div
                  className={`mt-2 p-2 rounded text-sm ${
                    testResult.success
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  <div className="flex items-center">
                    {testResult.success ? (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    {testResult.message}
                  </div>
                  {testResult.commitsFound !== undefined && (
                    <div className="text-xs mt-1">
                      Found {testResult.commitsFound} commits in the last 7 days
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-gray-500 mt-2">
                Created {new Date(config.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTest(config.id)}
                disabled={testingId === config.id || deletingId === config.id}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                title="Test webhook"
              >
                {testingId === config.id ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <TestTube className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(config.id)}
                disabled={deletingId === config.id || testingId === config.id}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Delete configuration"
              >
                {deletingId === config.id ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
