"use client";

import { useState, useCallback, useRef, forwardRef } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  function SearchBar({ onSearch }, ref) {
    const [query, setQuery] = useState("");
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Simple debounce implementation
    const debouncedSearch = useCallback(
      (searchQuery: string) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          onSearch(searchQuery);
        }, 300);
      },
      [onSearch]
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      debouncedSearch(value);
    };

    const handleClear = () => {
      setQuery("");
      onSearch("");
    };

    return (
      <div className="flex items-center">
        <span
          className="mr-2 w-4 text-xs"
          style={{ color: "var(--color-text)" }}
        >
          {" "}
        </span>
        <label
          className="text-sm pr-2"
          style={{
            color: "var(--color-text)",
            backgroundColor: "var(--color-primary)",
          }}
        >
          <span className="underline">s</span>earch
        </label>
        <div className="flex-1 relative">
          <input
            ref={ref}
            type="text"
            value={query}
            onChange={handleChange}
            className="w-full px-2 py-1 focus:outline-none text-sm"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-text)",
            }}
            placeholder="_"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-2 flex items-center"
            >
              <span className="text-xs" style={{ color: "var(--color-text)" }}>
                ×
              </span>
            </button>
          )}
        </div>
      </div>
    );
  }
);
