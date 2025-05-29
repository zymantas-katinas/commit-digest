"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { RepositoryList } from "@/components/repository-list";
import { ReportConfigurationList } from "@/components/report-configuration-list";
import { AddRepositoryDialog } from "@/components/add-repository-dialog";
import { AddReportConfigDialog } from "@/components/add-report-config-dialog";
import { UsageStats } from "@/components/usage-stats";
import { AppHeader } from "@/components/app-header";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { Settings, Plus, AlertCircle } from "lucide-react";

export function Dashboard() {
  const [showAddRepo, setShowAddRepo] = useState(false);
  const [showAddConfig, setShowAddConfig] = useState(false);
  const { user } = useAuthStore();

  const {
    data: repositories,
    isLoading: reposLoading,
    refetch: refetchRepos,
  } = useQuery({
    queryKey: ["repositories"],
    queryFn: () => api.getRepositories().then((res) => res.data),
  });

  const {
    data: reportConfigs,
    isLoading: configsLoading,
    refetch: refetchConfigs,
  } = useQuery({
    queryKey: ["report-configurations"],
    queryFn: () => api.getReportConfigurations().then((res) => res.data),
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader />

      {/* Main Content */}
      <main className="container max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Usage Statistics - Top on mobile only */}
        <div className="lg:hidden mb-6">
          <UsageStats />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Repositories Section - Compact Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1 space-y-4">
            <div className="bg-card rounded-lg border border-l-4 border-l-blue-500">
              <div className="p-4 border-b bg-muted/30">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-medium text-blue-400 uppercase tracking-wide">
                    Repositories
                  </h2>
                  <Button
                    onClick={() => setShowAddRepo(true)}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                    title="Add Repository"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-3">
                {reposLoading ? (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner size="sm" />
                  </div>
                ) : (
                  <RepositoryList
                    repositories={repositories || []}
                    onRefetch={refetchRepos}
                  />
                )}
              </div>
            </div>

            {/* Usage Statistics - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:block">
              <UsageStats />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {/* Email Verification Notice */}
            {!user?.email_confirmed_at && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <div>
                    <h3 className="text-sm font-medium text-amber-800">
                      Email Verification Required
                    </h3>
                    <p className="text-sm text-amber-700 mt-1">
                      Please verify your email address to create scheduled
                      reports. Check your inbox for a verification link.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Report Configurations Section */}
            <div className="bg-card rounded-lg border">
              <div className="p-6 border-b border-border">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">Scheduled Reports</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Manage automated report schedules and webhooks
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      onClick={() => setShowAddConfig(true)}
                      size="sm"
                      className="flex items-center self-start sm:self-auto"
                      disabled={
                        !repositories ||
                        repositories.length === 0 ||
                        !user?.email_confirmed_at
                      }
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Add New Report
                    </Button>

                    {/* Helper text when button is disabled */}
                    {(!repositories || repositories.length === 0) && (
                      <p className="text-xs text-muted-foreground text-right">
                        Add a repository first to create reports
                      </p>
                    )}

                    {repositories &&
                      repositories.length > 0 &&
                      !user?.email_confirmed_at && (
                        <p className="text-xs text-amber-600 text-right">
                          Please verify your email to create reports
                        </p>
                      )}
                  </div>
                </div>
              </div>
              <div className="p-6">
                {configsLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <ReportConfigurationList
                    configurations={reportConfigs || []}
                    repositories={repositories || []}
                    onRefetch={refetchConfigs}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <AddRepositoryDialog
        open={showAddRepo}
        onOpenChange={setShowAddRepo}
        onSuccess={() => {
          refetchRepos();
          setShowAddRepo(false);
        }}
      />

      <AddReportConfigDialog
        open={showAddConfig}
        onOpenChange={setShowAddConfig}
        repositories={repositories || []}
        onSuccess={() => {
          refetchConfigs();
          setShowAddConfig(false);
        }}
      />
    </div>
  );
}
