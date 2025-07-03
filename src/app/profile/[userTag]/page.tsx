"use client";

import { useState, useEffect } from "react";
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
  description: string;
  viewCount: number;
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
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    bio: "",
    socialLinks: {} as { [key: string]: string },
  });

  const isOwnProfile = session?.user?.userTag === userTag;

  useEffect(() => {
    if (userTag) {
      fetchProfile();
    }
  }, [userTag]);

  const fetchProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/users/${userTag}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("User not found");
        }
        throw new Error("Failed to load profile");
      }

      const profileData = await response.json();
      setProfile(profileData);
      setEditData({
        name: profileData.name,
        bio: profileData.bio || "",
        socialLinks: profileData.socialLinks || {},
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load profile"
      );
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
    return new Date(dateString).toLocaleDateString();
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "twitter":
      case "x":
        return "🐦";
      case "github":
        return "🐙";
      case "linkedin":
        return "💼";
      case "website":
      case "blog":
        return "🌐";
      default:
        return "🔗";
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

  if (error || !profile) {
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
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={editData.bio}
                    onChange={(e) =>
                      setEditData((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Social Links (JSON format)
                  </label>
                  <textarea
                    value={JSON.stringify(editData.socialLinks, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setEditData((prev) => ({
                          ...prev,
                          socialLinks: parsed,
                        }));
                      } catch {
                        // Invalid JSON, don't update
                      }
                    }}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                    placeholder='{"github": "https://github.com/username", "twitter": "https://twitter.com/username"}'
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  @{profile.userTag}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
                  {profile.name}
                </p>

                {profile.bio && (
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {profile.bio}
                  </p>
                )}

                {profile.socialLinks &&
                  Object.keys(profile.socialLinks).length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {Object.entries(profile.socialLinks).map(
                        ([platform, url]) => (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            <span className="mr-1">
                              {getSocialIcon(platform)}
                            </span>
                            {platform}
                          </a>
                        )
                      )}
                    </div>
                  )}

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Joined {formatDate(profile.createdAt)}
                </p>
              </>
            )}
          </div>

          {isOwnProfile && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {profile.apps.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Apps Submitted
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {profile.comments.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Comments
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {profile.achievements.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Achievements
          </div>
        </div>
      </div>

      {/* Submitted Apps */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Submitted Apps ({profile.apps.length})
        </h2>

        {profile.apps.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No apps submitted yet.
          </p>
        ) : (
          <div className="space-y-4">
            {profile.apps.map((app) => (
              <div key={app.id} className="border-l-2 border-blue-500 pl-4">
                <Link
                  href={`/app/${app.id}`}
                  className="text-lg font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {app.name}
                </Link>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                  {app.description.substring(0, 150)}
                  {app.description.length > 150 ? "..." : ""}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
                  <span>{app.viewCount} views</span>
                  <span>{formatDate(app.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Achievements */}
      {profile.achievements.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Achievements ({profile.achievements.length})
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {profile.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">🏆</span>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {achievement.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {achievement.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <Link
                    href={`/app/${achievement.appId}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {achievement.appName}
                  </Link>
                  <span>{formatDate(achievement.awardedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Comments */}
      {profile.comments.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Comments ({profile.comments.length})
          </h2>

          <div className="space-y-4">
            {profile.comments.slice(0, 5).map((comment) => (
              <div
                key={comment.id}
                className="border-l-2 border-gray-300 dark:border-gray-600 pl-4"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Link
                    href={`/app/${comment.appId}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    {comment.appName}
                  </Link>
                  <span className="text-gray-400 dark:text-gray-500 text-sm">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
