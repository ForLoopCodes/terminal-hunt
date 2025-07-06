"use client";

import { useState, useEffect, useRef } from "react";
import { AppCard } from "@/components/AppCard";
import { SearchBar } from "@/components/SearchBar";
import { TagFilter } from "@/components/TagFilter";
import Link from "next/link";

interface App {
  id: string;
  name: string;
  shortDescription?: string;
  description: string;
  website?: string;
  installCommands: string;
  repoUrl: string;
  viewCount: number;
  createdAt: string;
  creatorName: string;
  creatorUserTag: string;
  voteCount: number;
}

interface Tag {
  id: string;
  name: string;
}

const sortOptions = [
  { key: "newest", label: "Newest", shortcut: "N" },
  { key: "votes", label: "Most Voted", shortcut: "V" },
  { key: "views", label: "Most Viewed", shortcut: "I" },
];

const viewModes = [
  { key: "grid", label: "Grid View", shortcut: "G" },
  { key: "list", label: "List View", shortcut: "L" },
];

export default function Home() {
  const [apps, setApps] = useState<App[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedTag, setSelectedTag] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [focusedElement, setFocusedElement] = useState<string | null>(null);

  // Refs for keyboard navigation
  const newestRef = useRef<HTMLButtonElement>(null);
  const votesRef = useRef<HTMLButtonElement>(null);
  const viewsRef = useRef<HTMLButtonElement>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore shortcuts when typing in inputs
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.tagName === "SELECT")
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      switch (key) {
        case "n":
          e.preventDefault();
          setSortBy("newest");
          newestRef.current?.focus();
          break;
        case "v":
          e.preventDefault();
          setSortBy("votes");
          votesRef.current?.focus();
          break;
        case "i":
          e.preventDefault();
          setSortBy("views");
          viewsRef.current?.focus();
          break;
        case "g":
          e.preventDefault();
          setViewMode("grid");
          break;
        case "l":
          e.preventDefault();
          setViewMode("list");
          break;
        case "escape":
          e.preventDefault();
          setFocusedElement(null);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

  useEffect(() => {
    fetchApps();
    fetchTags();
  }, [sortBy, selectedTag, searchQuery]);

  const fetchApps = async () => {
    try {
      const params = new URLSearchParams();
      if (sortBy) params.append("sort", sortBy);
      if (selectedTag) params.append("tag", selectedTag);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/apps?${params}`);
      const data = await response.json();
      setApps(data.apps || []);
    } catch (error) {
      console.error("Error fetching apps:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags");
      const data = await response.json();
      setTags(data.tags || []);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const renderAppsGrid = () => {
    if (viewMode === "grid") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {apps.map((app) => (
            <div
              key={app.id}
              className="p-2 border"
              style={{
                borderColor: "var(--color-accent)",
                borderWidth: "1px",
              }}
            >
              <AppCard app={app} />
            </div>
          ))}
        </div>
      );
    }

    // List view - leaderboard style
    return (
      <div className="space-y-1">
        {apps.map((app, index) => (
          <div
            key={app.id}
            className="p-2 px-3 border"
            style={{
              borderColor: "var(--color-accent)",
              borderWidth: "1px",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <span
                  className="text-sm font-bold w-12"
                  style={{ color: "var(--color-text)" }}
                >
                  #{index + 1}
                </span>

                <Link
                  href={`/app/${app.id}`}
                  className="text-sm font-medium focus:outline-none flex-1"
                  style={{ color: "var(--color-text)" }}
                >
                  {app.name}
                </Link>

                <div className="flex items-center text-xs">
                  <span style={{ color: "var(--color-accent)" }}>by </span>
                  <Link
                    href={`/profile/${app.creatorUserTag}`}
                    className="ml-1 focus:outline-none"
                    style={{ color: "var(--color-text)" }}
                  >
                    @{app.creatorUserTag}
                  </Link>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span
                  className="text-sm px-3 py-1"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-highlight)",
                  }}
                >
                  {app.voteCount} votes
                </span>
                <span
                  className="text-sm px-3 py-1"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-accent)",
                  }}
                >
                  {app.viewCount} views
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className="min-h-screen pt-20 pb-8 flex"
      style={{ backgroundColor: "var(--color-primary)" }}
    >
      {/* Sidebar */}
      <div className="fixed left-0 top-20 h-[calc(100vh-5rem)] z-40 w-80">
        <div
          className="p-4 border-b"
          style={{ borderColor: "var(--color-accent)" }}
        >
          <h2
            className="font-bold text-sm"
            style={{ color: "var(--color-highlight)" }}
          >
            FILTERS
          </h2>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto h-full">
          {/* Search and Filters Section */}
          <div>
            <h3
              className="text-xs font-semibold mb-3 uppercase tracking-wider"
              style={{ color: "var(--color-accent)" }}
            >
              Search & Filters
            </h3>
            <div className="space-y-3">
              <SearchBar onSearch={setSearchQuery} />
              <TagFilter
                tags={tags}
                selectedTag={selectedTag}
                onTagSelect={setSelectedTag}
              />
            </div>
          </div>

          {/* Sort By Section */}
          <div>
            <h3
              className="text-xs font-semibold mb-3 uppercase tracking-wider"
              style={{ color: "var(--color-accent)" }}
            >
              Sort By
            </h3>
            <div className="space-y-2">
              {sortOptions.map((sort) => (
                <div key={sort.key} className="flex items-center">
                  <span
                    className="mr-2 w-4 text-xs"
                    style={{ color: "var(--color-text)" }}
                  >
                    {focusedElement === sort.key ? ">" : " "}
                  </span>
                  <button
                    ref={
                      sort.key === "newest"
                        ? newestRef
                        : sort.key === "votes"
                        ? votesRef
                        : viewsRef
                    }
                    onFocus={() => setFocusedElement(sort.key)}
                    onBlur={() => setFocusedElement(null)}
                    onClick={() => setSortBy(sort.key)}
                    className="px-2 py-1 text-sm font-medium focus:outline-none font-mono"
                    style={{
                      backgroundColor:
                        sortBy === sort.key
                          ? "var(--color-highlight)"
                          : "var(--color-primary)",
                      color:
                        sortBy === sort.key
                          ? "var(--color-primary)"
                          : "var(--color-text)",
                      borderBottom:
                        sortBy === sort.key
                          ? "2px solid var(--color-highlight)"
                          : "2px solid transparent",
                    }}
                  >
                    <span className="underline">{sort.shortcut}</span>
                    {sort.label.slice(1).toLowerCase()}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* View Mode Section */}
          <div>
            <h3
              className="text-xs font-semibold mb-3 uppercase tracking-wider"
              style={{ color: "var(--color-accent)" }}
            >
              View Mode
            </h3>
            <div className="space-y-2">
              {viewModes.map((view) => (
                <div key={view.key} className="flex items-center">
                  <span
                    className="mr-2 w-4 text-xs"
                    style={{ color: "var(--color-text)" }}
                  >
                    {focusedElement === view.key ? ">" : " "}
                  </span>
                  <button
                    onFocus={() => setFocusedElement(view.key)}
                    onBlur={() => setFocusedElement(null)}
                    onClick={() => setViewMode(view.key as "grid" | "list")}
                    className="px-2 py-1 text-sm font-medium focus:outline-none font-mono"
                    style={{
                      backgroundColor:
                        viewMode === view.key
                          ? "var(--color-highlight)"
                          : "var(--color-primary)",
                      color:
                        viewMode === view.key
                          ? "var(--color-primary)"
                          : "var(--color-text)",
                      borderBottom:
                        viewMode === view.key
                          ? "2px solid var(--color-highlight)"
                          : "2px solid transparent",
                    }}
                  >
                    <span className="underline">{view.shortcut}</span>
                    {view.label.split(" ")[1].toLowerCase()}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3
              className="text-xs font-semibold mb-3 uppercase tracking-wider"
              style={{ color: "var(--color-accent)" }}
            >
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link
                href="/submit"
                className="block px-2 py-1 text-sm font-medium focus:outline-none font-mono"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-text)",
                }}
              >
                submit app
              </Link>
              <Link
                href="/leaderboard"
                className="block px-2 py-1 text-sm font-medium focus:outline-none font-mono"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-text)",
                }}
              >
                leaderboards
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="p-3">
            <h3
              className="text-xs font-semibold mb-2 uppercase tracking-wider"
              style={{ color: "var(--color-accent)" }}
            >
              Stats
            </h3>
            <div
              className="text-xs space-y-1"
              style={{ color: "var(--color-text)" }}
            >
              <div>Total apps: {apps.length}</div>
              <div>Available tags: {tags.length}</div>
              <div>Sort: {sortBy}</div>
              <div>View: {viewMode}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-80">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <pre
              className="text-xs md:text-sm whitespace-pre-wrap font-semibold mb-6"
              style={{ color: "var(--color-accent)" }}
            >
              {`
 ___                                   ___                      ___      
(   )                                 (   )                    (   )     
 | |_     .--.  ___ .-.  ___ .-. .-.   | | .-. ___  ___ ___ .-. | |_     
(   __)  /    \\(   )   \\(   )   '   \\  | |/   (   )(   |   )   (   __)   
 | |    |  .-. ;| ' .-. ;|  .-.  .-. ; |  .-. .| |  | | |  .-. .| |      
 | | ___|  | | ||  / (___) |  | |  | | | |  | || |  | | | |  | || | ___  
 | |(   )  |/  || |      | |  | |  | | | |  | || |  | | | |  | || |(   ) 
 | | | ||  ' _.'| |      | |  | |  | | | |  | || |  | | | |  | || | | |  
 | ' | ||  .'.-.| |      | |  | |  | | | |  | || |  ; ' | |  | || ' | |  
 ' \`-' ;'  \`-' /| |      | |  | |  | | | |  | |' \`-'  / | |  | |' \`-' ;  
  \`.__.  \`.__.'(___)    (___)(___)(___|___)(___)'.__.' (___)(___)\`.__.   
                  
  D I S C O V E R   W I L D   T E R M I N A L   A P P S
  `}
            </pre>

            {/* Top Action Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--color-text)" }}
                >
                  {sortBy} • {viewMode} view • {apps.length} apps
                </span>
              </div>

              <div
                className="flex items-center space-x-2 text-xs"
                style={{ color: "var(--color-accent)" }}
              >
                <span>Use keyboard shortcuts: N/V/I, G/L</span>
              </div>
            </div>
          </div>

          {/* Content Area */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <div
                  className="font-mono text-sm"
                  style={{ color: "var(--color-text)" }}
                >
                  loading_apps...
                </div>
              </div>
            </div>
          ) : apps.length === 0 ? (
            <div className="text-center py-24">
              <div className="mb-6">
                <span
                  className="text-sm block mb-2"
                  style={{ color: "var(--color-highlight)" }}
                >
                  No Apps Found
                </span>
                <span
                  className="text-sm"
                  style={{ color: "var(--color-text)" }}
                >
                  {searchQuery || selectedTag
                    ? "Try adjusting your filters or search query"
                    : "Be the first to submit a terminal app!"}
                </span>
              </div>
              {!searchQuery && !selectedTag && (
                <Link
                  href="/submit"
                  className="inline-block px-6 py-3 font-medium text-sm focus:outline-none"
                  style={{
                    backgroundColor: "var(--color-highlight)",
                    color: "var(--color-primary)",
                    border: "2px solid var(--color-highlight)",
                  }}
                >
                  submit first app
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">{renderAppsGrid()}</div>
          )}
        </div>
      </div>
    </div>
  );
}
