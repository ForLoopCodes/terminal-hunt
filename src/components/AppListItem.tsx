"use client";

import Link from "next/link";
import {
  formatAsciiArt,
  TERMHUNT_ASCII,
  TERMHUNT_TITLE,
} from "@/lib/ascii-utils";

interface AppListItemProps {
  app: {
    id?: string;
    appId?: string; // For leaderboard entries
    name?: string;
    appName?: string; // For leaderboard entries
    shortDescription?: string;
    appShortDescription?: string; // For leaderboard entries
    website?: string;
    appWebsite?: string; // For leaderboard entries
    voteCount?: number;
    viewCount?: number;
    creatorUserTag?: string;
    creatorName?: string;
    asciiArt?: string;
  };
  index?: number;
  showStats?: boolean;
  statsType?: "votes" | "views" | "both";
  showRanking?: boolean;
  className?: string;
}

export function AppListItem({
  app,
  index,
  showStats = true,
  statsType = "both",
  showRanking = false,
  className = "",
}: AppListItemProps) {
  // Normalize the app data to handle different prop names
  const normalizedApp = {
    id: app.id || app.appId || "",
    name: app.name || app.appName || "",
    shortDescription: app.shortDescription || app.appShortDescription || "",
    website: app.website || app.appWebsite || "",
    voteCount: app.voteCount || 0,
    viewCount: app.viewCount || 0,
    creatorUserTag: app.creatorUserTag || "",
    asciiArt: app.asciiArt || "",
  };

  const getRankingColor = (index: number) => {
    if (index === 0) return "var(--color-highlight)";
    if (index === 1) return "var(--color-accent)";
    if (index === 2) return "#ffa500";
    return "var(--color-text)";
  };

  return (
    <div
      className={`p-3 border ${className}`}
      style={{
        borderColor: "var(--color-accent)",
        borderWidth: "1px",
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1 min-w-0">
          {/* Ranking number */}
          {showRanking && typeof index === "number" && (
            <span
              className="text-sm font-bold w-8 flex-shrink-0 mt-1"
              style={{
                color: getRankingColor(index),
              }}
            >
              #{index + 1}
            </span>
          )}

          {/* ASCII Art Preview */}
          {/* <div className="w-16 h-12 flex-shrink-0 mt-1">
            <pre
              className="text-xs leading-none overflow-hidden"
              style={{
                color: "var(--color-accent)",
                fontSize: "6px",
                lineHeight: "1",
              }}
            >
              {normalizedApp.asciiArt
                ? formatAsciiArt(normalizedApp.asciiArt, normalizedApp.name)
                    .split("\n")
                    .slice(0, 8)
                    .join("\n")
                : formatAsciiArt(TERMHUNT_ASCII, normalizedApp.name)
                    .split("\n")
                    .slice(0, 8)
                    .join("\n")}
            </pre>
          </div> */}

          {/* App Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <Link
                href={`/app/${normalizedApp.id}`}
                className="text-sm font-medium focus:outline-none hover:underline"
                style={{ color: "var(--color-text)" }}
              >
                {normalizedApp.name}
              </Link>
              {normalizedApp.website && (
                <a
                  href={normalizedApp.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs focus:outline-none hover:underline truncate max-w-20"
                  style={{ color: "var(--color-accent)" }}
                  title={normalizedApp.website}
                >
                  {normalizedApp.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>

            {normalizedApp.shortDescription && (
              <div
                className="text-xs mb-2 leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
                title={normalizedApp.shortDescription}
              >
                {normalizedApp.shortDescription}
              </div>
            )}

            {normalizedApp.creatorUserTag && (
              <div className="flex items-center text-xs">
                <span style={{ color: "var(--color-accent)" }}>by </span>
                <Link
                  href={`/profile/${normalizedApp.creatorUserTag}`}
                  className="ml-1 focus:outline-none hover:underline"
                  style={{ color: "var(--color-text)" }}
                >
                  @{normalizedApp.creatorUserTag}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        {showStats && (
          <div className="flex items-center space-x-3 flex-shrink-0 ml-4">
            {statsType === "both" ? (
              <div className="flex flex-col items-end space-y-1">
                <span
                  className="text-xs px-2 py-1"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-highlight)",
                  }}
                >
                  {normalizedApp.voteCount} votes
                </span>
                <span
                  className="text-xs px-2 py-1"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-accent)",
                  }}
                >
                  {normalizedApp.viewCount} views
                </span>
              </div>
            ) : (
              <span
                className="text-sm px-3 py-1"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-highlight)",
                }}
              >
                {statsType === "votes"
                  ? normalizedApp.voteCount
                  : normalizedApp.viewCount}{" "}
                {statsType}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
