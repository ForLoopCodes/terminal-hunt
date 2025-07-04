"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface LeaderboardEntry {
  appId: string;
  appName: string;
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
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
];

export default function LeaderboardPage() {
  const [activePeriod, setActivePeriod] = useState("daily");
  const [activeTab, setActiveTab] = useState<"votes" | "views">("votes");
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
    if (entries.length === 0) {
      return (
        <div className="flex items-center justify-center py-8">
          <span
            className="mr-2 w-4 text-xs"
            style={{ color: "var(--color-text)" }}
          >
            {" "}
          </span>
          <span className="text-sm" style={{ color: "var(--color-text)" }}>
            no data available for this period
          </span>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {entries.map((entry, index) => (
          <div key={entry.appId} className="space-y-2">
            <div className="flex items-center">
              <span
                className="mr-2 w-4 text-xs"
                style={{ color: "var(--color-text)" }}
              >
                {" "}
              </span>
              <span
                className="text-sm mr-3"
                style={{
                  color:
                    index === 0
                      ? "var(--color-highlight)"
                      : index === 1
                      ? "var(--color-accent)"
                      : index === 2
                      ? "var(--color-highlight)"
                      : "var(--color-text)",
                }}
              >
                #{index + 1}
                {index === 0
                  ? " 🥇"
                  : index === 1
                  ? " �"
                  : index === 2
                  ? " �"
                  : ""}
              </span>
              <Link
                href={`/app/${entry.appId}`}
                className="text-sm focus:outline-none mr-4"
                style={{ color: "var(--color-text)" }}
              >
                {entry.appName}
              </Link>
              <span
                className="text-sm mr-4"
                style={{ color: "var(--color-text)" }}
              >
                by
              </span>
              <Link
                href={`/profile/${entry.creatorUserTag}`}
                className="text-sm focus:outline-none"
                style={{ color: "var(--color-text)" }}
              >
                @{entry.creatorUserTag}
              </Link>
            </div>

            <div className="flex items-center">
              <span
                className="mr-2 w-4 text-xs"
                style={{ color: "var(--color-text)" }}
              >
                {" "}
              </span>
              <span className="text-xs" style={{ color: "var(--color-text)" }}>
                {type === "votes" ? entry.voteCount : entry.viewCount} {type}
              </span>
            </div>

            {index < entries.length - 1 && (
              <div className="mx-6">
                <div
                  className="h-px"
                  style={{ backgroundColor: "var(--color-accent)" }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className="min-h-screen pt-20 pb-8"
      style={{ backgroundColor: "var(--color-primary)" }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  
  L E A D E R B O A R D S
  `}
          </pre>
        </div>

        <div className="space-y-6 max-w-[650px] mx-auto">
          {/* Period Selection */}
          <div className="space-y-2">
            <div className="flex items-center">
              <span
                className="mr-2 w-4 text-xs"
                style={{ color: "var(--color-text)" }}
              >
                {focusedElement === "daily" || activePeriod === "daily"
                  ? ">"
                  : " "}
              </span>
              <button
                ref={dailyRef}
                onFocus={() => setFocusedElement("daily")}
                onBlur={() => setFocusedElement(null)}
                onClick={() => setActivePeriod("daily")}
                className="text-sm font-medium focus:outline-none focus:ring-none"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-text)",
                }}
              >
                <span className="underline">D</span>aily
              </button>
            </div>
            <div className="flex items-center">
              <span
                className="mr-2 w-4 text-xs"
                style={{ color: "var(--color-text)" }}
              >
                {focusedElement === "weekly" || activePeriod === "weekly"
                  ? ">"
                  : " "}
              </span>
              <button
                ref={weeklyRef}
                onFocus={() => setFocusedElement("weekly")}
                onBlur={() => setFocusedElement(null)}
                onClick={() => setActivePeriod("weekly")}
                className="text-sm font-medium focus:outline-none focus:ring-none"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-text)",
                }}
              >
                <span className="underline">W</span>eekly
              </button>
            </div>
            <div className="flex items-center">
              <span
                className="mr-2 w-4 text-xs"
                style={{ color: "var(--color-text)" }}
              >
                {focusedElement === "monthly" || activePeriod === "monthly"
                  ? ">"
                  : " "}
              </span>
              <button
                ref={monthlyRef}
                onFocus={() => setFocusedElement("monthly")}
                onBlur={() => setFocusedElement(null)}
                onClick={() => setActivePeriod("monthly")}
                className="text-sm font-medium focus:outline-none focus:ring-none"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-text)",
                }}
              >
                <span className="underline">M</span>onthly
              </button>
            </div>
            <div className="flex items-center">
              <span
                className="mr-2 w-4 text-xs"
                style={{ color: "var(--color-text)" }}
              >
                {focusedElement === "yearly" || activePeriod === "yearly"
                  ? ">"
                  : " "}
              </span>
              <button
                ref={yearlyRef}
                onFocus={() => setFocusedElement("yearly")}
                onBlur={() => setFocusedElement(null)}
                onClick={() => setActivePeriod("yearly")}
                className="text-sm font-medium focus:outline-none focus:ring-none"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-text)",
                }}
              >
                <span className="underline">Y</span>early
              </button>
            </div>
          </div>

          {data && (
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
                period
              </label>
              <span className="text-sm" style={{ color: "var(--color-text)" }}>
                {formatDate(data.startDate)} - present
              </span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div
                className="font-mono text-lg"
                style={{ color: "var(--color-text)" }}
              >
                loading_leaderboard...
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="flex items-center justify-center mb-4">
                <span
                  className="mr-2 w-4 text-xs"
                  style={{ color: "var(--color-text)" }}
                >
                  {" "}
                </span>
                <span
                  className="text-sm"
                  style={{ color: "var(--color-highlight)" }}
                >
                  ! {error}
                </span>
              </div>
              <div className="flex items-center justify-center">
                <span
                  className="mr-2 w-4 text-xs"
                  style={{ color: "var(--color-text)" }}
                >
                  {focusedElement === "retry" ? ">" : " "}
                </span>
                <button
                  onFocus={() => setFocusedElement("retry")}
                  onBlur={() => setFocusedElement(null)}
                  onClick={fetchLeaderboard}
                  className="font-medium text-sm focus:outline-none"
                  style={{ color: "var(--color-text)" }}
                >
                  retry
                </button>
              </div>
            </div>
          ) : data ? (
            <>
              {/* Vote/View Tabs */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <span
                    className="mr-2 w-4 text-xs"
                    style={{ color: "var(--color-text)" }}
                  >
                    {focusedElement === "votes" || activeTab === "votes"
                      ? ">"
                      : " "}
                  </span>
                  <button
                    ref={votesTabRef}
                    onFocus={() => setFocusedElement("votes")}
                    onBlur={() => setFocusedElement(null)}
                    onClick={() => setActiveTab("votes")}
                    className="text-sm font-medium focus:outline-none focus:ring-none"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      color: "var(--color-text)",
                    }}
                  >
                    🗳️ Most <span className="underline">V</span>oted
                  </button>
                </div>
                <div className="flex items-center">
                  <span
                    className="mr-2 w-4 text-xs"
                    style={{ color: "var(--color-text)" }}
                  >
                    {focusedElement === "views" || activeTab === "views"
                      ? ">"
                      : " "}
                  </span>
                  <button
                    ref={viewsTabRef}
                    onFocus={() => setFocusedElement("views")}
                    onBlur={() => setFocusedElement(null)}
                    onClick={() => setActiveTab("views")}
                    className="text-sm font-medium focus:outline-none focus:ring-none"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      color: "var(--color-text)",
                    }}
                  >
                    👁️ Most V<span className="underline">i</span>ewed
                  </button>
                </div>
              </div>

              {/* Leaderboard Content */}
              <div className="pt-4">
                {activeTab === "votes"
                  ? renderLeaderboardTable(data.voteLeaderboard, "votes")
                  : renderLeaderboardTable(data.viewLeaderboard, "views")}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
