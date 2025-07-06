"use client";

import { useState } from "react";
import { formatAsciiArt, TERMHUNT_ASCII } from "@/lib/ascii-utils";

interface App {
  id: string;
  name: string;
  shortDescription?: string;
  description: string;
  website?: string;
  documentationUrl?: string;
  asciiArt?: string;
  installCommands: string;
  repoUrl: string;
  creatorId: string;
}

interface EditAppFormProps {
  app: App;
  onSuccess: () => void;
}

export function EditAppForm({ app, onSuccess }: EditAppFormProps) {
  const [formData, setFormData] = useState({
    name: app.name,
    shortDescription: app.shortDescription || "",
    description: app.description,
    website: app.website || "",
    documentationUrl: app.documentationUrl || "",
    asciiArt: app.asciiArt || "",
    installCommands: app.installCommands,
    repoUrl: app.repoUrl,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAsciiPreview, setShowAsciiPreview] = useState(false);
  const [focusedElement, setFocusedElement] = useState<string | null>(null);

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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/apps/${app.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.error || "Failed to update app" });
      }
    } catch (error) {
      console.error("Error updating app:", error);
      setErrors({ submit: "Failed to update app" });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyboardShortcut = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "p":
          e.preventDefault();
          setShowAsciiPreview(!showAsciiPreview);
          break;
        case "s":
          e.preventDefault();
          handleSubmit(e as any);
          break;
      }
    }
  };

  return (
    <div className="space-y-6" onKeyDown={handleKeyboardShortcut}>
      {errors.submit && (
        <div
          className="p-4 mb-6"
          style={{
            backgroundColor: "var(--color-primary)",
          }}
        >
          <p style={{ color: "var(--color-highlight)" }}>! {errors.submit}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* App Name */}
        <div>
          <div className="flex items-center">
            <span
              className="mr-2 w-4 text-xs"
              style={{ color: "var(--color-text)" }}
            >
              {focusedElement === "name" ? ">" : " "}
            </span>
            <label
              className="text-sm pr-2"
              style={{
                color: "var(--color-text)",
                backgroundColor: "var(--color-primary)",
              }}
            >
              <span className="underline">n</span>ame
            </label>
            <input
              type="text"
              value={formData.name}
              onFocus={() => setFocusedElement("name")}
              onBlur={() => setFocusedElement(null)}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="flex-1 px-2 py-1 focus:outline-none text-sm"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-text)",
              }}
              placeholder="_"
              required
            />
          </div>
          {errors.name && (
            <div
              className="ml-6 text-sm"
              style={{ color: "var(--color-highlight)" }}
            >
              ! {errors.name}
            </div>
          )}
        </div>

        {/* Short Description */}
        <div>
          <div className="flex items-center">
            <span
              className="mr-2 w-4 text-xs"
              style={{ color: "var(--color-text)" }}
            >
              {focusedElement === "shortDesc" ? ">" : " "}
            </span>
            <label
              className="text-sm pr-2"
              style={{
                color: "var(--color-text)",
                backgroundColor: "var(--color-primary)",
              }}
            >
              <span className="underline">s</span>hort description
            </label>
            <input
              type="text"
              value={formData.shortDescription}
              onFocus={() => setFocusedElement("shortDesc")}
              onBlur={() => setFocusedElement(null)}
              onChange={(e) =>
                handleInputChange("shortDescription", e.target.value)
              }
              className="flex-1 px-2 py-1 focus:outline-none text-sm"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-text)",
              }}
              placeholder="_"
            />
          </div>
          {errors.shortDescription && (
            <div
              className="ml-6 text-sm"
              style={{ color: "var(--color-highlight)" }}
            >
              ! {errors.shortDescription}
            </div>
          )}
        </div>

        {/* ASCII Art */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <span
                className="mr-2 w-4 text-xs"
                style={{ color: "var(--color-text)" }}
              >
                {focusedElement === "ascii" ? ">" : " "}
              </span>
              <label
                className="text-sm pr-2"
                style={{
                  color: "var(--color-text)",
                  backgroundColor: "var(--color-primary)",
                }}
              >
                <span className="underline">a</span>scii art
              </label>
            </div>
            <button
              type="button"
              onClick={() => setShowAsciiPreview(!showAsciiPreview)}
              className="text-xs focus:outline-none"
              style={{ color: "var(--color-accent)" }}
            >
              ({showAsciiPreview ? "hide" : "show"} preview)
            </button>
          </div>
          <textarea
            value={formData.asciiArt}
            onFocus={() => setFocusedElement("ascii")}
            onBlur={() => setFocusedElement(null)}
            onChange={(e) => handleInputChange("asciiArt", e.target.value)}
            className="w-full px-3 py-2 font-mono text-sm focus:outline-none"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-text)",
              border: "1px solid var(--color-accent)",
              minHeight: "120px",
            }}
            placeholder="Enter custom ASCII art (leave empty for default)"
          />
          {showAsciiPreview && (
            <div
              className="mt-2 p-3 font-mono text-xs text-center border"
              style={{
                backgroundColor: "var(--color-primary)",
                borderColor: "var(--color-accent)",
                color: "var(--color-accent)",
              }}
            >
              <pre className="whitespace-pre">
                {formatAsciiArt(formData.asciiArt || "", formData.name)}
              </pre>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center mb-2">
            <span
              className="mr-2 w-4 text-xs"
              style={{ color: "var(--color-text)" }}
            >
              {focusedElement === "description" ? ">" : " "}
            </span>
            <label
              className="text-sm pr-2"
              style={{
                color: "var(--color-text)",
                backgroundColor: "var(--color-primary)",
              }}
            >
              <span className="underline">d</span>escription (markdown
              supported)
            </label>
          </div>
          <textarea
            value={formData.description}
            onFocus={() => setFocusedElement("description")}
            onBlur={() => setFocusedElement(null)}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="w-full px-3 py-2 text-sm focus:outline-none"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-text)",
              border: "1px solid var(--color-accent)",
              minHeight: "150px",
            }}
            placeholder="Detailed description of your app..."
            required
          />
          {errors.description && (
            <div
              className="ml-6 text-sm"
              style={{ color: "var(--color-highlight)" }}
            >
              ! {errors.description}
            </div>
          )}
        </div>

        {/* Installation Commands */}
        <div>
          <div className="flex items-center mb-2">
            <span
              className="mr-2 w-4 text-xs"
              style={{ color: "var(--color-text)" }}
            >
              {focusedElement === "install" ? ">" : " "}
            </span>
            <label
              className="text-sm pr-2"
              style={{
                color: "var(--color-text)",
                backgroundColor: "var(--color-primary)",
              }}
            >
              <span className="underline">i</span>nstall commands
            </label>
          </div>
          <textarea
            value={formData.installCommands}
            onFocus={() => setFocusedElement("install")}
            onBlur={() => setFocusedElement(null)}
            onChange={(e) =>
              handleInputChange("installCommands", e.target.value)
            }
            className="w-full px-3 py-2 font-mono text-sm focus:outline-none"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-text)",
              border: "1px solid var(--color-accent)",
              minHeight: "100px",
            }}
            placeholder="npm install your-app"
            required
          />
          {errors.installCommands && (
            <div
              className="ml-6 text-sm"
              style={{ color: "var(--color-highlight)" }}
            >
              ! {errors.installCommands}
            </div>
          )}
        </div>

        {/* Repository URL */}
        <div>
          <div className="flex items-center">
            <span
              className="mr-2 w-4 text-xs"
              style={{ color: "var(--color-text)" }}
            >
              {focusedElement === "repo" ? ">" : " "}
            </span>
            <label
              className="text-sm pr-2"
              style={{
                color: "var(--color-text)",
                backgroundColor: "var(--color-primary)",
              }}
            >
              <span className="underline">r</span>epo
            </label>
            <input
              type="url"
              value={formData.repoUrl}
              onFocus={() => setFocusedElement("repo")}
              onBlur={() => setFocusedElement(null)}
              onChange={(e) => handleInputChange("repoUrl", e.target.value)}
              className="flex-1 px-2 py-1 focus:outline-none text-sm"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-text)",
              }}
              placeholder="_"
              required
            />
          </div>
          {errors.repoUrl && (
            <div
              className="ml-6 text-sm"
              style={{ color: "var(--color-highlight)" }}
            >
              ! {errors.repoUrl}
            </div>
          )}
        </div>

        {/* Website */}
        <div>
          <div className="flex items-center">
            <span
              className="mr-2 w-4 text-xs"
              style={{ color: "var(--color-text)" }}
            >
              {focusedElement === "website" ? ">" : " "}
            </span>
            <label
              className="text-sm pr-2"
              style={{
                color: "var(--color-text)",
                backgroundColor: "var(--color-primary)",
              }}
            >
              <span className="underline">w</span>ebsite
            </label>
            <input
              type="url"
              value={formData.website}
              onFocus={() => setFocusedElement("website")}
              onBlur={() => setFocusedElement(null)}
              onChange={(e) => handleInputChange("website", e.target.value)}
              className="flex-1 px-2 py-1 focus:outline-none text-sm"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-text)",
              }}
              placeholder="_"
            />
          </div>
          {errors.website && (
            <div
              className="ml-6 text-sm"
              style={{ color: "var(--color-highlight)" }}
            >
              ! {errors.website}
            </div>
          )}
        </div>

        {/* Documentation URL */}
        <div>
          <div className="flex items-center">
            <span
              className="mr-2 w-4 text-xs"
              style={{ color: "var(--color-text)" }}
            >
              {focusedElement === "docs" ? ">" : " "}
            </span>
            <label
              className="text-sm pr-2"
              style={{
                color: "var(--color-text)",
                backgroundColor: "var(--color-primary)",
              }}
            >
              d<span className="underline">o</span>cs
            </label>
            <input
              type="url"
              value={formData.documentationUrl}
              onFocus={() => setFocusedElement("docs")}
              onBlur={() => setFocusedElement(null)}
              onChange={(e) =>
                handleInputChange("documentationUrl", e.target.value)
              }
              className="flex-1 px-2 py-1 focus:outline-none text-sm"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-text)",
              }}
              placeholder="_"
            />
          </div>
          {errors.documentationUrl && (
            <div
              className="ml-6 text-sm"
              style={{ color: "var(--color-highlight)" }}
            >
              ! {errors.documentationUrl}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex items-center space-x-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 font-medium focus:outline-none disabled:opacity-50"
            style={{
              backgroundColor: "var(--color-highlight)",
              color: "var(--color-primary)",
            }}
          >
            {loading ? "Updating..." : "Update App"} (Ctrl+S)
          </button>

          <div className="text-xs" style={{ color: "var(--color-accent)" }}>
            Press Ctrl+S to save, Ctrl+P to toggle ASCII preview
          </div>
        </div>
      </form>
    </div>
  );
}
