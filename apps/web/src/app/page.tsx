"use client";

import { useAuthStore } from "@/stores/auth";
import { Dashboard } from "@/components/dashboard";
import { AuthForm } from "@/components/auth-form";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Home() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return <Dashboard />;
}
