"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CollectionsModal } from "./CollectionsModal";

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

interface AppCardProps {
  app: App;
}

export function AppCard({ app }: AppCardProps) {
  const { data: session } = useSession();
  const [voteCount, setVoteCount] = useState(app.voteCount);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [showCollectionsModal, setShowCollectionsModal] = useState(false);

  // Check vote status on mount
  useEffect(() => {
    if (session) {
      checkVoteStatus();
    }
  }, [session, app.id]);

  const checkVoteStatus = async () => {
    try {
      const response = await fetch(`/api/apps/${app.id}/vote-status`);
      if (response.ok) {
        const data = await response.json();
        setHasVoted(data.hasVoted);
        setVoteCount(data.voteCount);
      }
    } catch (error) {
      console.error("Error checking vote status:", error);
    }
  };

  const handleVote = async () => {
    if (!session || isVoting) return;

    setIsVoting(true);
    try {
      // Use POST for toggle voting (the API handles the logic)
      const response = await fetch(`/api/apps/${app.id}/vote`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setHasVoted(data.voted);
        setVoteCount(data.voteCount);
      } else {
        const errorData = await response.json();
        console.error("Voting error:", errorData.error);
      }
    } catch (error) {
      console.error("Error voting:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleDownvote = async () => {
    if (!session || isVoting || !hasVoted) return;

    setIsVoting(true);
    try {
      const response = await fetch(`/api/apps/${app.id}/vote`, {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        setHasVoted(data.voted);
        setVoteCount(data.voteCount);
      } else {
        const errorData = await response.json();
        console.error("Downvote error:", errorData.error);
      }
    } catch (error) {
      console.error("Error downvoting:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleView = async () => {
    try {
      await fetch(`/api/apps/${app.id}/view`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Error logging view:", error);
    }
  };

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <span
          className="mr-2 w-4 text-xs"
          style={{ color: "var(--color-text)" }}
        >
          {" "}
        </span>
        <Link
          href={`/app/${app.id}`}
          onClick={handleView}
          className="text-sm focus:outline-none font-semibold"
          style={{ color: "var(--color-text)" }}
        >
          {app.name}
        </Link>
        {session && (
          <>
            <span
              className="mx-2 text-xs"
              style={{ color: "var(--color-text)" }}
            >
              •
            </span>
            <div className="flex items-center space-x-1">
              <button
                onClick={handleVote}
                disabled={isVoting}
                className="text-xs font-medium focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  color: hasVoted
                    ? "var(--color-highlight)"
                    : "var(--color-text)",
                }}
                title={hasVoted ? "Remove vote" : "Vote"}
              >
                {hasVoted ? "↓" : "↑"}
              </button>
              <span className="text-xs" style={{ color: "var(--color-text)" }}>
                {voteCount}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="flex items-start">
        <span
          className="mr-2 w-4 text-xs mt-1"
          style={{ color: "var(--color-text)" }}
        >
          {" "}
        </span>
        <div className="flex-1">
          <p className="text-sm mb-1" style={{ color: "var(--color-text)" }}>
            {truncateDescription(app.shortDescription || app.description)}
          </p>
          <div className="flex items-center space-x-2 text-xs">
            <span style={{ color: "var(--color-text)" }}>by</span>
            <Link
              href={`/profile/${app.creatorUserTag}`}
              className="focus:outline-none"
              style={{ color: "var(--color-text)" }}
            >
              @{app.creatorUserTag}
            </Link>
            <span style={{ color: "var(--color-text)" }}>•</span>
            <span style={{ color: "var(--color-text)" }}>
              {app.viewCount} views
            </span>
            <span style={{ color: "var(--color-text)" }}>•</span>
            <span style={{ color: "var(--color-text)" }}>
              {new Date(app.createdAt).toLocaleDateString()}
            </span>
            <span style={{ color: "var(--color-text)" }}>•</span>
            <a
              href={app.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="focus:outline-none"
              style={{ color: "var(--color-text)" }}
            >
              repo
            </a>
            {app.website && (
              <>
                <span style={{ color: "var(--color-text)" }}>•</span>
                <a
                  href={app.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus:outline-none"
                  style={{ color: "var(--color-text)" }}
                >
                  site
                </a>
              </>
            )}
            {session && (
              <>
                <span style={{ color: "var(--color-text)" }}>•</span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowCollectionsModal(true);
                  }}
                  className="focus:outline-none"
                  style={{ color: "var(--color-text)" }}
                  title="Add to collection"
                >
                  +collection
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Collections Modal */}
      <CollectionsModal
        isOpen={showCollectionsModal}
        onClose={() => setShowCollectionsModal(false)}
        appId={app.id}
        appName={app.name}
      />
    </div>
  );
}
