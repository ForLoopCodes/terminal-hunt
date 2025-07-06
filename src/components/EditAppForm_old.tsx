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
    } else {
      try {
        new URL(formData.repoUrl);
      } catch {
        newErrors.repoUrl = "Please enter a valid URL";
      }
    }

    if (formData.website && formData.website.trim()) {
      try {
        new URL(formData.website);
      } catch {
        newErrors.website = "Please enter a valid website URL";
      }
    }

    if (formData.documentationUrl && formData.documentationUrl.trim()) {
      try {
        new URL(formData.documentationUrl);
      } catch {
        newErrors.documentationUrl = "Please enter a valid documentation URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
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
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text)" }}
          >
            Short Description
          </label>
          <input
            type="text"
            value={formData.shortDescription}
            onChange={(e) =>
              handleInputChange("shortDescription", e.target.value)
            }
            className="w-full px-3 py-2 border focus:outline-none text-sm"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-text)",
              borderColor: "var(--color-accent)",
            }}
            placeholder="Brief description (optional)"
            maxLength={200}
          />
        </div>

        {/* ASCII Art */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              className="text-sm font-medium"
              style={{ color: "var(--color-text)" }}
            >
              ASCII Art (optional)
            </label>
            <button
              type="button"
              onClick={() => setShowAsciiPreview(!showAsciiPreview)}
              className="text-xs px-2 py-1 border focus:outline-none"
              style={{
                color: "var(--color-accent)",
                borderColor: "var(--color-accent)",
              }}
              title="Press Ctrl+P to toggle preview"
            >
              {showAsciiPreview ? "Hide Preview" : "Show Preview"} (Ctrl+P)
            </button>
          </div>
          <textarea
            value={formData.asciiArt}
            onChange={(e) => handleInputChange("asciiArt", e.target.value)}
            className="w-full px-3 py-2 border focus:outline-none font-mono text-sm"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-text)",
              borderColor: "var(--color-accent)",
              minHeight: "120px",
            }}
            placeholder="Enter custom ASCII art for your app (leave empty for default Terminal Hunt art)"
          />
          {showAsciiPreview && (
            <div
              className="mt-2 p-3 border"
              style={{ borderColor: "var(--color-accent)" }}
            >
              <div
                className="text-xs mb-2"
                style={{ color: "var(--color-accent)" }}
              >
                ASCII Art Preview:
              </div>
              <pre
                className="text-xs whitespace-pre-wrap"
                style={{ color: "var(--color-accent)" }}
              >
                {formatAsciiArt(
                  formData.asciiArt || TERMHUNT_ASCII,
                  formData.name
                )}
              </pre>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text)" }}
          >
            Description * (Markdown supported)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="w-full px-3 py-2 border focus:outline-none text-sm"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-text)",
              borderColor: errors.description
                ? "var(--color-highlight)"
                : "var(--color-accent)",
              minHeight: "150px",
            }}
            placeholder="Detailed description of your app..."
          />
          {errors.description && (
            <div
              className="text-sm mt-1"
              style={{ color: "var(--color-highlight)" }}
            >
              {errors.description}
            </div>
          )}
        </div>

        {/* Installation Commands */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text)" }}
          >
            Installation Commands * (Markdown supported)
          </label>
          <textarea
            value={formData.installCommands}
            onChange={(e) =>
              handleInputChange("installCommands", e.target.value)
            }
            className="w-full px-3 py-2 border focus:outline-none font-mono text-sm"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-text)",
              borderColor: errors.installCommands
                ? "var(--color-highlight)"
                : "var(--color-accent)",
              minHeight: "100px",
            }}
            placeholder="npm install your-app"
          />
          {errors.installCommands && (
            <div
              className="text-sm mt-1"
              style={{ color: "var(--color-highlight)" }}
            >
              {errors.installCommands}
            </div>
          )}
        </div>

        {/* Repository URL */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text)" }}
          >
            Repository URL *
          </label>
          <input
            type="url"
            value={formData.repoUrl}
            onChange={(e) => handleInputChange("repoUrl", e.target.value)}
            className="w-full px-3 py-2 border focus:outline-none text-sm"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-text)",
              borderColor: errors.repoUrl
                ? "var(--color-highlight)"
                : "var(--color-accent)",
            }}
            placeholder="https://github.com/username/repo"
          />
          {errors.repoUrl && (
            <div
              className="text-sm mt-1"
              style={{ color: "var(--color-highlight)" }}
            >
              {errors.repoUrl}
            </div>
          )}
        </div>

        {/* Website */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text)" }}
          >
            Website
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => handleInputChange("website", e.target.value)}
            className="w-full px-3 py-2 border focus:outline-none text-sm"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-text)",
              borderColor: errors.website
                ? "var(--color-highlight)"
                : "var(--color-accent)",
            }}
            placeholder="https://yourapp.com (optional)"
          />
          {errors.website && (
            <div
              className="text-sm mt-1"
              style={{ color: "var(--color-highlight)" }}
            >
              {errors.website}
            </div>
          )}
        </div>

        {/* Documentation URL */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text)" }}
          >
            Documentation URL
          </label>
          <input
            type="url"
            value={formData.documentationUrl}
            onChange={(e) =>
              handleInputChange("documentationUrl", e.target.value)
            }
            className="w-full px-3 py-2 border focus:outline-none text-sm"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-text)",
              borderColor: errors.documentationUrl
                ? "var(--color-highlight)"
                : "var(--color-accent)",
            }}
            placeholder="https://docs.yourapp.com (optional)"
          />
          {errors.documentationUrl && (
            <div
              className="text-sm mt-1"
              style={{ color: "var(--color-highlight)" }}
            >
              {errors.documentationUrl}
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

        {errors.submit && (
          <div
            className="text-sm mt-2"
            style={{ color: "var(--color-highlight)" }}
          >
            {errors.submit}
          </div>
        )}
      </form>
    </div>
  );
}
