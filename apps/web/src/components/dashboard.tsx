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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GitBranch className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Git Report
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Repositories Section */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  Repositories
                </h2>
                <Button
                  onClick={() => setShowAddRepo(true)}
                  size="sm"
                  className="flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Repository
                </Button>
              </div>
            </div>
            <div className="p-6">
              {reposLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <RepositoryList
                  repositories={repositories || []}
                  onRefetch={refetchRepos}
                />
              )}
            </div>
          </div>

          {/* Report Configurations Section */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  Report Configurations
                </h2>
                <Button
                  onClick={() => setShowAddConfig(true)}
                  size="sm"
                  variant="outline"
                  className="flex items-center"
                  disabled={!repositories || repositories.length === 0}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Add Configuration
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
