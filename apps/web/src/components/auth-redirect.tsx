"use client";

import { useAuthStore } from "@/stores/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthRedirect() {
  const { user, loading } = useAuthStore();
  const path = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && (path === "/" || path === "/login")) {
      router.push("/dashboard");
    }
  }, [user, loading, router, path]);

  // This component doesn't render anything visible
  return null;
}
