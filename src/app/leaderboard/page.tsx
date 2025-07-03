"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface LeaderboardEntry {
  appId: string;
  appName: string;
  creatorName: string;
  creatorUserTag: string;
  voteCount?: number;
  viewCount?: number;
}

interface LeaderboardData {
  period: string;
  startDate: string;
  voteLeaderboard: LeaderboardEntry[];
  viewLeaderboard: LeaderboardEntry[];
}

const periods = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
];

export default function LeaderboardPage() {
  const [activePeriod, setActivePeriod] = useState("daily");
  const [activeTab, setActiveTab] = useState<"votes" | "views">("votes");
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLeaderboard();
  }, [activePeriod]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/leaderboards/${activePeriod}`);
      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }

      const leaderboardData = await response.json();
      setData(leaderboardData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setError("Failed to load leaderboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderLeaderboardTable = (
    entries: LeaderboardEntry[],
    type: "votes" | "views"
  ) => {
    if (entries.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No data available for this period.
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Application
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Creator
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {type === "votes" ? "Votes" : "Views"}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {entries.map((entry, index) => (
              <tr
                key={entry.appId}
                className="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                        index === 0
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          : index === 1
                          ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          : index === 2
                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                      }`}
                    >
                      {index + 1}
                    </span>
                    {index < 3 && (
                      <span className="ml-2">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/app/${entry.appId}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    {entry.appName}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/profile/${entry.creatorUserTag}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    @{entry.creatorUserTag}
                  </Link>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {entry.creatorName}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {type === "votes" ? entry.voteCount : entry.viewCount}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Leaderboards
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Discover the most popular terminal applications in the community
          </p>
        </div>

        {/* Period Tabs */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-1">
            {periods.map((period) => (
              <button
                key={period.key}
                onClick={() => setActivePeriod(period.key)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activePeriod === period.key
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          {data && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Period: {formatDate(data.startDate)} - Present
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={fetchLeaderboard}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : data ? (
          <>
            {/* Vote/View Tabs */}
            <div className="px-6 py-4">
              <div className="flex space-x-1 mb-6">
                <button
                  onClick={() => setActiveTab("votes")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "votes"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  🗳️ Most Voted
                </button>
                <button
                  onClick={() => setActiveTab("views")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "views"
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  👁️ Most Viewed
                </button>
              </div>

              {/* Leaderboard Table */}
              {activeTab === "votes"
                ? renderLeaderboardTable(data.voteLeaderboard, "votes")
                : renderLeaderboardTable(data.viewLeaderboard, "views")}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
