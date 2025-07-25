"use client";

import { useState, useEffect, useRef } from "react";
import { TermHuntLogo } from "@/components/TermHuntLogo";
import Link from "next/link";

interface LeaderboardEntry {
  appId: string;
  appName: string;
  appShortDescription?: string;
  appWebsite?: string;
  creatorName: string;
  creatorUserTag: string;
  voteCount?: number;
  viewCount?: number;
}

interface LeaderboardData {
  period: string;
  startDate: string;
  voteLeaderboard: LeaderboardEntry[];
  viewLeaderboard: LeaderboardEntry[];
}

const periods = [
  { key: "daily", label: "Daily", shortcut: "D" },
  { key: "weekly", label: "Weekly", shortcut: "W" },
  { key: "monthly", label: "Monthly", shortcut: "M" },
  { key: "yearly", label: "Yearly", shortcut: "Y" },
];

const sortOptions = [
  { key: "votes", label: "Most Voted", shortcut: "V" },
  { key: "views", label: "Most Viewed", shortcut: "I" },
];

const displayOptions = [
  { key: "grid", label: "Grid View", shortcut: "G" },
  { key: "list", label: "List View", shortcut: "L" },
];

const limitOptions = [
  { key: "10", label: "Top 10" },
  { key: "25", label: "Top 25" },
  { key: "50", label: "Top 50" },
  { key: "100", label: "Top 100" },
];

export default function LeaderboardPage() {
  const [activePeriod, setActivePeriod] = useState("daily");
  const [activeTab, setActiveTab] = useState<"votes" | "views">("votes");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [displayLimit, setDisplayLimit] = useState("25");
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [focusedElement, setFocusedElement] = useState<string | null>(null);

  // Refs for keyboard navigation
  const dailyRef = useRef<HTMLButtonElement>(null);
  const weeklyRef = useRef<HTMLButtonElement>(null);
  const monthlyRef = useRef<HTMLButtonElement>(null);
  const yearlyRef = useRef<HTMLButtonElement>(null);
  const votesTabRef = useRef<HTMLButtonElement>(null);
  const viewsTabRef = useRef<HTMLButtonElement>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore shortcuts when typing in inputs
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA")
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      switch (key) {
        case "d":
          e.preventDefault();
          setActivePeriod("daily");
          dailyRef.current?.focus();
          break;
        case "w":
          e.preventDefault();
          setActivePeriod("weekly");
          weeklyRef.current?.focus();
          break;
        case "m":
          e.preventDefault();
          setActivePeriod("monthly");
          monthlyRef.current?.focus();
          break;
        case "y":
          e.preventDefault();
          setActivePeriod("yearly");
          yearlyRef.current?.focus();
          break;
        case "v":
          e.preventDefault();
          setActiveTab("votes");
          votesTabRef.current?.focus();
          break;
        case "i":
          e.preventDefault();
          setActiveTab("views");
          viewsTabRef.current?.focus();
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
    fetchLeaderboard();
  }, [activePeriod]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/leaderboards/${activePeriod}`);
      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }

      const leaderboardData = await response.json();
      setData(leaderboardData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setError("Failed to load leaderboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderLeaderboardTable = (
    entries: LeaderboardEntry[],
    type: "votes" | "views"
  ) => {
    const limitedEntries = entries.slice(0, parseInt(displayLimit));

    if (limitedEntries.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <span className="text-sm" style={{ color: "var(--color-text)" }}>
              no data available for this period
            </span>
          </div>
        </div>
      );
    }

    if (viewMode === "grid") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {limitedEntries.map((entry, index) => (
            <div
              key={entry.appId}
              className="p-3 border"
              style={{
                borderColor: "var(--color-accent)",
                borderWidth: "1px",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-sm font-bold"
                  style={{
                    color:
                      index === 0
                        ? "var(--color-highlight)"
                        : index === 1
                        ? "var(--color-accent)"
                        : index === 2
                        ? "#ffa500"
                        : "var(--color-text)",
                  }}
                >
                  #{index + 1}
                </span>
                <span
                  className="text-sm px-2 py-1"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-highlight)",
                  }}
                >
                  {type === "votes" ? entry.voteCount : entry.viewCount} {type}
                </span>
              </div>

              <Link
                href={`/app/${entry.appId}`}
                className="block text-sm font-medium mb-2 focus:outline-none hover:underline"
                style={{ color: "var(--color-text)" }}
              >
                {entry.appName}
              </Link>

              <div className="flex flex-col sm:flex-row sm:items-center text-xs space-y-1 sm:space-y-0">
                <span style={{ color: "var(--color-accent)" }}>by </span>
                <Link
                  href={`/profile/${entry.creatorUserTag}`}
                  className="ml-0 sm:ml-1 focus:outline-none hover:underline"
                  style={{ color: "var(--color-text)" }}
                >
                  @{entry.creatorUserTag}
                </Link>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // List view
    return (
      <div className="space-y-1">
        {limitedEntries.map((entry, index) => (
          <div
            key={entry.appId}
            className="p-3 border"
            style={{
              borderColor: "var(--color-accent)",
              borderWidth: "1px",
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2 sm:space-x-4 flex-1 min-w-0">
                <span
                  className="text-sm font-bold w-6 sm:w-8 flex-shrink-0 mt-1"
                  style={{
                    color:
                      index === 0
                        ? "var(--color-highlight)"
                        : index === 1
                        ? "var(--color-accent)"
                        : index === 2
                        ? "#ffa500"
                        : "var(--color-text)",
                  }}
                >
                  #{index + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-2">
                    <Link
                      href={`/app/${entry.appId}`}
                      className="text-sm font-medium focus:outline-none hover:underline"
                      style={{ color: "var(--color-text)" }}
                    >
                      {entry.appName}
                    </Link>
                    {entry.appWebsite && (
                      <a
                        href={entry.appWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs focus:outline-none hover:underline truncate max-w-20 sm:max-w-32"
                        style={{ color: "var(--color-accent)" }}
                        title={entry.appWebsite}
                      >
                        {entry.appWebsite.replace(/^https?:\/\//, "")}
                      </a>
                    )}
                  </div>

                  {entry.appShortDescription && (
                    <div
                      className="text-xs mb-2 leading-relaxed"
                      style={{ color: "var(--color-text-secondary)" }}
                      title={entry.appShortDescription}
                    >
                      {entry.appShortDescription}
                    </div>
                  )}

                  <div className="flex items-center text-xs">
                    <span style={{ color: "var(--color-accent)" }}>by </span>
                    <Link
                      href={`/profile/${entry.creatorUserTag}`}
                      className="ml-1 focus:outline-none hover:underline"
                      style={{ color: "var(--color-text)" }}
                    >
                      @{entry.creatorUserTag}
                    </Link>
                  </div>
                </div>
              </div>

              <span
                className="text-xs sm:text-sm px-2 sm:px-3 py-1 ml-2 sm:ml-4 flex-shrink-0"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-highlight)",
                }}
              >
                {type === "votes" ? entry.voteCount : entry.viewCount} {type}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className="min-h-screen pt-20 pb-8 flex flex-col lg:flex-row"
      style={{ backgroundColor: "var(--color-primary)" }}
    >
      {/* Sidebar */}
      <div className="lg:fixed lg:left-0 lg:top-20 lg:h-[calc(100vh-5rem)] lg:z-40 lg:w-80 w-full lg:block">
        {/* Mobile toggle button */}
        <div
          className="lg:hidden border-b p-4"
          style={{ borderColor: "var(--color-accent)" }}
        >
          <button
            onClick={() => {
              const sidebar = document.getElementById(
                "leaderboard-sidebar-content"
              );
              if (sidebar) {
                sidebar.style.display =
                  sidebar.style.display === "none" ? "block" : "none";
              }
            }}
            className="w-full text-left font-mono text-sm focus:outline-none focus:underline px-2 py-1"
            style={{ color: "var(--color-highlight)" }}
          >
            [±] FILTERS
          </button>
        </div>

        <div
          id="leaderboard-sidebar-content"
          className="lg:block hidden lg:border-none border-b"
          style={{ borderColor: "var(--color-accent)" }}
        >
          <div
            className="p-4 border-b hidden lg:block"
            style={{ borderColor: "var(--color-accent)" }}
          >
            <h2
              className="font-bold text-sm"
              style={{ color: "var(--color-highlight)" }}
            >
              FILTERS
            </h2>
          </div>

          <div className="p-4 space-y-6 overflow-y-auto lg:h-full max-h-96 lg:max-h-none">
            {/* Time Period Section */}
            <div>
              <h3
                className="text-xs font-semibold mb-3 uppercase tracking-wider"
                style={{ color: "var(--color-accent)" }}
              >
                Period
              </h3>
              <div className="grid grid-cols-2 lg:block lg:space-y-2 gap-2">
                {periods.map((period) => (
                  <div key={period.key} className="flex items-center">
                    <span
                      className="mr-2 w-4 text-xs hidden lg:inline"
                      style={{ color: "var(--color-text)" }}
                    >
                      {focusedElement === period.key ? ">" : " "}
                    </span>
                    <button
                      ref={
                        period.key === "daily"
                          ? dailyRef
                          : period.key === "weekly"
                          ? weeklyRef
                          : period.key === "monthly"
                          ? monthlyRef
                          : yearlyRef
                      }
                      onFocus={() => setFocusedElement(period.key)}
                      onBlur={() => setFocusedElement(null)}
                      onClick={() => setActivePeriod(period.key)}
                      className="w-full lg:w-auto px-2 py-1 text-sm font-medium focus:outline-none font-mono"
                      style={{
                        backgroundColor:
                          activePeriod === period.key
                            ? "var(--color-highlight)"
                            : "var(--color-primary)",
                        color:
                          activePeriod === period.key
                            ? "var(--color-primary)"
                            : "var(--color-text)",
                        borderBottom:
                          activePeriod === period.key
                            ? "2px solid var(--color-highlight)"
                            : "2px solid transparent",
                      }}
                    >
                      <span className="underline">{period.shortcut}</span>
                      {period.label.slice(1)}
                    </button>
                  </div>
                ))}
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
              <div className="grid grid-cols-2 lg:block lg:space-y-2 gap-2">
                {sortOptions.map((sort) => (
                  <div key={sort.key} className="flex items-center">
                    <span
                      className="mr-2 w-4 text-xs hidden lg:inline"
                      style={{ color: "var(--color-text)" }}
                    >
                      {focusedElement === sort.key ? ">" : " "}
                    </span>
                    <button
                      ref={sort.key === "votes" ? votesTabRef : viewsTabRef}
                      onFocus={() => setFocusedElement(sort.key)}
                      onBlur={() => setFocusedElement(null)}
                      onClick={() =>
                        setActiveTab(sort.key as "votes" | "views")
                      }
                      className="w-full lg:w-auto px-2 py-1 text-sm font-medium focus:outline-none font-mono"
                      style={{
                        backgroundColor:
                          activeTab === sort.key
                            ? "var(--color-highlight)"
                            : "var(--color-primary)",
                        color:
                          activeTab === sort.key
                            ? "var(--color-primary)"
                            : "var(--color-text)",
                        borderBottom:
                          activeTab === sort.key
                            ? "2px solid var(--color-highlight)"
                            : "2px solid transparent",
                      }}
                    >
                      most {sort.key === "votes" ? "" : "v"}
                      <span className="underline">
                        {sort.key === "votes" ? "v" : "i"}
                      </span>
                      {sort.key === "votes" ? "oted" : "ewed"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Display Options */}
            <div>
              <h3
                className="text-xs font-semibold mb-3 uppercase tracking-wider"
                style={{ color: "var(--color-accent)" }}
              >
                View Mode
              </h3>
              <div className="grid grid-cols-2 lg:block lg:space-y-2 gap-2">
                {displayOptions.map((display) => (
                  <div key={display.key} className="flex items-center">
                    <span
                      className="mr-2 w-4 text-xs hidden lg:inline"
                      style={{ color: "var(--color-text)" }}
                    >
                      {focusedElement === display.key ? ">" : " "}
                    </span>
                    <button
                      onFocus={() => setFocusedElement(display.key)}
                      onBlur={() => setFocusedElement(null)}
                      onClick={() =>
                        setViewMode(display.key as "grid" | "list")
                      }
                      className="w-full lg:w-auto px-2 py-1 text-sm font-medium focus:outline-none font-mono"
                      style={{
                        backgroundColor:
                          viewMode === display.key
                            ? "var(--color-highlight)"
                            : "var(--color-primary)",
                        color:
                          viewMode === display.key
                            ? "var(--color-primary)"
                            : "var(--color-text)",
                        borderBottom:
                          viewMode === display.key
                            ? "2px solid var(--color-highlight)"
                            : "2px solid transparent",
                      }}
                    >
                      <span className="underline">{display.shortcut}</span>
                      {display.label.split(" ")[1]}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Results Limit */}
            <div>
              <h3
                className="text-xs font-semibold mb-3 uppercase tracking-wider"
                style={{ color: "var(--color-accent)" }}
              >
                Results
              </h3>
              <div className="grid grid-cols-2 lg:block lg:space-y-2 gap-2">
                {limitOptions.map((limit) => (
                  <div key={limit.key} className="flex items-center">
                    <span
                      className="mr-2 w-4 text-xs hidden lg:inline"
                      style={{ color: "var(--color-text)" }}
                    >
                      {focusedElement === `limit-${limit.key}` ? ">" : " "}
                    </span>
                    <button
                      onFocus={() => setFocusedElement(`limit-${limit.key}`)}
                      onBlur={() => setFocusedElement(null)}
                      onClick={() => setDisplayLimit(limit.key)}
                      className="w-full lg:w-auto px-2 py-1 text-sm font-medium focus:outline-none font-mono"
                      style={{
                        backgroundColor:
                          displayLimit === limit.key
                            ? "var(--color-highlight)"
                            : "var(--color-primary)",
                        color:
                          displayLimit === limit.key
                            ? "var(--color-primary)"
                            : "var(--color-text)",
                        borderBottom:
                          displayLimit === limit.key
                            ? "2px solid var(--color-highlight)"
                            : "2px solid transparent",
                      }}
                    >
                      {limit.label}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            {data && (
              <div className="p-3">
                <h3
                  className="text-xs font-semibold mb-2 -mx-3 uppercase tracking-wider"
                  style={{ color: "var(--color-accent)" }}
                >
                  Stats
                </h3>
                <div
                  className="text-xs space-y-1 mx-4"
                  style={{ color: "var(--color-text)" }}
                >
                  <div>Period: {formatDate(data.startDate)} - present</div>
                  <div>
                    Total entries:{" "}
                    {activeTab === "votes"
                      ? data.voteLeaderboard.length
                      : data.viewLeaderboard.length}
                  </div>
                  <div>
                    Showing:{" "}
                    {Math.min(
                      parseInt(displayLimit),
                      activeTab === "votes"
                        ? data.voteLeaderboard.length
                        : data.viewLeaderboard.length
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-80 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-6 lg:mb-8">
            <TermHuntLogo size="md" />
            <div className="mt-4 mb-6">
              <h1
                className="text-sm font-bold tracking-wide"
                style={{ color: "var(--color-highlight)" }}
              >
                L E A D E R B O A R D S
              </h1>
            </div>

            {/* Top Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--color-text)" }}
                >
                  {activePeriod} • {activeTab} • {viewMode} view
                </span>
              </div>

              <div
                className="flex items-center space-x-2 text-xs"
                style={{ color: "var(--color-accent)" }}
              >
                <span className="hidden sm:inline">
                  Use keyboard shortcuts: D/W/M/Y, V/I, G/L
                </span>
                <span className="sm:hidden">Shortcuts: D/W/M/Y, V/I, G/L</span>
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
                  loading_leaderboard...
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-24">
              <div className="mb-6">
                <span
                  className="text-sm block mb-2"
                  style={{ color: "var(--color-highlight)" }}
                >
                  Error Loading Data
                </span>
                <span
                  className="text-sm"
                  style={{ color: "var(--color-text)" }}
                >
                  {error}
                </span>
              </div>
              <button
                onFocus={() => setFocusedElement("retry")}
                onBlur={() => setFocusedElement(null)}
                onClick={fetchLeaderboard}
                className="px-2 py-1 font-medium text-sm"
                style={{
                  backgroundColor: "var(--color-highlight)",
                  color: "var(--color-primary)",
                  border:
                    focusedElement === "retry"
                      ? "2px solid var(--color-text)"
                      : "2px solid transparent",
                }}
              >
                retry
              </button>
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Leaderboard Content */}
              {activeTab === "votes"
                ? renderLeaderboardTable(data.voteLeaderboard, "votes")
                : renderLeaderboardTable(data.viewLeaderboard, "views")}

              {/* Pagination */}
              {data && (
                <div className="flex items-center justify-center mt-8 space-x-4">
                  {(activeTab === "votes"
                    ? data.voteLeaderboard.length > parseInt(displayLimit)
                    : data.viewLeaderboard.length > parseInt(displayLimit)) && (
                    <button
                      onClick={() => {
                        const currentEntries =
                          activeTab === "votes"
                            ? data.voteLeaderboard
                            : data.viewLeaderboard;
                        const currentLimit = parseInt(displayLimit);
                        const hasMore = currentEntries.length > currentLimit;
                        if (hasMore) {
                          const nextLimit = Math.min(
                            currentLimit + 25,
                            currentEntries.length
                          );
                          setDisplayLimit(nextLimit.toString());
                        }
                      }}
                      className="px-2 py-1 text-sm font-medium focus:outline-none"
                      style={{
                        backgroundColor: "var(--color-primary)",
                        color: "var(--color-primary)",
                      }}
                    >
                      load more
                    </button>
                  )}

                  <span
                    className="text-xs"
                    style={{ color: "var(--color-text)" }}
                  >
                    showing{" "}
                    {Math.min(
                      parseInt(displayLimit),
                      activeTab === "votes"
                        ? data.voteLeaderboard.length
                        : data.viewLeaderboard.length
                    )}{" "}
                    of{" "}
                    {activeTab === "votes"
                      ? data.voteLeaderboard.length
                      : data.viewLeaderboard.length}
                  </span>

                  {parseInt(displayLimit) > 25 && (
                    <button
                      onClick={() => setDisplayLimit("25")}
                      className="px-4 py-2 text-sm font-medium focus:outline-none"
                      style={{
                        backgroundColor: "var(--color-primary)",
                        color: "var(--color-text)",
                      }}
                    >
                      reset
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
