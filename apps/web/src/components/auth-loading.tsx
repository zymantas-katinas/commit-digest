"use client";

import { useAuthStore } from "@/stores/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function AuthLoading() {
  const { loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return null;
}
