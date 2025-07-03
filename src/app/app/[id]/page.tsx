"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { useParams } from "next/navigation";

interface AppDetail {
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
  comments: Comment[];
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  userName: string;
  userTag: string;
}

export default function AppDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: session } = useSession();

  const [app, setApp] = useState<AppDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchApp();
      logView();
    }
  }, [id]);

  const fetchApp = async () => {
    try {
      const response = await fetch(`/api/apps/${id}`);
      if (!response.ok) {
        throw new Error("App not found");
      }
      const data = await response.json();
      setApp(data);
    } catch (error) {
      console.error("Error fetching app:", error);
      setError("Failed to load app");
    } finally {
      setLoading(false);
    }
  };

  const logView = async () => {
    try {
      await fetch(`/api/apps/${id}/view`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Error logging view:", error);
    }
  };

  const handleVote = async () => {
    if (!session || isVoting || hasVoted) return;

    setIsVoting(true);
    try {
      const response = await fetch(`/api/apps/${id}/vote`, {
        method: "POST",
      });

      if (response.ok) {
        setHasVoted(true);
        if (app) {
          setApp({ ...app, voteCount: app.voteCount + 1 });
        }
      } else {
        const data = await response.json();
        if (data.error === "Already voted") {
          setHasVoted(true);
        }
      }
    } catch (error) {
      console.error("Error voting:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleComment = async () => {
    if (!session || !newComment.trim() || isCommenting) return;

    setIsCommenting(true);
    try {
      const response = await fetch(`/api/apps/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        const comment = await response.json();
        if (app) {
          setApp({
            ...app,
            comments: [...app.comments, comment],
          });
        }
        setNewComment("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsCommenting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* App Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {app.name}
            </h1>

            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
              <span>Created by</span>
              <Link
                href={`/profile/${app.creatorUserTag}`}
                className="ml-1 text-blue-600 dark:text-blue-400 hover:underline"
              >
                @{app.creatorUserTag} ({app.creatorName})
              </Link>
              <span className="mx-2">•</span>
              <span>{new Date(app.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>{app.viewCount} views</span>
              <span>{app.voteCount} votes</span>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={handleVote}
              disabled={!session || hasVoted || isVoting}
              className={`flex flex-col items-center px-4 py-3 rounded-lg transition-colors ${
                hasVoted || !session
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-400"
                  : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
              }`}
            >
              <svg
                className="w-6 h-6 mb-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 2L13.09 8.26L20 9L15 13.74L16.18 20.02L10 16.77L3.82 20.02L5 13.74L0 9L6.91 8.26L10 2Z" />
              </svg>
              <span className="text-sm font-medium">{app.voteCount}</span>
            </button>

            <a
              href={app.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              View Repository
            </a>
          </div>
        </div>
      </div>

      {/* App Description */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Description
        </h2>
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown>{app.description}</ReactMarkdown>
        </div>
      </div>

      {/* Installation Instructions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Installation
        </h2>
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown>{app.installCommands}</ReactMarkdown>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Comments ({app.comments.length})
        </h2>

        {/* Add Comment Form */}
        {session ? (
          <div className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <button
              onClick={handleComment}
              disabled={!newComment.trim() || isCommenting}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isCommenting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            <Link
              href="/auth/signin"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Sign in
            </Link>{" "}
            to add a comment.
          </p>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {app.comments.map((comment) => (
            <div
              key={comment.id}
              className="border-l-2 border-gray-200 dark:border-gray-600 pl-4"
            >
              <div className="flex items-center space-x-2 mb-2">
                <Link
                  href={`/profile/${comment.userTag}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  @{comment.userTag}
                </Link>
                <span className="text-gray-500 dark:text-gray-400">
                  ({comment.userName})
                </span>
                <span className="text-gray-400 dark:text-gray-500 text-sm">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                {comment.content}
              </p>
            </div>
          ))}
        </div>

        {app.comments.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
}
