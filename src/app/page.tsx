"use client";

import { useState, useEffect } from "react";
import { AppCard } from "@/components/AppCard";
import { SearchBar } from "@/components/SearchBar";
import { TagFilter } from "@/components/TagFilter";

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

interface Tag {
  id: string;
  name: string;
}

export default function Home() {
  const [apps, setApps] = useState<App[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedTag, setSelectedTag] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchApps();
    fetchTags();
  }, [sortBy, selectedTag, searchQuery]);

  const fetchApps = async () => {
    try {
      const params = new URLSearchParams();
      if (sortBy) params.append("sort", sortBy);
      if (selectedTag) params.append("tag", selectedTag);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/apps?${params}`);
      const data = await response.json();
      setApps(data.apps || []);
    } catch (error) {
      console.error("Error fetching apps:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags");
      const data = await response.json();
      setTags(data.tags || []);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-black min-h-screen">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          Discover Amazing Terminal Apps
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          A community-driven platform for finding and sharing the best
          terminal-based applications
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <SearchBar onSearch={setSearchQuery} />

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-300">
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-600 rounded-md px-3 py-1 text-sm bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="newest">Newest</option>
              <option value="votes">Most Voted</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>

          <TagFilter
            tags={tags}
            selectedTag={selectedTag}
            onTagSelect={setSelectedTag}
          />
        </div>
      </div>

      {/* Apps Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        </div>
      ) : apps.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            No apps found. Be the first to submit one!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      )}
    </div>
  );
}
