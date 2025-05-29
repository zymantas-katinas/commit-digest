"use client";

import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";

export function AuthStatus() {
  const { user, loading, signOut } = useAuthStore();

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        <span>Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <User className="h-4 w-4" />
        <span>Not authenticated</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt={user.user_metadata?.full_name || user.email}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <User className="h-4 w-4" />
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {user.user_metadata?.full_name || user.email}
          </span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => signOut()}
        className="h-8"
      >
        <LogOut className="h-3 w-3 mr-1" />
        Sign Out
      </Button>
    </div>
  );
}
