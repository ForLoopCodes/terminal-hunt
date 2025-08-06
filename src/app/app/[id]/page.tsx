"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CollectionsModal } from "@/components/CollectionsModal";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { formatAsciiArt } from "@/lib/ascii-utils";
import { EditAppButton } from "@/components/EditAppButton";
import { CommentActions } from "@/components/CommentActions";
import { DeleteAppButton } from "@/components/DeleteAppButton";
import { CopyButton } from "@/components/CopyButton";
import { ReportModal } from "@/components/ReportModal";
import { useKeyboardShortcuts } from "@/lib/keyboardShortcuts";

interface AppDetail {
  asciiArtAlignment: any;
  id: string;
  name: string;
  shortDescription?: string;
  description: string;
  website?: string;
  documentationUrl?: string;
  asciiArt?: string;
  installCommands: string;
  repoUrl: string;
  viewCount: number;
  createdAt: string;
  creatorId: string;
  creatorName: string;
  creatorUserTag: string;
  voteCount: number;
  comments: Comment[];
  userHasVoted?: boolean;
  primaryInstallCommand?: string;
  identifier?: string;
  makefile?: string;
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
  const router = useRouter();
  const appId = params.id as string;
  const { data: session } = useSession();

  const [app, setApp] = useState<AppDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [voting, setVoting] = useState(false);
  const [showCollectionsModal, setShowCollectionsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCommentReportModal, setShowCommentReportModal] = useState(false);
  const [reportingComment, setReportingComment] = useState<{
    id: string;
    userTag: string;
  } | null>(null);
  // Refs for keyboard navigation
  const voteRef = useRef<HTMLButtonElement>(null);
  const collectionsRef = useRef<HTMLButtonElement>(null);
  const editRef = useRef<HTMLButtonElement>(null);
  const deleteRef = useRef<HTMLButtonElement>(null);
  const reportRef = useRef<HTMLButtonElement>(null);

  // Handle keyboard shortcuts using centralized system
  useKeyboardShortcuts(
    "app-page",
    [
      {
        key: "v",
        action: () => {
          if (session && !voting) {
            handleVote();
            voteRef.current?.focus();
          }
        },
        description: "Vote for this app",
        requiresShift: true,
        priority: 10,
      },
      {
        key: "c",
        action: () => {
          if (session) {
            setShowCollectionsModal(true);
            collectionsRef.current?.focus();
          }
        },
        description: "Add to collection",
        requiresShift: true,
        priority: 10,
      },
      {
        key: "e",
        action: () => {
          if (session && app && editRef.current) {
            editRef.current?.click();
          }
        },
        description: "Edit app",
        requiresShift: true,
        priority: 10,
      },
      {
        key: "d",
        action: () => {
          if (session && app && deleteRef.current) {
            deleteRef.current?.click();
          }
        },
        description: "Delete app",
        requiresShift: true,
        priority: 10,
      },
      {
        key: "r",
        action: () => {
          if (session) {
            setShowReportModal(true);
            reportRef.current?.focus();
          }
        },
        description: "Report app",
        requiresShift: true,
        priority: 10,
      },
    ],
    10, // High priority for page-specific shortcuts
    [session, voting, app]
  );

  useEffect(() => {
    fetchApp();
    if (session) {
      checkVoteStatus();
    }
  }, [appId, session]);

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

  const checkVoteStatus = async () => {
    try {
      const response = await fetch(`/api/apps/${appId}/vote-status`);
      const data = await response.json();
      setApp((prev) =>
        prev
          ? {
              ...prev,
              userHasVoted: data.hasVoted,
              voteCount: data.voteCount,
            }
          : null
      );
    } catch (error) {
      console.error("Error checking vote status:", error);
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
                userHasVoted: data.voted,
                voteCount: data.voteCount,
                // Keep the same view count to prevent increment
                viewCount: prev.viewCount,
              }
            : null
        );
      } else {
        const errorData = await response.json();
        console.error("Voting error:", errorData.error);
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

  const handleCommentEdit = (commentId: string, newContent: string) => {
    setApp((prev) =>
      prev
        ? {
            ...prev,
            comments: prev.comments.map((comment) =>
              comment.id === commentId
                ? { ...comment, content: newContent }
                : comment
            ),
          }
        : null
    );
  };

  const handleCommentDelete = (commentId: string) => {
    setApp((prev) =>
      prev
        ? {
            ...prev,
            comments: prev.comments.filter(
              (comment) => comment.id !== commentId
            ),
          }
        : null
    );
  };

  const handleCommentReport = (commentId: string, commentUser: string) => {
    setReportingComment({ id: commentId, userTag: commentUser });
    setShowCommentReportModal(true);
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
              const sidebar = document.getElementById("sidebar-content");
              if (sidebar) {
                sidebar.style.display =
                  sidebar.style.display === "none" ? "block" : "none";
              }
            }}
            className="w-full text-left font-mono text-sm focus:outline-none focus:underline"
            style={{ color: "var(--color-highlight)" }}
          >
            [±] PACKAGE INFO
          </button>
        </div>

        <div
          id="sidebar-content"
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
              PACKAGE INFO
            </h2>
          </div>

          <div className="p-4 space-y-6 overflow-y-auto lg:h-full max-h-96 lg:max-h-[calc(100vh-5rem)]">
            {/* Primary Installation Command */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--color-accent)" }}
                >
                  Primary Install Command
                </h3>
                <CopyButton
                  text={app.primaryInstallCommand || `hunt ${app.identifier}`}
                />
              </div>
              <div
                className="p-3 text-xs font-mono border overflow-x-auto"
                style={{
                  backgroundColor: "var(--color-primary)",
                  borderColor: "var(--color-accent)",
                  color: "var(--color-text)",
                }}
              >
                {app.primaryInstallCommand || `hunt ${app.identifier}`}
              </div>
            </div>

            {/* Identifier */}
            <div>
              <div className="flex items-center justify-between mb-3 mt-4">
                <h3
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--color-accent)" }}
                >
                  Identifier
                </h3>
                <CopyButton text={app.identifier || ""} />
              </div>
              <div
                className="p-3 text-xs font-mono border overflow-x-auto"
                style={{
                  backgroundColor: "var(--color-primary)",
                  borderColor: "var(--color-accent)",
                  color: "var(--color-text)",
                }}
              >
                {app.identifier}
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
                className="text-sm font-medium focus:outline-none focus:underline"
                style={{ color: "var(--color-text)" }}
                title={`View profile of @${app.creatorUserTag}`}
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
                  className="block text-sm font-medium focus:outline-none focus:underline"
                  style={{ color: "var(--color-text)" }}
                  title="View repository"
                >
                  Repository
                </a>
                {app.website && (
                  <a
                    href={app.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm font-medium focus:outline-none focus:underline"
                    style={{ color: "var(--color-text)" }}
                    title="Visit website"
                  >
                    Website
                  </a>
                )}
                {app.documentationUrl && (
                  <a
                    href={app.documentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm font-medium focus:outline-none focus:underline"
                    style={{ color: "var(--color-text)" }}
                    title="View documentation"
                  >
                    Documentation
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
                    ref={voteRef}
                    onClick={handleVote}
                    disabled={voting}
                    className="w-full px-3 py-1 text-sm font-medium focus:outline-none disabled:opacity-50 transition-colors"
                    style={{
                      backgroundColor: app.userHasVoted
                        ? "var(--color-highlight)"
                        : "var(--color-primary)",
                      color: app.userHasVoted
                        ? "var(--color-primary)"
                        : "var(--color-text)",
                      border: "1px solid var(--color-accent)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--color-highlight)";
                      e.target.style.boxShadow =
                        "0 0 0 1px var(--color-highlight)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--color-accent)";
                      e.target.style.boxShadow = "none";
                    }}
                    title={
                      app.userHasVoted
                        ? "Remove vote (Shift+V)"
                        : "Vote for this app (Shift+V)"
                    }
                  >
                    {app.userHasVoted ? <>↓ Remove Vote</> : <>↑ Vote</>}
                  </button>
                  <button
                    ref={collectionsRef}
                    onClick={() => setShowCollectionsModal(true)}
                    className="w-full px-3 py-1 text-sm font-medium focus:outline-none transition-colors"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      color: "var(--color-text)",
                      border: "1px solid var(--color-accent)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--color-highlight)";
                      e.target.style.boxShadow =
                        "0 0 0 1px var(--color-highlight)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--color-accent)";
                      e.target.style.boxShadow = "none";
                    }}
                    title="Add to Collection (Shift+C)"
                  >
                    + Add to Collection
                  </button>

                  <button
                    ref={reportRef}
                    onClick={() => setShowReportModal(true)}
                    className="w-full px-3 py-1 text-sm font-medium focus:outline-none transition-colors"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      color: "var(--color-text)",
                      border: "1px solid var(--color-accent)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--color-highlight)";
                      e.target.style.boxShadow =
                        "0 0 0 1px var(--color-highlight)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--color-accent)";
                      e.target.style.boxShadow = "none";
                    }}
                    title="Report App (Shift+R)"
                  >
                    Report
                  </button>

                  {/* Edit button for app creator */}
                  {session?.user?.email && app && (
                    <EditAppButton
                      ref={editRef}
                      appId={app.id}
                      creatorId={app.creatorId}
                      userEmail={session.user.email}
                    />
                  )}

                  {/* Delete button for app creator */}
                  {session?.user?.email && app && (
                    <DeleteAppButton
                      ref={deleteRef}
                      appId={app.id}
                      creatorId={app.creatorId}
                      userEmail={session.user.email}
                      onDelete={() => router.push("/")}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Keyboard Shortcuts */}
            <div>
              <h3
                className="text-xs font-semibold mb-3 uppercase tracking-wider"
                style={{ color: "var(--color-accent)" }}
              >
                Keyboard Shortcuts
              </h3>
              <div
                className="text-xs space-y-1"
                style={{ color: "var(--color-text)" }}
              >
                {session && (
                  <>
                    <div>Shift+V vote for app</div>
                    <div>Shift+C add to collection</div>
                    <div>Shift+R report app</div>
                    {session?.user?.email && app && app.creatorId && (
                      <>
                        <div>Shift+E edit app</div>
                        <div>Shift+D delete app</div>
                      </>
                    )}
                  </>
                )}
                <div
                  className="text-xs pt-2"
                  style={{ color: "var(--color-accent)" }}
                >
                  * Browser shortcuts (Ctrl/Cmd+R, Ctrl/Cmd+C, etc.) work
                  normally
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-80 w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ASCII Art */}
          <div className={`mb-8 lg:mb-16 items-${app.asciiArtAlignment}`}>
            {/* Desktop ASCII Art */}
            <div
              className={`hidden sm:block p-2 sm:p-4 font-mono text-xs text-${app.asciiArtAlignment} items-${app.asciiArtAlignment} overflow-x-auto`}
              style={{
                color: "var(--color-highlight)",
                textAlign: app.asciiArtAlignment,
              }}
            >
              <pre className="whitespace-pre text-xs sm:text-sm">
                {formatAsciiArt(app.asciiArt || "", app.name)}
              </pre>
            </div>

            {/* Mobile ASCII Art - Smaller and simplified */}
            <div
              className={`block sm:hidden p-2 font-mono text-xs text-${app.asciiArtAlignment} items-${app.asciiArtAlignment} overflow-x-auto`}
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-accent)",
                textAlign: app.asciiArtAlignment,
              }}
            >
              <pre className="whitespace-pre text-xs">
                {app.name.toUpperCase()}
              </pre>
            </div>
          </div>
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
              <h1
                className="text-xl sm:text-2xl font-bold"
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
              className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm"
              style={{ color: "var(--color-text)" }}
            >
              <span>Published {formatDate(app.createdAt)}</span>
              <span className="hidden sm:inline">•</span>
              <span>{app.viewCount} views</span>
              <span className="hidden sm:inline">•</span>
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
              className="p-4"
              style={{
                backgroundColor: "var(--color-primary)",
              }}
            >
              <MarkdownRenderer content={app.description} />
            </div>
          </div>

          {/* Installation */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-sm font-semibold"
                style={{ color: "var(--color-text)" }}
              >
                INSTALLATION
              </h2>
              <CopyButton text={app.installCommands} />
            </div>
            <div
              className="p-4"
              style={{
                backgroundColor: "var(--color-primary)",
              }}
            >
              <MarkdownRenderer content={app.installCommands} />
            </div>
          </div>
          {/* Makefile Copy Button */}
          {app.makefile && (
            <div className="mt-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3
                  className="text-sm font-semibold uppercase"
                  style={{ color: "var(--color-text)" }}
                >
                  EXEC COMMANDS
                </h3>
                <CopyButton text={app.makefile} />
              </div>
              <div
                className="p-3 text-xs font-mono border overflow-x-auto"
                style={{
                  backgroundColor: "var(--color-primary)",
                  borderColor: "var(--color-accent)",
                  color: "var(--color-text)",
                }}
              >
                <span>{app.makefile}</span>
              </div>
            </div>
          )}

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
                <div className="p-0">
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
                  <div className="flex justify-start mt-3">
                    <button
                      type="submit"
                      disabled={submittingComment || !commentContent.trim()}
                      className="px-4 py-1 text-sm font-medium focus:outline-none disabled:opacity-50"
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
                    <CommentActions
                      comment={comment}
                      onEdit={handleCommentEdit}
                      onDelete={handleCommentDelete}
                      onReport={handleCommentReport}
                    />
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

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportableType="app"
        reportableId={app.id}
        reportableName={app.name}
      />

      {/* Comment Report Modal */}
      {reportingComment && (
        <ReportModal
          isOpen={showCommentReportModal}
          onClose={() => {
            setShowCommentReportModal(false);
            setReportingComment(null);
          }}
          reportableType="comment"
          reportableId={reportingComment.id}
          reportableName={`Comment by @${reportingComment.userTag}`}
        />
      )}
    </div>
  );
}
