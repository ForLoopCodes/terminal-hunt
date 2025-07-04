"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface UserProfile {
  id: string;
  userTag: string;
  name: string;
  bio?: string;
  socialLinks?: { [key: string]: string };
  createdAt: string;
  apps: App[];
  comments: Comment[];
  achievements: Achievement[];
}

interface App {
  id: string;
  name: string;
  shortDescription?: string;
  description: string;
  website?: string;
  viewCount: number;
  voteCount: number;
  createdAt: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  appId: string;
  appName: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: string;
  awardedAt: string;
  appId: string;
  appName: string;
}

export default function ProfilePage() {
  const params = useParams();
  const userTag = params.userTag as string;
  const { data: session } = useSession();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<
    "apps" | "activity" | "achievements"
  >("apps");
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", bio: "" });
  const [focusedElement, setFocusedElement] = useState<string | null>(null);

  // Refs for programmatic focus
  const appsTabRef = useRef<HTMLButtonElement>(null);
  const activityTabRef = useRef<HTMLButtonElement>(null);
  const achievementsTabRef = useRef<HTMLButtonElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const bioInputRef = useRef<HTMLTextAreaElement>(null);
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  const isOwnProfile = (session as any)?.user?.userTag === userTag;

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
        case "a":
          e.preventDefault();
          setActiveTab("apps");
          appsTabRef.current?.focus();
          break;
        case "c":
          e.preventDefault();
          setActiveTab("activity");
          activityTabRef.current?.focus();
          break;
        case "h":
          e.preventDefault();
          setActiveTab("achievements");
          achievementsTabRef.current?.focus();
          break;
        case "e":
          e.preventDefault();
          if (isOwnProfile && !editing) {
            setEditing(true);
            setTimeout(() => nameInputRef.current?.focus(), 100);
          }
          break;
        case "n":
          e.preventDefault();
          if (editing) {
            nameInputRef.current?.focus();
          }
          break;
        case "b":
          e.preventDefault();
          if (editing) {
            bioInputRef.current?.focus();
          }
          break;
        case "s":
          e.preventDefault();
          if (editing) {
            saveButtonRef.current?.click();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isOwnProfile, editing]);

  useEffect(() => {
    fetchProfile();
  }, [userTag]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/${userTag}`);
      const data = await response.json();

      if (response.ok) {
        setProfile(data);
        setEditData({ name: data.name || "", bio: data.bio || "" });
      } else {
        setError(data.error || "User not found");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!isOwnProfile) return;

    try {
      const response = await fetch(`/api/users/${userTag}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile((prev) => (prev ? { ...prev, ...updatedProfile } : null));
        setEditing(false);
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile");
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
          loading_profile...
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

  if (!profile) return null;

  const termhuntText = `
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
                  
  P R O F I L E   @${profile.userTag}
  `;

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
            {termhuntText}
          </pre>
        </div>

        <div className="space-y-6 max-w-[650px] mx-auto">
          {/* Navigation tabs */}
          <div className="space-y-2">
            <div className="flex items-center">
              <span
                className="mr-2 w-4 text-xs"
                style={{ color: "var(--color-text)" }}
              >
                {focusedElement === "apps" || activeTab === "apps" ? ">" : " "}
              </span>
              <button
                ref={appsTabRef}
                onFocus={() => setFocusedElement("apps")}
                onBlur={() => setFocusedElement(null)}
                onClick={() => setActiveTab("apps")}
                className="text-sm font-medium focus:outline-none focus:ring-none"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-text)",
                }}
              >
                <span className="underline">A</span>pps ({profile.apps.length})
              </button>
            </div>
            <div className="flex items-center">
              <span
                className="mr-2 w-4 text-xs"
                style={{ color: "var(--color-text)" }}
              >
                {focusedElement === "activity" || activeTab === "activity" ? ">" : " "}
              </span>
              <button
                ref={activityTabRef}
                onFocus={() => setFocusedElement("activity")}
                onBlur={() => setFocusedElement(null)}
                onClick={() => setActiveTab("activity")}
                className="text-sm font-medium focus:outline-none focus:ring-none"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-text)",
                }}
              >
                <span className="underline">C</span>omments ({profile.comments.length})
              </button>
            </div>
            <div className="flex items-center">
              <span
                className="mr-2 w-4 text-xs"
                style={{ color: "var(--color-text)" }}
              >
                {focusedElement === "achievements" || activeTab === "achievements" ? ">" : " "}
              </span>
              <button
                ref={achievementsTabRef}
                onFocus={() => setFocusedElement("achievements")}
                onBlur={() => setFocusedElement(null)}
                onClick={() => setActiveTab("achievements")}
                className="text-sm font-medium focus:outline-none focus:ring-none"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-text)",
                }}
              >
                Ac<span className="underline">h</span>ievements ({profile.achievements.length})
              </button>
            </div>
          </div>

          {/* Profile Info */}
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
                user
              </label>
              <span
                className="text-sm"
                style={{ color: "var(--color-text)" }}
              >
                @{profile.userTag}
              </span>
            </div>

            {editing ? (
              <>
                <div className="flex items-center">
                  <span
                    className="mr-2 w-4 text-xs"
                    style={{ color: "var(--color-text)" }}
                  >
                    {focusedElement === "name" ? ">" : " "}
                  </span>
                  <label
                    htmlFor="name"
                    className="text-sm pr-2"
                    style={{
                      color: "var(--color-text)",
                      backgroundColor: "var(--color-primary)",
                    }}
                  >
                    <span className="underline">n</span>ame
                  </label>
                  <input
                    ref={nameInputRef}
                    type="text"
                    id="name"
                    value={editData.name}
                    onFocus={() => setFocusedElement("name")}
                    onBlur={() => setFocusedElement(null)}
                    onChange={(e) =>
                      setEditData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="flex-1 px-2 py-1 focus:outline-none text-sm"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      color: "var(--color-text)",
                    }}
                    placeholder="_"
                  />
                </div>

                <div className="flex items-start">
                  <span
                    className="mr-2 w-4 text-xs mt-1"
                    style={{ color: "var(--color-text)" }}
                  >
                    {focusedElement === "bio" ? ">" : " "}
                  </span>
                  <div className="flex-1">
                    <label
                      htmlFor="bio"
                      className="text-sm pr-2 block mb-1"
                      style={{
                        color: "var(--color-text)",
                        backgroundColor: "var(--color-primary)",
                      }}
                    >
                      <span className="underline">b</span>io
                    </label>
                    <textarea
                      ref={bioInputRef}
                      id="bio"
                      value={editData.bio}
                      onFocus={() => setFocusedElement("bio")}
                      onBlur={() => setFocusedElement(null)}
                      onChange={(e) =>
                        setEditData((prev) => ({ ...prev, bio: e.target.value }))
                      }
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

                <div className="flex items-center justify-start space-x-4">
                  <div className="flex items-center">
                    <span
                      className="mr-2 w-4 text-xs"
                      style={{ color: "var(--color-text)" }}
                    >
                      {focusedElement === "save" ? ">" : " "}
                    </span>
                    <button
                      ref={saveButtonRef}
                      type="button"
                      onClick={handleSaveProfile}
                      onFocus={() => setFocusedElement("save")}
                      onBlur={() => setFocusedElement(null)}
                      className="px-2 py-1 font-medium focus:outline-none transition-colors text-sm"
                      style={{
                        backgroundColor: "var(--color-highlight)",
                        color: "var(--color-primary)",
                      }}
                    >
                      <span className="underline">S</span>ave
                    </button>
                  </div>
                  <div className="flex items-center">
                    <span
                      className="mr-2 w-4 text-xs"
                      style={{ color: "var(--color-text)" }}
                    >
                      {focusedElement === "cancel" ? ">" : " "}
                    </span>
                    <button
                      onFocus={() => setFocusedElement("cancel")}
                      onBlur={() => setFocusedElement(null)}
                      onClick={() => setEditing(false)}
                      className="font-medium text-sm focus:outline-none"
                      style={{ color: "var(--color-text)" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {profile.name && (
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
                      {profile.name}
                    </span>
                  </div>
                )}

                {profile.bio && (
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
                        bio
                      </label>
                      <p
                        className="text-sm"
                        style={{ color: "var(--color-text)" }}
                      >
                        {profile.bio}
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
                    joined
                  </label>
                  <span
                    className="text-sm"
                    style={{ color: "var(--color-text)" }}
                  >
                    {formatDate(profile.createdAt)}
                  </span>
                </div>

                {isOwnProfile && (
                  <div className="flex items-center">
                    <span
                      className="mr-2 w-4 text-xs"
                      style={{ color: "var(--color-text)" }}
                    >
                      {focusedElement === "edit" ? ">" : " "}
                    </span>
                    <button
                      ref={editButtonRef}
                      onFocus={() => setFocusedElement("edit")}
                      onBlur={() => setFocusedElement(null)}
                      onClick={() => setEditing(true)}
                      className="font-medium text-sm focus:outline-none"
                      style={{ color: "var(--color-text)" }}
                    >
                      <span className="underline">E</span>dit Profile
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Tab Content */}
          <div className="space-y-6 pt-6">
            {activeTab === "apps" && (
              <div>
                {profile.apps.length === 0 ? (
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
                      no apps published yet
                    </span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profile.apps.map((app, index) => (
                      <div key={app.id} className="space-y-2">
                        <div className="flex items-center">
                          <span
                            className="mr-2 w-4 text-xs"
                            style={{ color: "var(--color-text)" }}
                          >
                            {" "}
                          </span>
                          <Link
                            href={`/app/${app.id}`}
                            className="text-sm focus:outline-none"
                            style={{ color: "var(--color-text)" }}
                          >
                            {app.name}
                          </Link>
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
                              className="text-sm"
                              style={{ color: "var(--color-text)" }}
                            >
                              {app.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <span
                            className="mr-2 w-4 text-xs"
                            style={{ color: "var(--color-text)" }}
                          >
                            {" "}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "var(--color-text)" }}
                          >
                            {app.viewCount} views • {app.voteCount} votes • {formatDate(app.createdAt)}
                          </span>
                        </div>

                        {index < profile.apps.length - 1 && (
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
            )}

            {activeTab === "activity" && (
              <div>
                {profile.comments.length === 0 ? (
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
                    {profile.comments.map((comment, index) => (
                      <div key={comment.id} className="space-y-2">
                        <div className="flex items-start">
                          <span
                            className="mr-2 w-4 text-xs mt-1"
                            style={{ color: "var(--color-text)" }}
                          >
                            {" "}
                          </span>
                          <div className="flex-1">
                            <p
                              className="text-sm mb-1"
                              style={{ color: "var(--color-text)" }}
                            >
                              {comment.content}
                            </p>
                            <div className="flex items-center space-x-2">
                              <span
                                className="text-xs"
                                style={{ color: "var(--color-text)" }}
                              >
                                on
                              </span>
                              <Link
                                href={`/app/${comment.appId}`}
                                className="text-xs focus:outline-none"
                                style={{ color: "var(--color-text)" }}
                              >
                                {comment.appName}
                              </Link>
                              <span
                                className="text-xs"
                                style={{ color: "var(--color-text)" }}
                              >
                                • {formatDate(comment.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {index < profile.comments.length - 1 && (
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
            )}

            {activeTab === "achievements" && (
              <div>
                {profile.achievements.length === 0 ? (
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
                      no achievements yet
                    </span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profile.achievements.map((achievement, index) => (
                      <div key={achievement.id} className="space-y-2">
                        <div className="flex items-center">
                          <span
                            className="mr-2 w-4 text-xs"
                            style={{ color: "var(--color-text)" }}
                          >
                            {" "}
                          </span>
                          <span
                            className="text-sm mr-2"
                            style={{ color: "var(--color-text)" }}
                          >
                            {achievement.type === "first_app"
                              ? "📱"
                              : achievement.type === "popular_app"
                              ? "⭐"
                              : achievement.type === "veteran"
                              ? "🏆"
                              : "🎖️"}
                          </span>
                          <span
                            className="text-sm font-semibold"
                            style={{ color: "var(--color-text)" }}
                          >
                            {achievement.title}
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
                              className="text-sm mb-1"
                              style={{ color: "var(--color-text)" }}
                            >
                              {achievement.description}
                            </p>
                            <div className="flex items-center space-x-2">
                              <span
                                className="text-xs"
                                style={{ color: "var(--color-text)" }}
                              >
                                earned {formatDate(achievement.awardedAt)}
                              </span>
                              {achievement.appName && (
                                <>
                                  <span
                                    className="text-xs"
                                    style={{ color: "var(--color-text)" }}
                                  >
                                    for
                                  </span>
                                  <Link
                                    href={`/app/${achievement.appId}`}
                                    className="text-xs focus:outline-none"
                                    style={{ color: "var(--color-text)" }}
                                  >
                                    {achievement.appName}
                                  </Link>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {index < profile.achievements.length - 1 && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
