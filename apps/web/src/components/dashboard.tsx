"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { RepositoryList } from "@/components/repository-list";
import { ReportConfigurationList } from "@/components/report-configuration-list";
import { AddRepositoryDialog } from "@/components/add-repository-dialog";
import { AddReportConfigDialog } from "@/components/add-report-config-dialog";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { GitBranch, Settings, LogOut, Plus } from "lucide-react";

export function Dashboard() {
  const [showAddRepo, setShowAddRepo] = useState(false);
  const [showAddConfig, setShowAddConfig] = useState(false);
  const { user, signOut } = useAuthStore();

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

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center mr-3">
              <GitBranch className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">CommitDigest</h1>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Repositories Section - Compact Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
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
          </div>

          {/* Report Configurations Section - Main Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="bg-card rounded-lg border">
              <div className="p-6 border-b border-border">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">Scheduled Reports</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Manage automated report schedules and webhooks
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowAddConfig(true)}
                    size="sm"
                    className="flex items-center self-start sm:self-auto"
                    disabled={!repositories || repositories.length === 0}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Add New Report
                  </Button>
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
