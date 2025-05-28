"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EditReportConfigDialog } from "@/components/edit-report-config-dialog";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import {
  Trash2,
  Clock,
  Webhook,
  CheckCircle,
  XCircle,
  FlaskConical,
  Edit,
  GitBranch,
  ExternalLink,
  Settings,
} from "lucide-react";

interface Repository {
  id: string;
  github_url: string;
  branch: string;
}

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
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [editingConfig, setEditingConfig] =
    useState<ReportConfiguration | null>(null);
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

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      api.updateReportConfiguration(id, { enabled }),
    onSuccess: () => {
      onRefetch();
      setTogglingId(null);
    },
    onError: (error) => {
      console.error("Toggle configuration error:", error);
      setTogglingId(null);
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

  const handleEdit = (config: ReportConfiguration) => {
    setEditingConfig(config);
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    setTogglingId(id);
    toggleMutation.mutate({ id, enabled });
  };

  const getRepository = (repositoryId: string) => {
    return repositories.find((r) => r.id === repositoryId);
  };

  const getRepositoryName = (repositoryId: string) => {
    const repo = getRepository(repositoryId);
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
      case "0 9 1 * *":
        return "Monthly on the 1st at 9:00 AM";
      default:
        return schedule;
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "success":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Success
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
    }
  };

  if (configurations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Settings className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium mb-2">No report configurations</h3>
        <p className="text-sm">
          Configure automated reports for your repositories to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {configurations.map((config) => {
          const repo = getRepository(config.repository_id);
          return (
            <div
              key={config.id}
              className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold truncate">
                      {config.name || "Unnamed Configuration"}
                    </h3>
                    {config.last_run_at &&
                      getStatusBadge(config.last_run_status)}
                  </div>

                  {/* Repository Info */}
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
                    <GitBranch className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium truncate">
                      {getRepositoryName(config.repository_id)}
                    </span>
                    <span className="flex-shrink-0">•</span>
                    <span className="bg-muted px-2 py-0.5 rounded-full text-xs flex-shrink-0">
                      {repo?.branch || "unknown"}
                    </span>
                    {repo && (
                      <a
                        href={repo.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                        title="Open in GitHub"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col items-end space-y-3">
                  {/* Enable/Disable Toggle */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.enabled}
                      onCheckedChange={(enabled) =>
                        handleToggle(config.id, enabled)
                      }
                      disabled={togglingId === config.id}
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {config.enabled ? "Active" : "Paused"}
                    </span>
                    {togglingId === config.id && <LoadingSpinner size="sm" />}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTest(config.id)}
                      disabled={
                        testingId === config.id || deletingId === config.id
                      }
                      className="text-blue-400 border-blue-400/20 hover:bg-blue-500/10"
                    >
                      {testingId === config.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <FlaskConical className="h-4 w-4 mr-1" />
                          Test
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(config)}
                      disabled={
                        testingId === config.id || deletingId === config.id
                      }
                      className="text-muted-foreground hover:bg-muted"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(config.id)}
                      disabled={
                        deletingId === config.id || testingId === config.id
                      }
                      className="text-red-400 border-red-400/20 hover:bg-red-500/10"
                    >
                      {deletingId === config.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Configuration Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="font-medium mr-2">Schedule:</span>
                  {getScheduleDisplay(config.schedule)}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Webhook className="h-4 w-4 mr-2" />
                  <span className="font-medium mr-2">Webhook:</span>
                  <span className="truncate">{config.webhook_url}</span>
                </div>
              </div>

              {/* Last Run Info */}
              {config.last_run_at && (
                <div className="bg-muted/50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(config.last_run_status)}
                      <span className="font-medium">Last Run:</span>
                      <span className="text-muted-foreground">
                        {new Date(config.last_run_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Test Result Display */}
              {testResult && testResult.configId === config.id && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    testResult.success
                      ? "bg-green-500/10 text-green-500 border border-green-500/20"
                      : "bg-red-500/10 text-red-500 border border-red-500/20"
                  }`}
                >
                  <div className="flex items-center">
                    {testResult.success ? (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    <span className="font-medium">{testResult.message}</span>
                  </div>
                  {testResult.commitsFound !== undefined && (
                    <div className="text-xs mt-1 ml-6 opacity-80">
                      Found {testResult.commitsFound} commits in the last 7 days
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border">
                Created {new Date(config.created_at).toLocaleDateString()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <EditReportConfigDialog
        open={!!editingConfig}
        onOpenChange={(open) => !open && setEditingConfig(null)}
        configuration={editingConfig}
        onSuccess={() => {
          onRefetch();
          setEditingConfig(null);
        }}
      />
    </>
  );
}
