"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth";
import { PostHogProvider } from "./PostHogProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
    setMounted(true);
  }, [initialize]);

  if (!mounted) {
    return null;
  }

  return (
    <PostHogProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </PostHogProvider>
  );
}