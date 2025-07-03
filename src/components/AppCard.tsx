"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";

interface App {
  id: string;
  name: string;
  description: string;
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

  const handleVote = async () => {
    if (!session || isVoting) return;

    setIsVoting(true);
    try {
      const response = await fetch(`/api/apps/${app.id}/vote`, {
        method: "POST",
      });

      if (response.ok) {
        setVoteCount((prev) => prev + 1);
        setHasVoted(true);
      }
    } catch (error) {
      console.error("Error voting:", error);
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
    <div className="bg-black border border-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg hover:border-gray-700 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Link
            href={`/app/${app.id}`}
            onClick={handleView}
            className="text-xl font-semibold text-white hover:text-blue-400 transition-colors"
          >
            {app.name}
          </Link>

          <div className="flex items-center mt-2 text-sm text-gray-400">
            <span>by</span>
            <Link
              href={`/profile/${app.creatorUserTag}`}
              className="ml-1 text-blue-400 hover:text-blue-300 hover:underline transition-colors"
            >
              @{app.creatorUserTag}
            </Link>
          </div>
        </div>

        <button
          onClick={handleVote}
          disabled={!session || hasVoted || isVoting}
          className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
            hasVoted || !session
              ? "bg-gray-900 text-gray-600 cursor-not-allowed"
              : "bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 border border-blue-800"
          }`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2L13.09 8.26L20 9L15 13.74L16.18 20.02L10 16.77L3.82 20.02L5 13.74L0 9L6.91 8.26L10 2Z" />
          </svg>
          <span className="text-sm font-medium">{voteCount}</span>
        </button>
      </div>

      <p className="text-gray-300 mb-4">
        {truncateDescription(app.description)}
      </p>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span>{app.viewCount} views</span>
          <span>{new Date(app.createdAt).toLocaleDateString()}</span>
        </div>

        <a
          href={app.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
        >
          View Repo
        </a>
      </div>
    </div>
  );
}
