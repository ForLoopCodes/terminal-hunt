"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppListItem } from "@/components/AppListItem";
import { ReportModal } from "@/components/ReportModal";
import { useKeyboardShortcuts } from "@/lib/keyboardShortcuts";

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
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

interface App {
  id: string;
  name: string;
  shortDescription?: string;
  description: string;
  website?: string;
  asciiArt?: string;
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
  const [editData, setEditData] = useState({ name: "", bio: "", userTag: "" });
  const [showReportModal, setShowReportModal] = useState(false);
  const [focusedElement, setFocusedElement] = useState<string | null>(null);

  // Refs for programmatic focus
  const appsTabRef = useRef<HTMLButtonElement>(null);
  const activityTabRef = useRef<HTMLButtonElement>(null);
  const achievementsTabRef = useRef<HTMLButtonElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const userTagInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const bioInputRef = useRef<HTMLTextAreaElement>(null);
  const saveButtonRef = useRef<HTMLButtonElement>(null);
  const collectionsRef = useRef<HTMLAnchorElement>(null);
  const reportRef = useRef<HTMLButtonElement>(null);
  const signOutRef = useRef<HTMLButtonElement>(null);

  const isOwnProfile = (session as any)?.user?.userTag === userTag;

  // Handle keyboard shortcuts using centralized system
  useKeyboardShortcuts(
    "profile-page",
    [
      {
        key: "a",
        action: () => {
          setActiveTab("apps");
          appsTabRef.current?.focus();
        },
        description: "Switch to Apps tab",
        requiresShift: true,
      },
      {
        key: "c",
        action: () => {
          setActiveTab("activity");
          activityTabRef.current?.focus();
        },
        description: "Switch to Activity tab",
        requiresShift: true,
      },
      {
        key: "h",
        action: () => {
          setActiveTab("achievements");
          achievementsTabRef.current?.focus();
        },
        description: "Switch to Achievements tab",
        requiresShift: true,
      },
      {
        key: "m",
        action: () => {
          if (isOwnProfile) {
            collectionsRef.current?.click();
          }
        },
        description: "My Collections",
        requiresShift: true,
      },
      {
        key: "e",
        action: () => {
          if (isOwnProfile && !editing) {
            setEditing(true);
            setTimeout(() => userTagInputRef.current?.focus(), 100);
          }
        },
        description: "Edit profile",
        requiresShift: true,
      },
      {
        key: "u",
        action: () => {
          if (editing) {
            userTagInputRef.current?.focus();
          }
        },
        description: "Focus User Tag input",
        requiresShift: true,
        disabled: !editing,
      },
      {
        key: "n",
        action: () => {
          if (editing) {
            nameInputRef.current?.focus();
          }
        },
        description: "Focus Name input",
        requiresShift: true,
        disabled: !editing,
      },
      {
        key: "b",
        action: () => {
          if (editing) {
            bioInputRef.current?.focus();
          }
        },
        description: "Focus Bio input",
        requiresShift: true,
        disabled: !editing,
      },
      {
        key: "s",
        action: () => {
          if (editing) {
            saveButtonRef.current?.click();
          }
        },
        description: "Save changes",
        requiresShift: true,
        disabled: !editing,
      },
      {
        key: "r",
        action: () => {
          if (!isOwnProfile && session) {
            setShowReportModal(true);
            reportRef.current?.focus();
          }
        },
        description: "Report user",
        requiresShift: true,
        disabled: isOwnProfile || !session,
      },
      {
        key: "o",
        action: () => {
          if (isOwnProfile && session) {
            signOutRef.current?.click();
          }
        },
        description: "Sign out",
        requiresShift: true,
        disabled: !isOwnProfile || !session,
      },
    ],
    10, // High priority for page-specific shortcuts
    [isOwnProfile, editing, session]
  );

  useEffect(() => {
    fetchProfile();
  }, [userTag]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/${userTag}`);
      const data = await response.json();

      if (response.ok) {
        setProfile(data);
        setEditData({
          name: data.name || "",
          bio: data.bio || "",
          userTag: data.userTag || "",
        });
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
      const requestBody: any = {
        name: editData.name,
        bio: editData.bio,
      };

      // Add newUserTag if it's different from current
      if (editData.userTag && editData.userTag !== userTag) {
        requestBody.newUserTag = editData.userTag;
      }

      const response = await fetch(`/api/users/${userTag}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile((prev) => (prev ? { ...prev, ...updatedProfile } : null));
        setEditing(false);

        // If userTag changed, redirect to new profile URL
        if (updatedProfile.userTag !== userTag) {
          window.location.href = `/profile/${updatedProfile.userTag}`;
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile: " + (error as any).message);
    }
  };

  const handleFollow = async () => {
    if (!session) return;

    try {
      const response = await fetch(`/api/users/${userTag}/follow`, {
        method: "POST",
      });

      if (response.ok) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                isFollowing: true,
                followersCount: prev.followersCount + 1,
              }
            : null
        );
      } else {
        throw new Error("Failed to follow user");
      }
    } catch (error) {
      console.error("Error following user:", error);
      setError("Failed to follow user");
    }
  };

  const handleUnfollow = async () => {
    if (!session) return;

    try {
      const response = await fetch(`/api/users/${userTag}/follow`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                isFollowing: false,
                followersCount: prev.followersCount - 1,
              }
            : null
        );
      } else {
        throw new Error("Failed to unfollow user");
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
      setError("Failed to unfollow user");
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
                  
P R O F I L E   @ ${profile.userTag
    .toLocaleUpperCase()
    .split("")
    .join(" ")
    .trim()}
  `;

  return (
    <div
      className="min-h-screen pt-20 pb-8 flex flex-col lg:flex-row font-mono"
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
              const sidebar = document.getElementById(
                "profile-sidebar-content"
              );
              if (sidebar) {
                sidebar.style.display =
                  sidebar.style.display === "none" ? "block" : "none";
              }
            }}
            className="w-full text-left font-mono text-sm focus:outline-none focus:underline px-2 py-1"
            style={{ color: "var(--color-highlight)" }}
          >
            [±] PROFILE
          </button>
        </div>

        <div
          id="profile-sidebar-content"
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
              USER PROFILE
            </h2>
          </div>

          <div className="p-4 space-y-6 overflow-y-auto lg:h-full max-h-96 lg:max-h-none">
            {/* Profile Info */}
            <div>
              <h3
                className="text-xs font-semibold mb-3 uppercase tracking-wider"
                style={{ color: "var(--color-accent)" }}
              >
                User Info
              </h3>

              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="userTag"
                      className="text-xs font-mono block mb-2"
                      style={{ color: "var(--color-text)" }}
                    >
                      <span className="underline">u</span>ser tag
                    </label>
                    <input
                      ref={userTagInputRef}
                      type="text"
                      id="userTag"
                      value={editData.userTag}
                      onFocus={() => setFocusedElement("userTag")}
                      onBlur={() => setFocusedElement(null)}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          userTag: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-1 text-sm focus:outline-none"
                      style={{
                        backgroundColor: "var(--color-primary)",
                        color: "var(--color-text)",
                        border: "1px solid var(--color-accent)",
                      }}
                      placeholder="Enter user tag"
                      pattern="[a-zA-Z0-9_]{3,30}"
                      title="3-30 characters, letters, numbers, and underscores only"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="name"
                      className="text-xs font-mono block mb-2"
                      style={{ color: "var(--color-text)" }}
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
                        setEditData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-1 text-sm focus:outline-none"
                      style={{
                        backgroundColor: "var(--color-primary)",
                        color: "var(--color-text)",
                        border: "1px solid var(--color-accent)",
                      }}
                      placeholder="Enter name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="bio"
                      className="text-xs font-mono block mb-2"
                      style={{ color: "var(--color-text)" }}
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
                        setEditData((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                      rows={4}
                      className="w-full px-3 py-1 text-sm focus:outline-none resize-vertical"
                      style={{
                        backgroundColor: "var(--color-primary)",
                        color: "var(--color-text)",
                        border: "1px solid var(--color-accent)",
                      }}
                      placeholder="Tell us about yourself"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      ref={saveButtonRef}
                      type="button"
                      onClick={handleSaveProfile}
                      onFocus={() => setFocusedElement("save")}
                      onBlur={() => setFocusedElement(null)}
                      className="w-full px-3 py-1 text-sm font-medium focus:outline-none"
                      style={{
                        backgroundColor: "var(--color-highlight)",
                        color: "var(--color-primary)",
                        border: "1px solid var(--color-highlight)",
                      }}
                    >
                      <span className="underline">S</span>ave Changes
                    </button>
                    <button
                      onFocus={() => setFocusedElement("cancel")}
                      onBlur={() => setFocusedElement(null)}
                      onClick={() => setEditing(false)}
                      className="w-full px-3 py-1 text-sm font-medium focus:outline-none"
                      style={{
                        backgroundColor: "var(--color-primary)",
                        color: "var(--color-text)",
                        border: "1px solid var(--color-accent)",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text)" }}
                  >
                    @{profile.userTag}
                  </div>

                  {profile.name && (
                    <div>
                      <div
                        className="text-xs mb-1"
                        style={{ color: "var(--color-accent)" }}
                      >
                        Name:
                      </div>
                      <div
                        className="text-sm"
                        style={{ color: "var(--color-text)" }}
                      >
                        {profile.name}
                      </div>
                    </div>
                  )}

                  {profile.bio && (
                    <div>
                      <div
                        className="text-xs mb-1"
                        style={{ color: "var(--color-accent)" }}
                      >
                        Bio:
                      </div>
                      <div
                        className="text-sm"
                        style={{ color: "var(--color-text)" }}
                      >
                        {profile.bio}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <div>
                      <div
                        className="text-xs mb-1"
                        style={{ color: "var(--color-accent)" }}
                      >
                        Followers:
                      </div>
                      <div
                        className="text-sm"
                        style={{ color: "var(--color-text)" }}
                      >
                        {profile.followersCount}
                      </div>
                    </div>
                    <div>
                      <div
                        className="text-xs mb-1"
                        style={{ color: "var(--color-accent)" }}
                      >
                        Following:
                      </div>
                      <div
                        className="text-sm"
                        style={{ color: "var(--color-text)" }}
                      >
                        {profile.followingCount}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div
                      className="text-xs mb-1"
                      style={{ color: "var(--color-accent)" }}
                    >
                      Joined:
                    </div>
                    <div
                      className="text-sm"
                      style={{ color: "var(--color-text)" }}
                    >
                      {formatDate(profile.createdAt)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div>
              <h3
                className="text-xs font-semibold mb-3 uppercase tracking-wider"
                style={{ color: "var(--color-accent)" }}
              >
                Actions
              </h3>
              <div className="space-y-2">
                {isOwnProfile && !editing && (
                  <button
                    ref={editButtonRef}
                    onFocus={() => setFocusedElement("edit")}
                    onBlur={() => setFocusedElement(null)}
                    onClick={() => setEditing(true)}
                    className="w-full px-3 py-1 text-sm font-medium focus:outline-none"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      color: "var(--color-text)",
                      border: "1px solid var(--color-accent)",
                    }}
                  >
                    <span className="underline">E</span>dit Profile
                  </button>
                )}

                {isOwnProfile && (
                  <Link
                    ref={collectionsRef}
                    href="/collections"
                    className="block w-full px-3 py-1 text-sm font-medium text-center focus:outline-none"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      color: "var(--color-text)",
                      border: "1px solid var(--color-accent)",
                    }}
                  >
                    <span className="underline">M</span>y Collections
                  </Link>
                )}

                {isOwnProfile && (
                  <button
                    ref={signOutRef}
                    onFocus={() => setFocusedElement("signout")}
                    onBlur={() => setFocusedElement(null)}
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full px-3 py-1 text-sm font-medium focus:outline-none"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      color: "var(--color-text)",
                      border: "1px solid var(--color-accent)",
                    }}
                  >
                    Sign <span className="underline">O</span>ut
                  </button>
                )}

                {!isOwnProfile && session && (
                  <>
                    {profile.isFollowing ? (
                      <button
                        onClick={handleUnfollow}
                        className="w-full px-3 py-1 text-sm font-medium focus:outline-none"
                        style={{
                          backgroundColor: "var(--color-primary)",
                          color: "var(--color-text)",
                          border: "1px solid var(--color-accent)",
                        }}
                      >
                        Unfollow
                      </button>
                    ) : (
                      <button
                        onClick={handleFollow}
                        className="w-full px-3 py-1 text-sm font-medium focus:outline-none"
                        style={{
                          backgroundColor: "var(--color-highlight)",
                          color: "var(--color-primary)",
                          border: "1px solid var(--color-highlight)",
                        }}
                      >
                        Follow
                      </button>
                    )}
                    <button
                      ref={reportRef}
                      onFocus={() => setFocusedElement("report")}
                      onBlur={() => setFocusedElement(null)}
                      onClick={() => setShowReportModal(true)}
                      className="w-full px-3 py-1 text-sm font-medium focus:outline-none"
                      style={{
                        backgroundColor: "var(--color-primary)",
                        color: "var(--color-text)",
                        border: "1px solid var(--color-accent)",
                      }}
                    >
                      <span className="underline">R</span>eport User
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h3
                className="text-xs font-semibold mb-3 uppercase tracking-wider"
                style={{ color: "var(--color-accent)" }}
              >
                Navigation
              </h3>
              <div className="space-y-2">
                <button
                  ref={appsTabRef}
                  onFocus={() => setFocusedElement("apps")}
                  onBlur={() => setFocusedElement(null)}
                  onClick={() => setActiveTab("apps")}
                  className="w-full px-3 py-1 text-sm font-medium focus:outline-none"
                  style={{
                    backgroundColor:
                      activeTab === "apps"
                        ? "var(--color-highlight)"
                        : "var(--color-primary)",
                    color:
                      activeTab === "apps"
                        ? "var(--color-primary)"
                        : "var(--color-text)",
                    border: "1px solid var(--color-accent)",
                  }}
                >
                  <span className="underline">A</span>pps ({profile.apps.length}
                  )
                </button>

                <button
                  ref={activityTabRef}
                  onFocus={() => setFocusedElement("activity")}
                  onBlur={() => setFocusedElement(null)}
                  onClick={() => setActiveTab("activity")}
                  className="w-full px-3 py-1 text-sm font-medium focus:outline-none"
                  style={{
                    backgroundColor:
                      activeTab === "activity"
                        ? "var(--color-highlight)"
                        : "var(--color-primary)",
                    color:
                      activeTab === "activity"
                        ? "var(--color-primary)"
                        : "var(--color-text)",
                    border: "1px solid var(--color-accent)",
                  }}
                >
                  <span className="underline">C</span>omments (
                  {profile.comments.length})
                </button>

                <button
                  ref={achievementsTabRef}
                  onFocus={() => setFocusedElement("achievements")}
                  onBlur={() => setFocusedElement(null)}
                  onClick={() => setActiveTab("achievements")}
                  className="w-full px-3 py-1 text-sm font-medium focus:outline-none"
                  style={{
                    backgroundColor:
                      activeTab === "achievements"
                        ? "var(--color-highlight)"
                        : "var(--color-primary)",
                    color:
                      activeTab === "achievements"
                        ? "var(--color-primary)"
                        : "var(--color-text)",
                    border: "1px solid var(--color-accent)",
                  }}
                >
                  Ac<span className="underline">h</span>ievements (
                  {profile.achievements.length})
                </button>
              </div>
            </div>

            {/* Keyboard Shortcuts Help */}
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
                {isOwnProfile && !editing && <div>[e] edit profile</div>}
                {editing && (
                  <>
                    <div>[u] user tag</div>
                    <div>[n] name</div>
                    <div>[b] bio</div>
                    <div>[s] save</div>
                  </>
                )}
                <div>[a] apps tab</div>
                <div>[c] comments tab</div>
                <div>[h] achievements tab</div>
                {isOwnProfile && <div>[m] my collections</div>}
                {isOwnProfile && <div>[o] sign out</div>}
                {!isOwnProfile && session && <div>[r] report user</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-80 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-6 lg:mb-8">
            <pre
              className="text-[8px] md:text-sm whitespace-pre-wrap font-semibold mb-4 lg:mb-6 overflow-x-auto"
              style={{ color: "var(--color-highlight)" }}
            >
              {termhuntText}
            </pre>
          </div>

          {/* Content Area */}
          <div>
            {activeTab === "apps" && (
              <div>
                {profile.apps.length === 0 ? (
                  <div className="flex items-center justify-center py-14">
                    <div
                      className="text-center"
                      style={{ color: "var(--color-text)" }}
                    >
                      <div className="text-sm font-mono mb-2">[ empty ]</div>
                      <div className="text-sm">No apps published yet</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {profile.apps.map((app, index) => (
                      <AppListItem
                        key={app.id}
                        app={{
                          id: app.id,
                          name: app.name,
                          shortDescription: app.shortDescription,
                          website: app.website,
                          voteCount: app.voteCount,
                          viewCount: app.viewCount,
                          creatorUserTag: profile.userTag,
                          asciiArt: app.asciiArt,
                        }}
                        index={index}
                        showStats={true}
                        statsType="both"
                        showRanking={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "activity" && (
              <div>
                {profile.comments.length === 0 ? (
                  <div className="flex items-center justify-center py-14">
                    <div
                      className="text-center"
                      style={{ color: "var(--color-text)" }}
                    >
                      <div className="text-sm font-mono mb-2">[ empty ]</div>
                      <div className="text-sm">No comments yet</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {profile.comments.map((comment, index) => (
                      <div
                        key={comment.id}
                        className="p-3 border"
                        style={{
                          borderColor: "var(--color-accent)",
                          borderWidth: "1px",
                        }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1 mb-2 sm:mb-0">
                            <div
                              className="text-sm mb-2"
                              style={{ color: "var(--color-text)" }}
                            >
                              {comment.content}
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs">
                              <span style={{ color: "var(--color-accent)" }}>
                                on
                              </span>
                              <Link
                                href={`/app/${comment.appId}`}
                                className="hover:underline focus:outline-none"
                                style={{ color: "var(--color-text)" }}
                              >
                                {comment.appName}
                              </Link>
                            </div>
                          </div>

                          <div
                            className="text-xs sm:ml-4 flex-shrink-0"
                            style={{ color: "var(--color-accent)" }}
                          >
                            {formatDate(comment.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "achievements" && (
              <div>
                {profile.achievements.length === 0 ? (
                  <div className="flex items-center justify-center py-14">
                    <div
                      className="text-center"
                      style={{ color: "var(--color-text)" }}
                    >
                      <div className="text-sm font-mono mb-2">[ empty ]</div>
                      <div className="text-sm">No achievements yet</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {profile.achievements.map((achievement, index) => (
                      <div
                        key={achievement.id}
                        className="p-3 border"
                        style={{
                          borderColor: "var(--color-accent)",
                          borderWidth: "1px",
                        }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1 mb-2 sm:mb-0">
                            <div
                              className="text-sm font-medium mb-1"
                              style={{ color: "var(--color-text)" }}
                            >
                              {achievement.title}
                            </div>

                            <div
                              className="text-sm mb-2"
                              style={{ color: "var(--color-text)" }}
                            >
                              {achievement.description}
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs">
                              <span style={{ color: "var(--color-accent)" }}>
                                earned {formatDate(achievement.awardedAt)}
                              </span>
                              {achievement.appName && (
                                <>
                                  <span
                                    style={{ color: "var(--color-accent)" }}
                                  >
                                    for
                                  </span>
                                  <Link
                                    href={`/app/${achievement.appId}`}
                                    className="hover:underline focus:outline-none"
                                    style={{ color: "var(--color-text)" }}
                                  >
                                    {achievement.appName}
                                  </Link>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Keyboard Shortcuts Help */}
          <div
            className="mt-8 p-4 border-t"
            style={{ borderColor: "var(--color-accent)" }}
          >
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: "var(--color-text)" }}
            >
              Keyboard Shortcuts
            </h3>
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs"
              style={{ color: "var(--color-accent)" }}
            >
              <div>Shift+A - Apps tab</div>
              <div>Shift+C - Activity tab</div>
              <div>Shift+H - Achievements tab</div>
              {isOwnProfile && (
                <>
                  <div>Shift+M - My Collections</div>
                  <div>Shift+E - Edit profile</div>
                  <div>Shift+O - Sign out</div>
                </>
              )}
              {editing && (
                <>
                  <div>Shift+U - Focus User Tag</div>
                  <div>Shift+N - Focus Name</div>
                  <div>Shift+B - Focus Bio</div>
                  <div>Shift+S - Save changes</div>
                </>
              )}
              {!isOwnProfile && session && <div>Shift+R - Report user</div>}
            </div>
            <div
              className="mt-2 text-xs"
              style={{ color: "var(--color-accent)" }}
            >
              * Browser shortcuts (Ctrl/Cmd+R, Ctrl/Cmd+C, etc.) work normally
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportableType="user"
        reportableId={profile.id}
        reportableName={`@${profile.userTag}`}
      />
    </div>
  );
}
