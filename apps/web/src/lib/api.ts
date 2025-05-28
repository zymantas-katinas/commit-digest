import axios from "axios";
import { supabase } from "./supabase";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3003";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

// API functions
export const api = {
  // Auth
  getMe: () => apiClient.get("/auth/me"),

  // Repositories
  getRepositories: () => apiClient.get("/repositories"),
  createRepository: (data: {
    githubUrl: string;
    branch: string;
    pat: string;
  }) => apiClient.post("/repositories", data),
  updateRepository: (
    id: string,
    data: {
      githubUrl?: string;
      branch?: string;
      pat?: string;
    },
  ) => apiClient.put(`/repositories/${id}`, data),
  deleteRepository: (id: string) => apiClient.delete(`/repositories/${id}`),

  // Report Configurations
  getReportConfigurations: () => apiClient.get("/report-configurations"),
  createReportConfiguration: (data: {
    name: string;
    repositoryId: string;
    schedule: string;
    webhook_url: string;
    enabled?: boolean;
  }) => apiClient.post("/report-configurations", data),
  getReportConfiguration: (id: string) =>
    apiClient.get(`/report-configurations/${id}`),
  updateReportConfiguration: (
    id: string,
    data: {
      name?: string;
      schedule?: string;
      webhook_url?: string;
      enabled?: boolean;
    },
  ) => apiClient.put(`/report-configurations/${id}`, data),
  deleteReportConfiguration: (id: string) =>
    apiClient.delete(`/report-configurations/${id}`),
  testWebhook: (id: string) =>
    apiClient.post(`/report-configurations/${id}/test`),
  manualTriggerReport: (
    id: string,
    data: { fromDate: string; toDate: string },
  ) => apiClient.post(`/report-configurations/${id}/manual-trigger`, data),

  // Report Runs
  getReportRuns: (params?: { limit?: number; offset?: number }) =>
    apiClient.get("/report-runs", { params }),
  getReportRun: (id: string) => apiClient.get(`/report-runs/${id}`),
  getUsageStats: () => apiClient.get("/report-runs/usage"),
};
