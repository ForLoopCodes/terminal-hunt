"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { SearchBar } from "@/components/SearchBar";
import { TagFilter } from "@/components/TagFilter";
import { AppListItem } from "@/components/AppListItem";
import { TermHuntLogo } from "@/components/TermHuntLogo";
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

// Landing Page Component
function LandingPage() {
  const [topApps, setTopApps] = useState<App[]>([]);
  const [stats, setStats] = useState({
    totalApps: 0,
    totalUsers: 0,
    totalVotes: 0,
  });

  useEffect(() => {
    fetchTopApps();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats");
      const data = await response.json();
      setStats({
        totalApps: data.totalApps || 0,
        totalUsers: data.totalUsers || 0,
        totalVotes: data.totalVotes || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Keep default values on error
    }
  };

  const fetchTopApps = async () => {
    try {
      const response = await fetch("/api/apps?sort=votes&limit=6");
      const data = await response.json();
      setTopApps(data.apps || []);
    } catch (error) {
      console.error("Error fetching top apps:", error);
    }
  };

  return (
    <div className="min-h-screen pt-0">
      {/* Hero Section - Full Screen */}
      <section
        className="min-h-screen flex items-center justify-center relative"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <div className="max-w-6xl mx-auto px-4 text-center z-10">
          <div className="mb-4">
            <TermHuntLogo size="lg" />
          </div>

          <div className="space-y-6 mb-12">
            <h1
              className="text-sm tracking-wide max-w-3xl mx-auto"
              style={{ color: "var(--color-highlight)" }}
            >
              Product Hunt, but for CLI apps.
            </h1>
            <p
              className="text-xs max-w-2xl mx-auto leading-relaxed"
              style={{ color: "var(--color-text)" }}
            >
              The ultimate terminal application discovery platform. Find, share,
              and explore command-line tools built by developers for developers
              who live in the terminal.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto">
            {[
              { label: "apps", value: stats.totalApps },
              { label: "developers", value: stats.totalUsers },
              { label: "votes", value: stats.totalVotes },
            ].map((stat, index) => (
              <div
                key={index}
                className="border border-solid p-4 hover:border-opacity-80 transition-all"
                style={{
                  borderColor: "var(--color-accent)",
                }}
              >
                <div
                  className="text-lg mb-1"
                  style={{ color: "var(--color-highlight)" }}
                >
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-xs" style={{ color: "var(--color-text)" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth/signup"
              className="px-6 py-3 text-xs border border-solid transition-all"
              style={{
                backgroundColor: "var(--color-highlight)",
                color: "var(--color-primary)",
                borderColor: "var(--color-highlight)",
              }}
            >
              start hunting →
            </Link>
            <Link
              href="/leaderboard"
              className="px-6 py-3 text-xs border border-solid transition-all hover:border-opacity-80"
              style={{
                backgroundColor: "transparent",
                color: "var(--color-text)",
                borderColor: "var(--color-accent)",
              }}
            >
              view leaderboard
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div
            className="text-xs animate-bounce"
            style={{ color: "var(--color-accent)" }}
          >
            ↓ scroll to explore
          </div>
        </div>
      </section>

      {/* Top Apps Section - Full Screen */}
      <section
        className="py-20 flex items-center"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <div className="max-w-2xl mx-auto px-4 w-full">
          <div className=" mb-12">
            <h2
              className="text-sm mb-4"
              style={{ color: "var(--color-highlight)" }}
            >
              COMMUNITY FAVORITES
            </h2>
            <p
              className="text-sm max-w-2xl mx-auto"
              style={{ color: "var(--color-text)" }}
            >
              Most loved terminal applications, voted by developers worldwide
            </p>
          </div>

          {topApps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topApps.map((app, index) => (
                <div
                  key={app.id}
                  className="border border-solid p-6 hover:border-opacity-80 transition-all group"
                  style={{
                    backgroundColor: "var(--color-secondary)",
                    borderColor: "var(--color-accent)",
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3
                      className="text-sm group-hover:text-opacity-80 transition-all"
                      style={{ color: "var(--color-highlight)" }}
                    >
                      {app.name}
                    </h3>
                    <div
                      className="text-sm px-2 py-1 border border-solid"
                      style={{
                        color: "var(--color-text)",
                        borderColor: "var(--color-accent)",
                      }}
                    >
                      #{index + 1}
                    </div>
                  </div>

                  <p
                    className="text-sm mb-4 leading-relaxed"
                    style={{ color: "var(--color-text)" }}
                  >
                    {app.shortDescription ||
                      app.description?.slice(0, 120) + "..."}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <div style={{ color: "var(--color-text)" }}>
                      by {app.creatorName}
                    </div>
                    <div
                      className="flex items-center gap-2"
                      style={{ color: "var(--color-accent)" }}
                    >
                      <span>↑ {app.voteCount}</span>
                      <span>👁 {app.viewCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="">
              <div className="text-sm" style={{ color: "var(--color-text)" }}>
                loading favorites...
              </div>
            </div>
          )}

          <div className="mt-12">
            <Link
              href="/apps"
              className="px-6 py-3 text-sm border border-solid transition-all hover:border-opacity-80"
              style={{
                backgroundColor: "transparent",
                color: "var(--color-text)",
                borderColor: "var(--color-accent)",
              }}
            >
              explore all apps →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section - Full Screen */}
      <section
        className="py-20 flex items-center"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <div className="max-w-2xl mx-auto px-4 w-full">
          <h2
            className="text-sm mb-6"
            style={{ color: "var(--color-highlight)" }}
          >
            READY TO HUNT?
          </h2>
          <p
            className="text-sm mb-12 max-w-2xl mx-auto leading-relaxed"
            style={{ color: "var(--color-text)" }}
          >
            Join thousands of developers discovering and sharing the terminal
            tools that power their workflow. Your next favorite command-line
            utility is waiting to be found.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12 max-w-2xl mx-auto">
            <div
              className="border border-solid p-6"
              style={{
                borderColor: "var(--color-accent)",
              }}
            >
              <h3
                className="text-sm mb-3"
                style={{ color: "var(--color-highlight)" }}
              >
                FOR HUNTERS
              </h3>
              <p
                className="text-sm mb-4"
                style={{ color: "var(--color-text)" }}
              >
                Discover new tools, vote on favorites, and build your perfect
                terminal setup
              </p>
              <Link
                href="/auth/signup"
                className="inline-block px-4 py-2 text-sm border border-solid transition-all"
                style={{
                  backgroundColor: "var(--color-highlight)",
                  color: "var(--color-primary)",
                  borderColor: "var(--color-highlight)",
                }}
              >
                START HUNTING
              </Link>
            </div>

            <div
              className="border border-solid p-6"
              style={{
                borderColor: "var(--color-accent)",
              }}
            >
              <h3
                className="text-sm mb-3"
                style={{ color: "var(--color-highlight)" }}
              >
                FOR DEVELOPERS
              </h3>
              <p
                className="text-sm mb-4"
                style={{ color: "var(--color-text)" }}
              >
                Share your creations, get feedback, and help others discover
                your work
              </p>
              <Link
                href="/submit"
                className="inline-block px-4 py-2 text-sm border border-solid transition-all hover:border-opacity-80"
                style={{
                  backgroundColor: "var(--color-highlight)",
                  color: "var(--color-primary)",
                  borderColor: "var(--color-accent)",
                }}
              >
                SUBMIT APP
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-start items-center">
            <Link
              href="/auth/signin"
              className="px-6 py-3 text-sm border border-solid transition-all hover:border-opacity-80"
              style={{
                backgroundColor: "transparent",
                color: "var(--color-text)",
                borderColor: "var(--color-accent)",
              }}
            >
              already have an account? sign in
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Home Page Component (for logged in users)
function HomePage() {
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
  const searchRef = useRef<HTMLInputElement>(null);
  const tagRef = useRef<HTMLSelectElement>(null);

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
        case "s":
          e.preventDefault();
          searchRef.current?.focus();
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {apps.map((app) => (
            <AppListItem key={app.id} app={app} />
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {apps.map((app) => (
          <AppListItem key={app.id} app={app} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <TermHuntLogo size="md" />

            {/* Control Bar */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                <SearchBar ref={searchRef} onSearch={setSearchQuery} />
                <TagFilter
                  ref={tagRef}
                  tags={tags}
                  selectedTag={selectedTag}
                  onTagSelect={setSelectedTag}
                />
              </div>

              {/* Sort and View Options */}
              <div className="flex items-center gap-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.key}
                    ref={
                      option.key === "newest"
                        ? newestRef
                        : option.key === "votes"
                        ? votesRef
                        : viewsRef
                    }
                    onClick={() => setSortBy(option.key)}
                    onFocus={() => setFocusedElement(option.key)}
                    onBlur={() => setFocusedElement(null)}
                    className="px-2 py-1 text-xs font-medium border border-solid transition-colors focus:outline-none"
                    style={{
                      backgroundColor:
                        sortBy === option.key
                          ? "var(--color-highlight)"
                          : "transparent",
                      color:
                        sortBy === option.key
                          ? "var(--color-primary)"
                          : "var(--color-text)",
                      borderColor:
                        focusedElement === option.key
                          ? "var(--color-highlight)"
                          : "var(--color-accent)",
                    }}
                  >
                    <span className="underline">{option.shortcut}</span>
                    <span className="hidden sm:inline">
                      {option.label.slice(1)}
                    </span>
                  </button>
                ))}

                <div className="w-px h-6 bg-current opacity-20 mx-2"></div>

                {viewModes.map((mode) => (
                  <button
                    key={mode.key}
                    onClick={() => setViewMode(mode.key as "grid" | "list")}
                    className="px-2 py-1 text-xs font-medium border border-solid transition-colors focus:outline-none"
                    style={{
                      backgroundColor:
                        viewMode === mode.key
                          ? "var(--color-highlight)"
                          : "transparent",
                      color:
                        viewMode === mode.key
                          ? "var(--color-primary)"
                          : "var(--color-text)",
                      borderColor: "var(--color-accent)",
                    }}
                  >
                    <span className="underline">{mode.shortcut}</span>
                    <span className="hidden sm:inline">
                      {mode.label.slice(1)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stats Bar */}
            <div className="flex ml-6 items-center justify-between">
              <div className="flex items-center space-x-4">
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--color-text)" }}
                >
                  {sortBy} • {viewMode} view • {apps.length} apps
                </span>
              </div>

              <div
                className="flex items-center space-x-2 text-xs"
                style={{ color: "var(--color-accent)" }}
              >
                <span>Shortcuts: N/V/I, G/L, S/T</span>
              </div>
            </div>
          </div>

          {/* Content Area */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <div
                  className="font-mono text-xs"
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
                  className="text-xs block mb-2"
                  style={{ color: "var(--color-highlight)" }}
                >
                  No Apps Found
                </span>
                <span
                  className="text-xs"
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
                  className="inline-block px-2 py-1 font-medium text-xs focus:outline-none"
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

// Main component that switches between landing and home
export default function Page() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-xs" style={{ color: "var(--color-text)" }}>
          loading...
        </div>
      </div>
    );
  }

  return session ? <HomePage /> : <LandingPage />;
}
