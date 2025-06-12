"use client";

import * as React from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export interface Branch {
  name: string;
  commit: {
    sha: string;
  };
}

interface BranchSelectorProps {
  branches?: Branch[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  error?: boolean;
  className?: string;
}

export function BranchSelector({
  branches = [],
  value,
  onValueChange,
  placeholder = "Select a branch",
  disabled = false,
  loading = false,
  error = false,
  className,
}: BranchSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filteredBranches, setFilteredBranches] = React.useState<Branch[]>([]);

  React.useEffect(() => {
    try {
      // Defensive programming: ensure branches is an array
      const safeBranches = Array.isArray(branches) ? branches : [];

      if (safeBranches.length === 0) {
        setFilteredBranches([]);
        return;
      }

      if (!searchTerm || !searchTerm.trim()) {
        setFilteredBranches(safeBranches);
        return;
      }

      const filtered = safeBranches.filter((branch) => {
        // Defensive check: ensure branch exists and has a name
        if (!branch || typeof branch.name !== "string") {
          console.warn("Invalid branch object:", branch);
          return false;
        }
        return branch.name.toLowerCase().includes(searchTerm.toLowerCase());
      });

      setFilteredBranches(filtered);
    } catch (error) {
      console.error("Error filtering branches:", error);
      setFilteredBranches([]);
    }
  }, [branches, searchTerm]);

  const selectedBranch = React.useMemo(() => {
    try {
      if (!Array.isArray(branches) || !value) return undefined;
      return branches.find((branch) => branch && branch.name === value);
    } catch (error) {
      console.error("Error finding selected branch:", error);
      return undefined;
    }
  }, [branches, value]);

  const handleSelect = React.useCallback(
    (branchName: string) => {
      try {
        if (typeof branchName === "string" && onValueChange) {
          onValueChange(branchName);
          setOpen(false);
          setSearchTerm("");
        }
      } catch (error) {
        console.error("Error selecting branch:", error);
      }
    },
    [onValueChange],
  );

  const truncateBranchName = React.useCallback(
    (name: string, maxLength: number = 30) => {
      if (!name || typeof name !== "string") return "";
      if (name.length <= maxLength) return name;
      return name.substring(0, maxLength - 3) + "...";
    },
    [],
  );

  const clearSearch = React.useCallback(() => {
    try {
      setSearchTerm("");
    } catch (error) {
      console.error("Error clearing search:", error);
    }
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            error && "border-red-500",
            className,
          )}
          disabled={disabled}
        >
          <span className="truncate">
            {selectedBranch
              ? truncateBranchName(selectedBranch.name)
              : placeholder}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Search branches..."
            value={searchTerm}
            onChange={(e) => {
              try {
                setSearchTerm(e.target.value || "");
              } catch (error) {
                console.error("Error setting search term:", error);
              }
            }}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={clearSearch}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <div className="max-h-60 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <LoadingSpinner size="sm" className="mr-2" />
              <span className="text-sm text-muted-foreground">
                Loading branches...
              </span>
            </div>
          ) : error ? (
            <div className="p-4 text-sm text-red-600">
              Failed to load branches
            </div>
          ) : filteredBranches.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              {searchTerm ? "No branches found" : "No branches available"}
            </div>
          ) : (
            <div className="p-1">
              {filteredBranches.map((branch, index) => {
                // Additional safety check
                if (
                  !branch ||
                  !branch.name ||
                  typeof branch.name !== "string"
                ) {
                  console.warn(
                    "Skipping invalid branch at index:",
                    index,
                    branch,
                  );
                  return null;
                }

                return (
                  <div
                    key={`${branch.name}-${index}`}
                    className={cn(
                      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                      value === branch.name &&
                        "bg-accent text-accent-foreground",
                    )}
                    onClick={() => handleSelect(branch.name)}
                    title={branch.name}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === branch.name ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="truncate">{branch.name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {filteredBranches.length > 0 && Array.isArray(branches) && (
          <div className="border-t p-2 text-xs text-muted-foreground">
            {filteredBranches.length} of {branches.length} branches
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
