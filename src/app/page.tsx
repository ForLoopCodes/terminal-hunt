"use client";

import { useState, useEffect } from "react";
import { AppCard } from "@/components/AppCard";
import { SearchBar } from "@/components/SearchBar";
import { TagFilter } from "@/components/TagFilter";

interface App {
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
    <div
      className="min-h-screen pt-20 pb-8"
      style={{ backgroundColor: "var(--color-primary)" }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
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
                  
  D I S C O V E R   W I L D   T E R M I N A L   A P P S
  `}
          </pre>
        </div>

        <div className="space-y-6 max-w-[650px] mx-auto">
          {/* Search and Filters */}
          <div className="space-y-4">
            <SearchBar onSearch={setSearchQuery} />

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
                sort
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-2 py-1 focus:outline-none text-sm"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-text)",
                }}
              >
                <option value="newest">newest</option>
                <option value="votes">most voted</option>
                <option value="views">most viewed</option>
              </select>
            </div>

            <TagFilter
              tags={tags}
              selectedTag={selectedTag}
              onTagSelect={setSelectedTag}
            />
          </div>

          {/* Apps List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div
                className="font-mono text-lg"
                style={{ color: "var(--color-text)" }}
              >
                loading_apps...
              </div>
            </div>
          ) : apps.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex items-center justify-center">
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
                  no apps found - be the first to submit one!
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {apps.map((app, index) => (
                <div key={app.id}>
                  <AppCard app={app} />
                  {index < apps.length - 1 && (
                    <div className="mx-6 mt-4">
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
  );
}
