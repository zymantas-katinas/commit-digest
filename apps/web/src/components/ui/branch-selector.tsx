"use client";

import * as React from "react";
import { Check, ChevronDown, Search, Loader2, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

export interface Branch {
  name: string;
  commit: {
    sha: string;
  };
}

export interface BranchesApiResponse {
  branches: Branch[];
  pagination: {
    page: number;
    perPage: number;
    hasMore: boolean;
    totalCount?: number;
  };
}

interface BranchSelectorProps {
  // New API - pass repositoryId and component handles everything
  repositoryId?: string;

  // Legacy API - pass branches directly (backward compatibility)
  branches?: Branch[];
  loading?: boolean;
  error?: string | boolean;

  // Common props
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;

  // Optional custom fetch function for testing or different API endpoints
  fetchBranches?: (params: {
    repositoryId: string;
    search?: string;
    page?: number;
    perPage?: number;
  }) => Promise<BranchesApiResponse>;
}

// Hook for fetching branches with React Query
const useBranches = (
  repositoryId: string | undefined,
  searchTerm: string,
  enabled: boolean = true,
  fetchBranches?: (params: {
    repositoryId: string;
    search?: string;
    page?: number;
    perPage?: number;
  }) => Promise<BranchesApiResponse>,
) => {
  const defaultFetchBranches = React.useCallback(
    async (params: {
      repositoryId: string;
      search?: string;
      page?: number;
      perPage?: number;
    }): Promise<BranchesApiResponse> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }

      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append("search", params.search);
      if (params.page) searchParams.append("page", params.page.toString());
      if (params.perPage)
        searchParams.append("perPage", params.perPage.toString());

      const response = await fetch(
        `/api/repositories/${params.repositoryId}/branches?${searchParams}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch branches: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ""}`,
        );
      }

      return response.json();
    },
    [],
  );

  const fetchFunc = fetchBranches || defaultFetchBranches;

  return useQuery({
    queryKey: ["branches", repositoryId, searchTerm || ""],
    queryFn: () =>
      fetchFunc({
        repositoryId: repositoryId!,
        search: searchTerm || undefined,
        page: 1,
        perPage: PER_PAGE,
      }),
    enabled: enabled && !!repositoryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error?.message?.includes("authentication")) return false;
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

const PER_PAGE = 30;
const SEARCH_DEBOUNCE_MS = 300;

export function BranchSelector({
  repositoryId,
  branches: legacyBranches,
  loading: legacyLoading,
  error: legacyError,
  value,
  onValueChange,
  placeholder = "Select a branch",
  disabled = false,
  className,
  fetchBranches: customFetchBranches,
}: BranchSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const searchTimeoutRef = React.useRef<NodeJS.Timeout>();

  // Determine if we're using the new API or legacy API
  const useNewApi = !!repositoryId;
  const isLegacyMode = !useNewApi && legacyBranches;

  // Debounce search term for server-side search
  React.useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Use React Query for fetching branches (new API only)
  const {
    data: branchesData,
    isLoading: isFetching,
    error: fetchError,
  } = useBranches(
    repositoryId,
    debouncedSearchTerm,
    useNewApi && open, // Only fetch when dropdown is open
    customFetchBranches,
  );

  // Select branch list and states based on mode
  const allBranches = isLegacyMode ? legacyBranches : branchesData?.branches;
  const isLoading = isLegacyMode ? !!legacyLoading : isFetching;
  const currentError = isLegacyMode
    ? typeof legacyError === "string"
      ? legacyError
      : legacyError
        ? "Failed to load branches"
        : null
    : fetchError?.message || null;

  const selectedBranch = React.useMemo(
    () => allBranches?.find((branch: Branch) => branch.name === value),
    [allBranches, value],
  );

  // Filter branches for legacy mode (client-side filtering)
  const filteredLegacyBranches = React.useMemo(() => {
    if (!isLegacyMode || !legacyBranches || !searchTerm) {
      return legacyBranches || [];
    }

    return legacyBranches.filter((branch: Branch) =>
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [isLegacyMode, legacyBranches, searchTerm]);

  // For new API mode, we use both client-side and server-side filtering
  // Client-side for instant feedback, server-side for comprehensive search
  const filteredBranches = React.useMemo(() => {
    if (!useNewApi || !allBranches) {
      return allBranches || [];
    }

    // If there's a search term but it's different from debounced term,
    // show instant client-side filtering while server search is pending
    if (searchTerm && searchTerm !== debouncedSearchTerm) {
      return allBranches.filter((branch: Branch) =>
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return allBranches;
  }, [useNewApi, allBranches, searchTerm, debouncedSearchTerm]);

  // Get the final branch list to display
  const displayBranches = isLegacyMode
    ? filteredLegacyBranches
    : filteredBranches;

  // Handle search input
  const handleSearch = React.useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // Handle branch selection
  const handleSelect = React.useCallback(
    (branchName: string) => {
      onValueChange?.(branchName);
      setSearchTerm("");
      setOpen(false);
    },
    [onValueChange],
  );

  // Handle dropdown open/close
  const handleToggleOpen = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault(); // Prevent form submission
      if (disabled) return;
      setOpen((prev) => !prev);
    },
    [disabled],
  );

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  // Clean up search timeout when dropdown closes
  React.useEffect(() => {
    if (!open && searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, [open]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const getFooterText = () => {
    const count = displayBranches?.length || 0;
    const total = useNewApi
      ? branchesData?.pagination.totalCount
      : legacyBranches?.length;

    if (searchTerm) {
      return `${count} branch${count !== 1 ? "es" : ""} matching "${searchTerm}"`;
    }

    if (total !== undefined && useNewApi) {
      return `${count} of ${total} branch${total !== 1 ? "es" : ""}`;
    }

    return `${count} branch${count !== 1 ? "es" : ""}`;
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button" // Prevent form submission
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn(
          "w-full justify-between font-normal",
          !value && "text-muted-foreground",
          currentError && "border-red-500",
          className,
        )}
        disabled={disabled}
        onClick={handleToggleOpen}
      >
        <span className="truncate">
          {selectedBranch ? selectedBranch.name : placeholder}
        </span>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-[9999] mt-1 rounded-md border bg-popover text-popover-foreground shadow-md">
          {/* Search Header */}
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Search branches..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  handleSearch("");
                } else if (e.key === "Enter" && displayBranches?.length > 0) {
                  e.preventDefault();
                  handleSelect(displayBranches[0].name);
                }
              }}
              className="h-8 border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
            {searchTerm && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-muted"
                onClick={() => handleSearch("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Branches List */}
          <div className="max-h-60 overflow-y-auto">
            {currentError ? (
              <div className="p-4 text-sm text-red-600">{currentError}</div>
            ) : (!displayBranches || displayBranches.length === 0) &&
              !isLoading ? (
              <div className="p-4 text-sm text-muted-foreground">
                {searchTerm ? "No branches found" : "No branches available"}
              </div>
            ) : (
              <div className="p-1">
                {displayBranches?.map((branch: Branch) => (
                  <div
                    key={branch.name}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground",
                      value === branch.name &&
                        "bg-accent text-accent-foreground",
                    )}
                    onClick={() => handleSelect(branch.name)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === branch.name ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="truncate" title={branch.name}>
                      {branch.name}
                    </span>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">
                      {searchTerm ? "Searching..." : "Loading branches..."}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {displayBranches && displayBranches.length > 0 && (
            <div className="border-t px-3 py-2 text-xs text-muted-foreground">
              {getFooterText()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
