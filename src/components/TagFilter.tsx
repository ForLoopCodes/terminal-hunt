"use client";

import { useState, useRef, useCallback } from "react";

interface Tag {
  id: string;
  name: string;
}

interface TagFilterProps {
  tags: Tag[];
  selectedTag: string;
  onTagSelect: (tagId: string) => void;
}

export function TagFilter({ tags, selectedTag, onTagSelect }: TagFilterProps) {
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchTags = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/tags?search=${encodeURIComponent(query)}&limit=10`
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.tags || []);
      }
    } catch (error) {
      console.error("Error searching tags:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useCallback(
    (query: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        searchTags(query);
      }, 300);
    },
    [searchTags]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handleTagSelectFromSearch = (tag: Tag) => {
    onTagSelect(tag.id);
    setSearchQuery("");
    setSearchResults([]);
    setIsSearchMode(false);
  };

  const toggleSearchMode = () => {
    setIsSearchMode(!isSearchMode);
    if (isSearchMode) {
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  if (isSearchMode) {
    return (
      <div className="space-y-2">
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
            search tags
          </label>
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-2 py-1 focus:outline-none text-sm"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-text)",
              }}
              placeholder="_"
            />
            <button
              onClick={toggleSearchMode}
              className="absolute inset-y-0 right-0 pr-2 flex items-center"
            >
              <span className="text-xs" style={{ color: "var(--color-text)" }}>
                ×
              </span>
            </button>
          </div>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div
            className="max-h-32 overflow-y-auto border"
            style={{
              backgroundColor: "var(--color-primary)",
              borderColor: "var(--color-accent)",
            }}
          >
            {loading ? (
              <div
                className="p-2 text-xs"
                style={{ color: "var(--color-accent)" }}
              >
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleTagSelectFromSearch(tag)}
                  className="w-full px-2 py-1 text-left text-xs hover:bg-opacity-50 focus:outline-none"
                  style={{
                    color: "var(--color-text)",
                    backgroundColor:
                      selectedTag === tag.id
                        ? "var(--color-accent)"
                        : "transparent",
                  }}
                >
                  {tag.name}
                </button>
              ))
            ) : (
              <div
                className="p-2 text-xs"
                style={{ color: "var(--color-accent)" }}
              >
                No tags found
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <span className="mr-2 w-4 text-xs" style={{ color: "var(--color-text)" }}>
        {" "}
      </span>
      <label
        className="text-sm pr-2"
        style={{
          color: "var(--color-text)",
          backgroundColor: "var(--color-primary)",
        }}
      >
        tag
      </label>
      <select
        value={selectedTag}
        onChange={(e) => onTagSelect(e.target.value)}
        className="flex-1 px-2 py-1 focus:outline-none text-sm"
        style={{
          backgroundColor: "var(--color-primary)",
          color: "var(--color-text)",
        }}
      >
        <option value="">all</option>
        {tags.map((tag) => (
          <option key={tag.id} value={tag.id}>
            {tag.name}
          </option>
        ))}
      </select>
      <button
        onClick={toggleSearchMode}
        className="ml-2 px-2 py-1 text-xs focus:outline-none"
        style={{
          color: "var(--color-accent)",
          backgroundColor: "transparent",
        }}
        title="Search tags"
      >
        search
      </button>
    </div>
  );
}
