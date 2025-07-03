"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

interface Tag {
  id: string;
  name: string;
}

export default function SubmitAppPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    installCommands: "",
    repoUrl: "",
    tagIds: [] as string[],
  });

  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewMode, setPreviewMode] = useState<
    "description" | "install" | null
  >(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags");
      const data = await response.json();
      setTags(data.tags || []);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "App name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.installCommands.trim()) {
      newErrors.installCommands = "Installation commands are required";
    }

    if (!formData.repoUrl.trim()) {
      newErrors.repoUrl = "Repository URL is required";
    } else {
      // Basic URL validation
      try {
        new URL(formData.repoUrl);
      } catch {
        newErrors.repoUrl = "Please enter a valid URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/apps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const app = await response.json();
        router.push(`/app/${app.id}`);
      } else {
        const data = await response.json();
        setErrors({ submit: data.error || "Failed to submit app" });
      }
    } catch (error) {
      console.error("Error submitting app:", error);
      setErrors({ submit: "Failed to submit app" });
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  if (status === "loading") {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to signin
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-black border border-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-white mb-6">
          Submit Terminal App
        </h1>

        {errors.submit && (
          <div className="bg-red-900/20 border border-red-800 rounded-md p-4 mb-6">
            <p className="text-red-400">{errors.submit}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* App Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              App Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., MyAwesomeTerminalApp"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Repository URL */}
          <div>
            <label
              htmlFor="repoUrl"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Repository URL *
            </label>
            <input
              type="url"
              id="repoUrl"
              value={formData.repoUrl}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, repoUrl: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://github.com/username/repo"
            />
            {errors.repoUrl && (
              <p className="mt-1 text-sm text-red-400">{errors.repoUrl}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-300"
              >
                Description * (Markdown supported)
              </label>
              <button
                type="button"
                onClick={() =>
                  setPreviewMode(
                    previewMode === "description" ? null : "description"
                  )
                }
                className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors"
              >
                {previewMode === "description" ? "Edit" : "Preview"}
              </button>
            </div>

            {previewMode === "description" ? (
              <div className="w-full min-h-32 px-3 py-2 border border-gray-600 rounded-md bg-gray-900">
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown>
                    {formData.description || "*No description provided*"}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={6}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe what your terminal app does, its features, and why it's useful..."
              />
            )}
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description}</p>
            )}
          </div>

          {/* Installation Commands */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="installCommands"
                className="block text-sm font-medium text-gray-300"
              >
                Installation Commands * (Markdown supported)
              </label>
              <button
                type="button"
                onClick={() =>
                  setPreviewMode(previewMode === "install" ? null : "install")
                }
                className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors"
              >
                {previewMode === "install" ? "Edit" : "Preview"}
              </button>
            </div>

            {previewMode === "install" ? (
              <div className="w-full min-h-32 px-3 py-2 border border-gray-600 rounded-md bg-gray-900">
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown>
                    {formData.installCommands ||
                      "*No installation commands provided*"}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <textarea
                id="installCommands"
                value={formData.installCommands}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    installCommands: e.target.value,
                  }))
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="```bash\nnpm install -g your-app\n# or\ncurl -sSL https://install.example.com | bash\n```"
              />
            )}
            {errors.installCommands && (
              <p className="mt-1 text-sm text-red-400">
                {errors.installCommands}
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags (Select relevant categories)
            </label>
            {tags.length === 0 ? (
              <div className="text-gray-500 text-sm">Loading tags...</div>
            ) : (
              <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-3 border border-gray-600 rounded-md bg-gray-900">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      formData.tagIds.includes(tag.id)
                        ? "bg-blue-600 text-white border border-blue-500"
                        : "bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700 hover:border-gray-500"
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
                {tags.length === 0 && (
                  <span className="text-gray-500 text-sm">
                    No tags available
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? "Submitting..." : "Submit App"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
