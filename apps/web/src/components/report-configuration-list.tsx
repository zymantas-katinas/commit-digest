"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EditReportConfigDialog } from "@/components/edit-report-config-dialog";
import { ManualTriggerDialog } from "@/components/manual-trigger-dialog";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  X,
  Calendar,
  MoreHorizontal,
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
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [editingConfig, setEditingConfig] =
    useState<ReportConfiguration | null>(null);
  const [manualTriggerConfig, setManualTriggerConfig] =
    useState<ReportConfiguration | null>(null);
  const [testResult, setTestResult] = useState<{
    configId: string;
    success: boolean;
    message: string;
    errorType?: string;
    commitsFound?: number;
    tokensUsed?: number;
    costUsd?: number;
  } | null>(null);
  const [manualTriggerResult, setManualTriggerResult] = useState<{
    configId: string;
    success: boolean;
    message: string;
    errorType?: string;
    commitsFound?: number;
    tokensUsed?: number;
    costUsd?: number;
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
      const result = data.data;
      setTestResult({
        configId,
        success: result.success,
        message: result.message,
        errorType: result.errorType,
        commitsFound: result.commitsFound,
        tokensUsed: result.tokensUsed,
        costUsd: result.costUsd,
      });
      setTestingId(null);

      setTimeout(() => setTestResult(null), result.success ? 20000 : 120000);
    },
    onError: (error, configId) => {
      console.error("Test webhook error:", error);
      setTestResult({
        configId,
        success: false,
        message: "Network error: Failed to connect to server",
        errorType: "NETWORK_ERROR",
      });
      setTestingId(null);
      setTimeout(() => setTestResult(null), 20000);
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

  const handleManualTrigger = (config: ReportConfiguration) => {
    setManualTriggerConfig(config);
  };

  const handleManualTriggerSuccess = (result: any) => {
    setManualTriggerResult({
      configId: manualTriggerConfig!.id,
      success: result.success,
      message: result.message,
      errorType: result.errorType,
      commitsFound: result.commitsFound,
      tokensUsed: result.tokensUsed,
      costUsd: result.costUsd,
    });
    setManualTriggerConfig(null);

    // Auto-hide success results after 20 seconds, errors after 2 minutes
    setTimeout(
      () => setManualTriggerResult(null),
      result.success ? 20000 : 120000,
    );

    // Invalidate usage stats query if the manual trigger was successful
    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ["usage-stats"] });
    }
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
                      onClick={() => handleManualTrigger(config)}
                      disabled={
                        testingId === config.id || deletingId === config.id
                      }
                      className="text-purple-400 border-purple-400/20 hover:bg-purple-500/10"
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Manual
                    </Button>

                    {/* Actions Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            testingId === config.id || deletingId === config.id
                          }
                          className="text-muted-foreground hover:bg-muted"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEdit(config)}
                          disabled={
                            testingId === config.id || deletingId === config.id
                          }
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(config.id)}
                          disabled={
                            deletingId === config.id || testingId === config.id
                          }
                          className="text-red-400 focus:text-red-400"
                        >
                          {deletingId === config.id ? (
                            <>
                              <LoadingSpinner size="sm" className="mr-2" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                  <Webhook size={16} className="mr-2" />
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
                  className={`p-4 rounded-lg text-sm border relative ${
                    testResult.success
                      ? "bg-green-900/20 text-green-100 border-green-700/50"
                      : "bg-red-900/20 text-red-100 border-red-700/50"
                  }`}
                >
                  {/* Close button for errors */}
                  {!testResult.success && (
                    <button
                      onClick={() => setTestResult(null)}
                      className="absolute top-2 right-2 p-1 rounded-full hover:bg-red-800/30 transition-colors"
                      title="Close"
                    >
                      <X className="h-4 w-4 text-red-300" />
                    </button>
                  )}

                  <div className="flex items-start space-x-2 pr-8">
                    {testResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium mb-1">
                        {testResult.success ? "Test Successful" : "Test Failed"}
                      </div>
                      <div className="text-sm mb-2 opacity-90">
                        {testResult.message}
                      </div>

                      {/* Additional details for successful tests */}
                      {testResult.success && (
                        <div className="grid grid-cols-2 gap-4 text-xs bg-green-950/30 rounded p-2 mt-2">
                          <div>
                            <span className="font-medium text-green-300">
                              Commits found:
                            </span>{" "}
                            <span className="text-green-100">
                              {testResult.commitsFound || 0}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Error-specific help text */}
                      {!testResult.success && testResult.errorType && (
                        <div className="mt-2 p-2 bg-red-950/30 rounded text-xs">
                          {testResult.errorType === "GITHUB_TOKEN_INVALID" && (
                            <div>
                              <div className="font-medium text-red-300 mb-1">
                                💡 How to fix:
                              </div>
                              <div className="text-red-100">
                                Go to your repository settings and update the
                                GitHub access token with a valid one.
                              </div>
                            </div>
                          )}
                          {testResult.errorType ===
                            "GITHUB_REPOSITORY_NOT_FOUND" && (
                            <div>
                              <div className="font-medium text-red-300 mb-1">
                                💡 How to fix:
                              </div>
                              <div className="text-red-100">
                                Check that the repository URL is correct and the
                                branch exists. Ensure your token has access to
                                this repository.
                              </div>
                            </div>
                          )}
                          {testResult.errorType ===
                            "WEBHOOK_DELIVERY_FAILED" && (
                            <div>
                              <div className="font-medium text-red-300 mb-1">
                                💡 How to fix:
                              </div>
                              <div className="text-red-100">
                                Verify the webhook URL is correct and
                                accessible. Check if the endpoint is online and
                                accepts POST requests.
                              </div>
                            </div>
                          )}
                          {testResult.errorType === "WEBHOOK_ERROR" && (
                            <div>
                              <div className="font-medium text-red-300 mb-1">
                                💡 How to fix:
                              </div>
                              <div className="text-red-100">
                                Check the webhook URL format and ensure the
                                endpoint can receive JSON payloads.
                              </div>
                            </div>
                          )}
                          {testResult.errorType === "NETWORK_ERROR" && (
                            <div>
                              <div className="font-medium text-red-300 mb-1">
                                💡 How to fix:
                              </div>
                              <div className="text-red-100">
                                Check your internet connection and try again. If
                                the problem persists, contact support.
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Manual Trigger Result Display */}
              {manualTriggerResult &&
                manualTriggerResult.configId === config.id && (
                  <div
                    className={`p-4 rounded-lg text-sm border relative ${
                      manualTriggerResult.success
                        ? "bg-purple-900/20 text-purple-100 border-purple-700/50"
                        : "bg-red-900/20 text-red-100 border-red-700/50"
                    }`}
                  >
                    {/* Close button for errors */}
                    {!manualTriggerResult.success && (
                      <button
                        onClick={() => setManualTriggerResult(null)}
                        className="absolute top-2 right-2 p-1 rounded-full hover:bg-red-800/30 transition-colors"
                        title="Close"
                      >
                        <X className="h-4 w-4 text-red-300" />
                      </button>
                    )}

                    <div className="flex items-start space-x-2 pr-8">
                      {manualTriggerResult.success ? (
                        <CheckCircle className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium mb-1">
                          {manualTriggerResult.success
                            ? "Manual Report Generated"
                            : "Manual Report Failed"}
                        </div>
                        <div className="text-sm mb-2 opacity-90">
                          {manualTriggerResult.message}
                        </div>

                        {/* Additional details for successful manual triggers */}
                        {manualTriggerResult.success && (
                          <div className="grid grid-cols-2 gap-4 text-xs bg-purple-950/30 rounded p-2 mt-2">
                            <div>
                              <span className="font-medium text-purple-300">
                                Commits found:
                              </span>{" "}
                              <span className="text-purple-100">
                                {manualTriggerResult.commitsFound || 0}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Error-specific help text for manual triggers */}
                        {!manualTriggerResult.success &&
                          manualTriggerResult.errorType && (
                            <div className="mt-2 p-2 bg-red-950/30 rounded text-xs">
                              {manualTriggerResult.errorType ===
                                "GITHUB_TOKEN_INVALID" && (
                                <div>
                                  <div className="font-medium text-red-300 mb-1">
                                    💡 How to fix:
                                  </div>
                                  <div className="text-red-100">
                                    Go to your repository settings and update
                                    the GitHub access token with a valid one.
                                  </div>
                                </div>
                              )}
                              {manualTriggerResult.errorType ===
                                "GITHUB_REPOSITORY_NOT_FOUND" && (
                                <div>
                                  <div className="font-medium text-red-300 mb-1">
                                    💡 How to fix:
                                  </div>
                                  <div className="text-red-100">
                                    Check that the repository URL is correct and
                                    the branch exists. Ensure your token has
                                    access to this repository.
                                  </div>
                                </div>
                              )}
                              {manualTriggerResult.errorType ===
                                "WEBHOOK_DELIVERY_FAILED" && (
                                <div>
                                  <div className="font-medium text-red-300 mb-1">
                                    💡 How to fix:
                                  </div>
                                  <div className="text-red-100">
                                    Verify the webhook URL is correct and
                                    accessible. Check if the endpoint is online
                                    and accepts POST requests.
                                  </div>
                                </div>
                              )}
                              {manualTriggerResult.errorType ===
                                "USAGE_LIMIT_EXCEEDED" && (
                                <div>
                                  <div className="font-medium text-red-300 mb-1">
                                    💡 How to fix:
                                  </div>
                                  <div className="text-red-100">
                                    You have reached your monthly usage limit.
                                    Wait until next month or upgrade your plan.
                                  </div>
                                </div>
                              )}
                              {manualTriggerResult.errorType ===
                                "INVALID_DATE_RANGE" && (
                                <div>
                                  <div className="font-medium text-red-300 mb-1">
                                    💡 How to fix:
                                  </div>
                                  <div className="text-red-100">
                                    Please select a valid date range (max 31
                                    days) and try again.
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                    </div>
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

      {/* Manual Trigger Dialog */}
      <ManualTriggerDialog
        open={!!manualTriggerConfig}
        onOpenChange={(open) => !open && setManualTriggerConfig(null)}
        configuration={manualTriggerConfig}
        onSuccess={handleManualTriggerSuccess}
      />
    </>
  );
}
