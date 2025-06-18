"use client";

import * as React from "react";
import { Check, ChevronDown, Search, Loader2 } from "lucide-react";
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

interface BranchState {
  branches: Branch[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  searchTerm: string;
  totalCount?: number;
  retryCount: number;
  rateLimited: boolean;
  rateLimitResetTime?: number;
}

const INITIAL_STATE: BranchState = {
  branches: [],
  loading: false,
  error: null,
  hasMore: false,
  currentPage: 1,
  searchTerm: "",
  totalCount: undefined,
  retryCount: 0,
  rateLimited: false,
  rateLimitResetTime: undefined,
};

const PER_PAGE = 30;
const SEARCH_DEBOUNCE_MS = 500;
const SCROLL_THROTTLE_MS = 200;
const MAX_RETRIES = 2; // Maximum number of retries for failed requests
const RATE_LIMIT_COOLDOWN_MS = 60000; // 1 minute cooldown after rate limit

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
  const [state, setState] = React.useState<BranchState>(INITIAL_STATE);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const searchTimeoutRef = React.useRef<NodeJS.Timeout>();
  const scrollTimeoutRef = React.useRef<NodeJS.Timeout>();
  const abortControllerRef = React.useRef<AbortController>();

  // Determine if we're using the new API or legacy API
  const useNewApi = !!repositoryId;
  const isLegacyMode = !useNewApi && legacyBranches;

  // Select branch list based on mode
  const currentBranches = isLegacyMode ? legacyBranches : state.branches;
  const currentLoading = isLegacyMode ? !!legacyLoading : state.loading;
  const currentError = isLegacyMode
    ? typeof legacyError === "string"
      ? legacyError
      : legacyError
        ? "Failed to load branches"
        : null
    : state.error;

  const selectedBranch = React.useMemo(
    () => currentBranches?.find((branch) => branch.name === value),
    [currentBranches, value],
  );

  // Default fetch function using the API with proper authentication
  const defaultFetchBranches = React.useCallback(
    async (params: {
      repositoryId: string;
      search?: string;
      page?: number;
      perPage?: number;
      signal?: AbortSignal;
    }): Promise<BranchesApiResponse> => {
      // Get the current session for authentication
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

      // Use /api route which gets rewritten to the actual API by Next.js
      const response = await fetch(
        `/api/repositories/${params.repositoryId}/branches?${searchParams}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          signal: params.signal, // Add abort signal for request cancellation
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

  const fetchBranchesFunc = customFetchBranches || defaultFetchBranches;

  // Load branches function (only for new API)
  const loadBranches = React.useCallback(
    async (page: number = 1, search?: string, append: boolean = false) => {
      if (!useNewApi || state.loading || !repositoryId) return;

      // Check if we're rate limited
      if (state.rateLimited) {
        const now = Date.now();
        if (state.rateLimitResetTime && now < state.rateLimitResetTime) {
          const remainingTime = Math.ceil(
            (state.rateLimitResetTime - now) / 1000,
          );
          setState((prev) => ({
            ...prev,
            error: `Rate limited. Please try again in ${remainingTime} seconds.`,
          }));
          return;
        } else {
          // Reset rate limit state if cooldown period has passed
          setState((prev) => ({
            ...prev,
            rateLimited: false,
            rateLimitResetTime: undefined,
            retryCount: 0,
          }));
        }
      }

      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const result = await fetchBranchesFunc({
          repositoryId,
          search: search?.trim() || undefined,
          page,
          perPage: PER_PAGE,
          signal: abortController.signal,
        });

        // Only update state if this request wasn't cancelled
        if (!abortController.signal.aborted) {
          setState((prev) => ({
            ...prev,
            branches: append
              ? [...prev.branches, ...result.branches]
              : result.branches,
            hasMore: result.pagination.hasMore,
            currentPage: page,
            totalCount: result.pagination.totalCount,
            loading: false,
            retryCount: 0, // Reset retry count on success
          }));
        }
      } catch (error) {
        // Only handle error if request wasn't cancelled
        if (!abortController.signal.aborted) {
          console.error("Error loading branches:", error);

          // Check for rate limit error
          const isRateLimit =
            error instanceof Error &&
            (error.message.includes("rate limit") ||
              error.message.includes("429") ||
              error.message.includes("too many requests"));

          if (isRateLimit) {
            const resetTime = Date.now() + RATE_LIMIT_COOLDOWN_MS;
            setState((prev) => ({
              ...prev,
              error: "Rate limit exceeded. Please try again in a minute.",
              loading: false,
              rateLimited: true,
              rateLimitResetTime: resetTime,
              retryCount: 0,
            }));
            return;
          }

          // Handle other errors with retry logic
          const shouldRetry = state.retryCount < MAX_RETRIES;
          setState((prev) => ({
            ...prev,
            error:
              error instanceof Error
                ? error.message
                : "Failed to load branches",
            loading: false,
            retryCount: shouldRetry ? prev.retryCount + 1 : 0,
          }));

          // Retry the request if we haven't exceeded max retries
          if (shouldRetry) {
            setTimeout(
              () => {
                loadBranches(page, search, append);
              },
              1000 * (state.retryCount + 1),
            ); // Exponential backoff
          }
        }
      }
    },
    [
      repositoryId,
      fetchBranchesFunc,
      state.loading,
      useNewApi,
      state.retryCount,
      state.rateLimited,
      state.rateLimitResetTime,
    ],
  );

  // Filter branches for legacy mode
  const filteredLegacyBranches = React.useMemo(() => {
    if (!isLegacyMode || !legacyBranches || !state.searchTerm) {
      return legacyBranches || [];
    }

    return legacyBranches.filter((branch) =>
      branch.name.toLowerCase().includes(state.searchTerm.toLowerCase()),
    );
  }, [isLegacyMode, legacyBranches, state.searchTerm]);

  // Get the final branch list to display
  const displayBranches = isLegacyMode
    ? filteredLegacyBranches
    : state.branches;

  // Initial load (new API only)
  React.useEffect(() => {
    if (useNewApi && repositoryId && open && state.branches.length === 0) {
      loadBranches(1);
    }
  }, [repositoryId, open, state.branches.length, loadBranches, useNewApi]);

  // Handle search with debouncing
  const handleSearch = React.useCallback(
    (term: string) => {
      setState((prev) => ({ ...prev, searchTerm: term }));

      if (useNewApi) {
        // Clear existing timeout
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }

        // Set new timeout for debounced search
        searchTimeoutRef.current = setTimeout(() => {
          loadBranches(1, term, false);
        }, SEARCH_DEBOUNCE_MS);
      }
      // For legacy mode, search is handled by filteredLegacyBranches memo
    },
    [loadBranches, useNewApi],
  );

  // Handle load more (new API only)
  const handleLoadMore = React.useCallback(() => {
    if (useNewApi && state.hasMore && !state.loading) {
      loadBranches(state.currentPage + 1, state.searchTerm, true);
    }
  }, [
    useNewApi,
    state.hasMore,
    state.loading,
    state.currentPage,
    state.searchTerm,
    loadBranches,
  ]);

  // Handle scroll for infinite loading (new API only)
  const handleScroll = React.useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (!useNewApi) return;

      // Clear existing scroll timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Throttle scroll events
      scrollTimeoutRef.current = setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

        // Load more when scrolled to bottom (with small threshold)
        if (
          scrollHeight - scrollTop <= clientHeight + 10 &&
          state.hasMore &&
          !state.loading
        ) {
          handleLoadMore();
        }
      }, SCROLL_THROTTLE_MS);
    },
    [useNewApi, state.hasMore, state.loading, handleLoadMore],
  );

  // Handle branch selection
  const handleSelect = React.useCallback(
    (branchName: string) => {
      onValueChange?.(branchName);
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

  // Reset state when dropdown closes (but preserve search if actively searching)
  React.useEffect(() => {
    if (!open) {
      // Clear search timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Clear scroll timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Cancel any pending requests when closing
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Only reset search term after a delay to prevent glitchy clearing during typing
      const resetTimeout = setTimeout(() => {
        if (!open) {
          // Double check dropdown is still closed
          setState((prev) => ({ ...prev, searchTerm: "" }));
        }
      }, 100);

      return () => clearTimeout(resetTimeout);
    }
  }, [open]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      // Clear all timeouts
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const getFooterText = () => {
    const count = displayBranches?.length || 0;
    const total = useNewApi ? state.totalCount : legacyBranches?.length;

    if (state.searchTerm) {
      return `${count} branch${count !== 1 ? "es" : ""} matching "${state.searchTerm}"`;
    }

    if (total !== undefined && useNewApi) {
      return `${count} of ${total} branch${total !== 1 ? "es" : ""}`;
    }

    return `${count} branch${count !== 1 ? "es" : ""}${useNewApi && state.hasMore ? " (scroll for more)" : ""}`;
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
              value={state.searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-8 border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
          </div>

          {/* Branches List */}
          <div
            ref={scrollRef}
            className="max-h-60 overflow-y-auto"
            onScroll={handleScroll}
          >
            {currentError ? (
              <div className="p-4 text-sm text-red-600">{currentError}</div>
            ) : (!displayBranches || displayBranches.length === 0) &&
              !currentLoading ? (
              <div className="p-4 text-sm text-muted-foreground">
                {state.searchTerm
                  ? "No branches found"
                  : "No branches available"}
              </div>
            ) : (
              <div className="p-1">
                {displayBranches?.map((branch) => (
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

                {currentLoading && (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">
                      Loading...
                    </span>
                  </div>
                )}

                {useNewApi && state.hasMore && !state.loading && (
                  <div className="p-2">
                    <Button
                      type="button" // Prevent form submission
                      variant="ghost"
                      size="sm"
                      className="w-full h-8 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLoadMore();
                      }}
                    >
                      Load more branches
                    </Button>
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
