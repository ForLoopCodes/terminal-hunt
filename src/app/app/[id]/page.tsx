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
      const response = await fetch(`/api/apps/${appId}`);
      const data = await response.json();

      if (response.ok) {
        setApp(data);
      } else {
        setError(data.error || "App not found");
      }
    } catch (error) {
      console.error("Error fetching app:", error);
      setError("Failed to load app");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!session) return;

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
                userHasVoted: data.userHasVoted,
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

  const handleComment = async (e: React.FormEvent) => {
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
          className="font-mono text-lg"
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
              className="text-lg font-mono"
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
                  
  ${app.name.toUpperCase()}
  `}
          </pre>
        </div>

        <div className="space-y-6 max-w-[650px] mx-auto">
          {/* App Info */}
          <div className="space-y-4">
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
                name
              </label>
              <span
                className="text-sm"
                style={{ color: "var(--color-text)" }}
              >
                {app.name}
              </span>
            </div>

            {app.shortDescription && (
              <div className="flex items-start">
                <span
                  className="mr-2 w-4 text-xs mt-1"
                  style={{ color: "var(--color-text)" }}
                >
                  {" "}
                </span>
                <div className="flex-1">
                  <label
                    className="text-sm pr-2 block mb-1"
                    style={{
                      color: "var(--color-text)",
                      backgroundColor: "var(--color-primary)",
                    }}
                  >
                    description
                  </label>
                  <p
                    className="text-sm"
                    style={{ color: "var(--color-text)" }}
                  >
                    {app.shortDescription}
                  </p>
                </div>
              </div>
            )}

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
                creator
              </label>
              <Link
                href={`/profile/${app.creatorUserTag}`}
                className="text-sm focus:outline-none"
                style={{ color: "var(--color-text)" }}
              >
                @{app.creatorUserTag}
              </Link>
            </div>

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
                stats
              </label>
              <span
                className="text-sm"
                style={{ color: "var(--color-text)" }}
              >
                {app.voteCount} votes • {app.viewCount} views • {formatDate(app.createdAt)}
              </span>
            </div>

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
                links
              </label>
              <div className="flex space-x-4 text-sm">
                <a
                  href={app.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus:outline-none"
                  style={{ color: "var(--color-text)" }}
                >
                  repository
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
                      website
                    </a>
                  </>
                )}
              </div>
            </div>

            {session && (
              <div className="flex items-center space-x-4">
                <span
                  className="mr-2 w-4 text-xs"
                  style={{ color: "var(--color-text)" }}
                >
                  {" "}
                </span>
                <button
                  onClick={handleVote}
                  disabled={voting}
                  className="text-sm font-medium focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    color: app.userHasVoted ? "var(--color-highlight)" : "var(--color-text)",
                  }}
                >
                  {app.userHasVoted ? "voted ↑" : "vote ↑"} ({app.voteCount})
                </button>
                <span style={{ color: "var(--color-text)" }}>•</span>
                <button
                  onClick={() => setShowCollectionsModal(true)}
                  className="text-sm font-medium focus:outline-none"
                  style={{ color: "var(--color-text)" }}
                >
                  +collection
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-4 pt-4">
            <div className="flex items-start">
              <span
                className="mr-2 w-4 text-xs mt-1"
                style={{ color: "var(--color-text)" }}
              >
                {" "}
              </span>
              <div className="flex-1">
                <label
                  className="text-sm pr-2 block mb-2"
                  style={{
                    color: "var(--color-text)",
                    backgroundColor: "var(--color-primary)",
                  }}
                >
                  about
                </label>
                <div
                  className="prose prose-sm max-w-none text-sm leading-relaxed"
                  style={{ color: "var(--color-text)" }}
                >
                  <ReactMarkdown>{app.description}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>

          {/* Installation */}
          <div className="space-y-4">
            <div className="flex items-start">
              <span
                className="mr-2 w-4 text-xs mt-1"
                style={{ color: "var(--color-text)" }}
              >
                {" "}
              </span>
              <div className="flex-1">
                <label
                  className="text-sm pr-2 block mb-2"
                  style={{
                    color: "var(--color-text)",
                    backgroundColor: "var(--color-primary)",
                  }}
                >
                  installation
                </label>
                <div
                  className="text-sm leading-relaxed font-mono"
                  style={{ color: "var(--color-text)" }}
                >
                  <ReactMarkdown>{app.installCommands}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-4 pt-4">
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
                comments
              </label>
              <span
                className="text-sm"
                style={{ color: "var(--color-text)" }}
              >
                ({app.comments.length})
              </span>
            </div>

            {/* Add Comment */}
            {session ? (
              <form onSubmit={handleComment} className="space-y-4">
                <div className="flex items-start">
                  <span
                    className="mr-2 w-4 text-xs mt-1"
                    style={{ color: "var(--color-text)" }}
                  >
                    {" "}
                  </span>
                  <div className="flex-1">
                    <label
                      className="text-sm pr-2 block mb-1"
                      style={{
                        color: "var(--color-text)",
                        backgroundColor: "var(--color-primary)",
                      }}
                    >
                      new comment
                    </label>
                    <textarea
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      rows={4}
                      className="w-full px-2 py-1 focus:outline-none text-sm resize-vertical"
                      style={{
                        backgroundColor: "var(--color-primary)",
                        color: "var(--color-text)",
                      }}
                      placeholder="_"
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <span
                    className="mr-2 w-4 text-xs"
                    style={{ color: "var(--color-text)" }}
                  >
                    {" "}
                  </span>
                  <button
                    type="submit"
                    disabled={!commentContent.trim() || submittingComment}
                    className="px-2 py-1 font-medium focus:outline-none transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: "var(--color-highlight)",
                      color: "var(--color-primary)",
                    }}
                  >
                    {submittingComment ? "posting..." : "post comment"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center">
                <span
                  className="mr-2 w-4 text-xs"
                  style={{ color: "var(--color-text)" }}
                >
                  {" "}
                </span>
                <span
                  className="text-sm"
                  style={{ color: "var(--color-text)" }}
                >
                  <Link
                    href="/auth/signin"
                    className="focus:outline-none"
                    style={{ color: "var(--color-text)" }}
                  >
                    sign in
                  </Link>{" "}
                  to post a comment
                </span>
              </div>
            )}

            {/* Comments List */}
            {app.comments.length === 0 ? (
              <div className="flex items-center">
                <span
                  className="mr-2 w-4 text-xs"
                  style={{ color: "var(--color-text)" }}
                >
                  {" "}
                </span>
                <span
                  className="text-sm"
                  style={{ color: "var(--color-text)" }}
                >
                  no comments yet
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                {app.comments.map((comment, index) => (
                  <div key={comment.id} className="space-y-2">
                    <div className="flex items-center">
                      <span
                        className="mr-2 w-4 text-xs"
                        style={{ color: "var(--color-text)" }}
                      >
                        {" "}
                      </span>
                      <Link
                        href={`/profile/${comment.userTag}`}
                        className="text-sm focus:outline-none font-semibold mr-2"
                        style={{ color: "var(--color-text)" }}
                      >
                        @{comment.userTag}
                      </Link>
                      <span
                        className="text-xs"
                        style={{ color: "var(--color-text)" }}
                      >
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-start">
                      <span
                        className="mr-2 w-4 text-xs mt-1"
                        style={{ color: "var(--color-text)" }}
                      >
                        {" "}
                      </span>
                      <div className="flex-1">
                        <p
                          className="text-sm leading-relaxed"
                          style={{ color: "var(--color-text)" }}
                        >
                          {comment.content}
                        </p>
                      </div>
                    </div>

                    {index < app.comments.length - 1 && (
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
