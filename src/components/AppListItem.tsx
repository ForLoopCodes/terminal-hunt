"use client";

import Link from "next/link";
import { useRef, useEffect } from "react";
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
  // Refs for keyboard navigation
  const appLinkRef = useRef<HTMLAnchorElement>(null);
  const profileLinkRef = useRef<HTMLAnchorElement>(null);
  const websiteLinkRef = useRef<HTMLAnchorElement>(null);

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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle shortcuts when this item is focused or contains focused element
      const activeElement = document.activeElement;
      if (!activeElement) return;

      const itemElement = appLinkRef.current?.closest(".app-list-item");
      if (!itemElement?.contains(activeElement)) return;

      // Ignore shortcuts when typing in inputs
      if (
        activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA"
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      switch (key) {
        case "enter":
          if (activeElement === appLinkRef.current) {
            e.preventDefault();
            appLinkRef.current?.click();
          } else if (activeElement === profileLinkRef.current) {
            e.preventDefault();
            profileLinkRef.current?.click();
          } else if (activeElement === websiteLinkRef.current) {
            e.preventDefault();
            websiteLinkRef.current?.click();
          }
          break;
        case "p":
          if (profileLinkRef.current) {
            e.preventDefault();
            profileLinkRef.current.focus();
          }
          break;
        case "w":
          if (websiteLinkRef.current) {
            e.preventDefault();
            websiteLinkRef.current.focus();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

  const getRankingColor = (index: number) => {
    if (index === 0) return "var(--color-highlight)";
    if (index === 1) return "var(--color-accent)";
    if (index === 2) return "#ffa500";
    return "var(--color-text)";
  };

  return (
    <div
      className={`p-3 border app-list-item ${className}`}
      style={{
        borderColor: "var(--color-accent)",
        borderWidth: "1px",
      }}
      tabIndex={-1}
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
                ref={appLinkRef}
                href={`/app/${normalizedApp.id}`}
                className="text-sm font-medium focus:outline-none focus:underline hover:underline"
                style={{ color: "var(--color-text)" }}
              >
                {normalizedApp.name}
              </Link>
              {normalizedApp.website && (
                <a
                  ref={websiteLinkRef}
                  href={normalizedApp.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs focus:outline-none focus:underline hover:underline truncate max-w-20"
                  style={{ color: "var(--color-accent)" }}
                  title={`${normalizedApp.website} (W)`}
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
                  ref={profileLinkRef}
                  href={`/profile/${normalizedApp.creatorUserTag}`}
                  className="ml-1 focus:outline-none focus:underline hover:underline"
                  style={{ color: "var(--color-text)" }}
                  title={`@${normalizedApp.creatorUserTag} (P)`}
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
