"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CollectionsModal } from "@/components/CollectionsModal";

interface AppDetail {
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
  comments: Comment[];
  userHasVoted?: boolean;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  userName: string;
  userTag: string;
  userId: string;
}

export default function ViewAppPage() {
  const params = useParams();
  const appId = params.id as string;
  const { data: session } = useSession();

  const [app, setApp] = useState<AppDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [voting, setVoting] = useState(false);
  const [showCollectionsModal, setShowCollectionsModal] = useState(false);

  useEffect(() => {
    fetchApp();
  }, [appId]);

  const fetchApp = async () => {
    try {
      // Log a view
      await fetch(`/api/apps/${appId}/view`, { method: "POST" });

      const response = await fetch(`/api/apps/${appId}`);
      if (!response.ok) {
        throw new Error("App not found");
      }

      const appData = await response.json();
      setApp(appData);
    } catch (error) {
      console.error("Error fetching app:", error);
      setError("App not found");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!session || voting) return;

    setVoting(true);
    try {
      const response = await fetch(`/api/apps/${appId}/vote`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setApp((prev) =>
          prev
            ? {
                ...prev,
                voteCount: data.voteCount,
                userHasVoted: data.hasVoted,
              }
            : null
        );
      }
    } catch (error) {
      console.error("Error voting:", error);
    } finally {
      setVoting(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !commentContent.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await fetch(`/api/apps/${appId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: commentContent }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setApp((prev) =>
          prev
            ? {
                ...prev,
                comments: [newComment, ...prev.comments],
              }
            : null
        );
        setCommentContent("");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <div
          className="font-mono text-sm"
          style={{ color: "var(--color-text)" }}
        >
          loading_app...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <p
              className="text-sm font-mono"
              style={{ color: "var(--color-highlight)" }}
            >
              ! {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!app) return null;

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
            PACKAGE INFO
          </h2>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto h-full">
          {/* Installation */}
          <div>
            <h3
              className="text-xs font-semibold mb-3 uppercase tracking-wider"
              style={{ color: "var(--color-accent)" }}
            >
              Installation
            </h3>
            <div
              className="p-3 text-xs font-mono border"
              style={{
                backgroundColor: "var(--color-primary)",
                borderColor: "var(--color-accent)",
                color: "var(--color-text)",
              }}
            >
              {app.installCommands}
            </div>
          </div>

          {/* Stats */}
          <div>
            <h3
              className="text-xs font-semibold mb-3 uppercase tracking-wider"
              style={{ color: "var(--color-accent)" }}
            >
              Stats
            </h3>
            <div
              className="space-y-2 text-sm"
              style={{ color: "var(--color-text)" }}
            >
              <div className="flex justify-between">
                <span>Votes:</span>
                <span style={{ color: "var(--color-highlight)" }}>
                  {app.voteCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Views:</span>
                <span style={{ color: "var(--color-accent)" }}>
                  {app.viewCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Published:</span>
                <span>{formatDate(app.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Author */}
          <div>
            <h3
              className="text-xs font-semibold mb-3 uppercase tracking-wider"
              style={{ color: "var(--color-accent)" }}
            >
              Author
            </h3>
            <Link
              href={`/profile/${app.creatorUserTag}`}
              className="text-sm font-medium focus:outline-none"
              style={{ color: "var(--color-text)" }}
            >
              @{app.creatorUserTag}
            </Link>
          </div>

          {/* Links */}
          <div>
            <h3
              className="text-xs font-semibold mb-3 uppercase tracking-wider"
              style={{ color: "var(--color-accent)" }}
            >
              Links
            </h3>
            <div className="space-y-2">
              <a
                href={app.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm font-medium focus:outline-none"
                style={{ color: "var(--color-text)" }}
              >
                Repository
              </a>
              {app.website && (
                <a
                  href={app.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm font-medium focus:outline-none"
                  style={{ color: "var(--color-text)" }}
                >
                  Website
                </a>
              )}
            </div>
          </div>

          {/* Actions */}
          {session && (
            <div>
              <h3
                className="text-xs font-semibold mb-3 uppercase tracking-wider"
                style={{ color: "var(--color-accent)" }}
              >
                Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={handleVote}
                  disabled={voting}
                  className="w-full px-3 py-2 text-sm font-medium focus:outline-none disabled:opacity-50"
                  style={{
                    backgroundColor: app.userHasVoted
                      ? "var(--color-highlight)"
                      : "var(--color-primary)",
                    color: app.userHasVoted
                      ? "var(--color-primary)"
                      : "var(--color-text)",
                    border: "1px solid var(--color-accent)",
                  }}
                >
                  {app.userHasVoted ? "★ Voted" : "☆ Vote"}
                </button>
                <button
                  onClick={() => setShowCollectionsModal(true)}
                  className="w-full px-3 py-2 text-sm font-medium focus:outline-none"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-text)",
                    border: "1px solid var(--color-accent)",
                  }}
                >
                  + Add to Collection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-80">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <h1
                className="text-2xl font-bold"
                style={{ color: "var(--color-text)" }}
              >
                {app.name}
              </h1>
              <div className="flex items-center space-x-2">
                <span
                  className="px-2 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: "var(--color-accent)",
                    color: "var(--color-primary)",
                  }}
                >
                  v1.0.0
                </span>
              </div>
            </div>

            {app.shortDescription && (
              <p
                className="text-sm mb-4"
                style={{ color: "var(--color-accent)" }}
              >
                {app.shortDescription}
              </p>
            )}

            <div
              className="flex items-center space-x-4 text-sm"
              style={{ color: "var(--color-text)" }}
            >
              <span>Published {formatDate(app.createdAt)}</span>
              <span>•</span>
              <span>{app.viewCount} views</span>
              <span>•</span>
              <span>{app.voteCount} votes</span>
            </div>
          </div>

          {/* README / Description */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <h2
                className="text-sm font-semibold"
                style={{ color: "var(--color-text)" }}
              >
                README
              </h2>
            </div>
            <div
              className="prose prose-sm max-w-none p-4 border"
              style={{
                backgroundColor: "var(--color-primary)",
                borderColor: "var(--color-accent)",
                color: "var(--color-text)",
              }}
            >
              <ReactMarkdown>{app.description}</ReactMarkdown>
            </div>
          </div>

          {/* Comments Section */}
          <div>
            <div className="flex items-center mb-4">
              <h2
                className="text-sm font-semibold"
                style={{ color: "var(--color-text)" }}
              >
                Comments ({app.comments.length})
              </h2>
            </div>

            {/* Add Comment Form */}
            {session && (
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <div
                  className="border p-4"
                  style={{ borderColor: "var(--color-accent)" }}
                >
                  <textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full p-3 text-sm focus:outline-none resize-none"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      color: "var(--color-text)",
                      border: "1px solid var(--color-accent)",
                    }}
                    rows={3}
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      type="submit"
                      disabled={submittingComment || !commentContent.trim()}
                      className="px-4 py-2 text-sm font-medium focus:outline-none disabled:opacity-50"
                      style={{
                        backgroundColor: "var(--color-highlight)",
                        color: "var(--color-primary)",
                        border: "1px solid var(--color-highlight)",
                      }}
                    >
                      {submittingComment ? "Posting..." : "Post Comment"}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {app.comments.length === 0 ? (
                <div
                  className="text-center py-8 border"
                  style={{
                    borderColor: "var(--color-accent)",
                    color: "var(--color-text)",
                  }}
                >
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                app.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-4 border"
                    style={{ borderColor: "var(--color-accent)" }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Link
                        href={`/profile/${comment.userTag}`}
                        className="font-medium text-sm focus:outline-none"
                        style={{ color: "var(--color-text)" }}
                      >
                        @{comment.userTag}
                      </Link>
                      <span
                        className="text-xs"
                        style={{ color: "var(--color-accent)" }}
                      >
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p
                      className="text-sm"
                      style={{ color: "var(--color-text)" }}
                    >
                      {comment.content}
                    </p>
                  </div>
                ))
              )}
            </div>
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
