"use client";

import { useState, useEffect, useRef } from "react";
import { formatAsciiArt } from "@/lib/ascii-utils";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface App {
  id: string;
  name: string;
  shortDescription?: string;
  description: string;
  website?: string;
  documentationUrl?: string;
  asciiArt?: string;
  asciiArtAlignment?: "left" | "center" | "right";
  installCommands: string;
  primaryInstallCommand?: string;
  makefile?: string;
  identifier: string;
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
    asciiArtAlignment: app.asciiArtAlignment || "center",
    installCommands: app.installCommands,
    primaryInstallCommand: app.primaryInstallCommand || `hunt ${app.identifier}`,
    makefile: app.makefile || "",
    identifier: app.identifier || "",
    repoUrl: app.repoUrl,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // const [showAsciiPreview, setShowAsciiPreview] = useState(false);
  const [focusedElement, setFocusedElement] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<
    "description" | "install" | null
  >(null);

  // Refs for programmatic focus
  const nameRef = useRef<HTMLInputElement>(null);
  const shortDescRef = useRef<HTMLInputElement>(null);
  const websiteRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);
  const asciiRef = useRef<HTMLTextAreaElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const installRef = useRef<HTMLTextAreaElement>(null);
  const repoRef = useRef<HTMLInputElement>(null);
  const updateRef = useRef<HTMLButtonElement>(null);

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
        case "n":
          e.preventDefault();
          nameRef.current?.focus();
          break;
        case "s":
          e.preventDefault();
          shortDescRef.current?.focus();
          break;
        case "w":
          e.preventDefault();
          websiteRef.current?.focus();
          break;
        case "o":
          e.preventDefault();
          docRef.current?.focus();
          break;
        case "a":
          e.preventDefault();
          asciiRef.current?.focus();
          break;
        case "d":
          e.preventDefault();
          descriptionRef.current?.focus();
          break;
        case "i":
          e.preventDefault();
          installRef.current?.focus();
          break;
        case "r":
          e.preventDefault();
          repoRef.current?.focus();
          break;
        case "u":
          e.preventDefault();
          updateRef.current?.focus();
          break;
        case "p":
          e.preventDefault();
          setPreviewMode((prev) =>
            prev === "description" ? null : "description"
          );
          break;
        case "v":
          e.preventDefault();
          setPreviewMode((prev) => (prev === "install" ? null : "install"));
          break;
        case "escape":
          e.preventDefault();
          setFocusedElement(null);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

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

    if (!formData.identifier.trim()) {
      newErrors.identifier = "Identifier is required";
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

  return (
    <div className="space-y-6">
      {errors.submit && (
        <div
          className="p-4 mb-6 max-w-[650px] mx-auto"
          style={{
            backgroundColor: "var(--color-primary)",
          }}
        >
          <p style={{ color: "var(--color-highlight)" }}>! {errors.submit}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* App Name */}
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
            <span className="underline">1</span>-name
          </label>
          <input
            ref={nameRef}
            type="text"
            id="name"
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

        {/* Short Description */}
        <div className="flex items-center">
          <span
            className="mr-2 w-4 text-xs"
            style={{ color: "var(--color-text)" }}
          >
            {focusedElement === "shortDesc" ? ">" : " "}
          </span>
          <label
            htmlFor="shortDescription"
            className="text-sm pr-2"
            style={{
              color: "var(--color-text)",
              backgroundColor: "var(--color-primary)",
            }}
          >
            <span className="underline">s</span>hort description
          </label>
          <input
            ref={shortDescRef}
            type="text"
            id="shortDescription"
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

        {/* Website */}
        <div className="flex items-center">
          <span
            className="mr-2 w-4 text-xs"
            style={{ color: "var(--color-text)" }}
          >
            {focusedElement === "website" ? ">" : " "}
          </span>
          <label
            htmlFor="website"
            className="text-sm pr-2"
            style={{
              color: "var(--color-text)",
              backgroundColor: "var(--color-primary)",
            }}
          >
            <span className="underline">w</span>ebsite
          </label>
          <input
            ref={websiteRef}
            type="url"
            id="website"
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

        {/* Documentation URL */}
        <div className="flex items-center">
          <span
            className="mr-2 w-4 text-xs"
            style={{ color: "var(--color-text)" }}
          >
            {focusedElement === "doc" ? ">" : " "}
          </span>
          <label
            htmlFor="documentationUrl"
            className="text-sm pr-2"
            style={{
              color: "var(--color-text)",
              backgroundColor: "var(--color-primary)",
            }}
          >
            d<span className="underline">o</span>cs
          </label>
          <input
            ref={docRef}
            type="url"
            id="documentationUrl"
            value={formData.documentationUrl}
            onFocus={() => setFocusedElement("doc")}
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

        {/* Repository URL */}
        <div className="flex items-center">
          <span
            className="mr-2 w-4 text-xs"
            style={{ color: "var(--color-text)" }}
          >
            {focusedElement === "repo" ? ">" : " "}
          </span>
          <label
            htmlFor="repoUrl"
            className="text-sm pr-2"
            style={{
              color: "var(--color-text)",
              backgroundColor: "var(--color-primary)",
            }}
          >
            <span className="underline">r</span>epo
          </label>
          <input
            ref={repoRef}
            type="url"
            id="repoUrl"
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

        {/* ASCII Art */}
        <div>
          <div className="flex items-center mb-1">
            <span
              className="mr-2 w-4 text-xs"
              style={{ color: "var(--color-text)" }}
            >
              {focusedElement === "ascii" ? ">" : " "}
            </span>
            <label
              htmlFor="asciiArt"
              className="text-sm pr-2"
              style={{
                color: "var(--color-text)",
                backgroundColor: "var(--color-primary)",
              }}
            >
              <span className="underline">a</span>scii art (optional)
            </label>
          </div>
          <div
            className="p-3 min-h-[120px] ml-6 mt-3"
            style={{
              backgroundColor: "var(--color-primary)",
              border: "1px solid var(--color-accent)",
            }}
          >
            <textarea
              ref={asciiRef}
              id="asciiArt"
              value={formData.asciiArt}
              onFocus={() => setFocusedElement("ascii")}
              onBlur={() => setFocusedElement(null)}
              onChange={(e) => handleInputChange("asciiArt", e.target.value)}
              className="w-full bg-transparent font-mono text-sm focus:outline-none resize-none"
              style={{
                color: "var(--color-text)",
                minHeight: "100px",
              }}
              placeholder="Enter custom ASCII art (leave empty for default)"
            />
          </div>
          {false && (
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
          <div className="flex items-center mb-1">
            <span
              className="mr-2 w-4 text-xs"
              style={{ color: "var(--color-text)" }}
            >
              {focusedElement === "description" ? ">" : " "}
            </span>
            <label
              htmlFor="description"
              className="text-sm pr-2"
              style={{
                color: "var(--color-text)",
                backgroundColor: "var(--color-primary)",
              }}
            >
              <span className="underline">d</span>escription (markdown
              supported)
            </label>
            <button
              type="button"
              onClick={() =>
                setPreviewMode((prev) =>
                  prev === "description" ? null : "description"
                )
              }
              onFocus={() => setFocusedElement("descPreview")}
              onBlur={() => setFocusedElement(null)}
              className="text-xs focus:outline-none ml-2"
              style={{
                color: "var(--color-accent)",
                textDecoration:
                  focusedElement === "descPreview" ? "underline" : "none",
              }}
            >
              {previewMode === "description" ? (
                <>
                  [<span className="underline">e</span>dit mode]
                </>
              ) : (
                <>
                  [<span className="underline">p</span>review]
                </>
              )}
            </button>
          </div>

          {previewMode === "description" ? (
            <div
              className="p-3 min-h-[150px] text-sm ml-6 mt-3"
              style={{
                backgroundColor: "var(--color-primary)",
                border: "1px solid var(--color-accent)",
                color: "var(--color-text)",
              }}
            >
              <MarkdownRenderer content={formData.description} />
            </div>
          ) : (
            <div
              className="p-3 min-h-[150px] ml-6 mt-3"
              style={{
                backgroundColor: "var(--color-primary)",
                border: "1px solid var(--color-accent)",
              }}
            >
              <textarea
                ref={descriptionRef}
                id="description"
                value={formData.description}
                onFocus={() => setFocusedElement("description")}
                onBlur={() => setFocusedElement(null)}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="w-full bg-transparent text-sm focus:outline-none resize-none"
                style={{
                  color: "var(--color-text)",
                  minHeight: "130px",
                }}
                placeholder="Detailed description of your app..."
                required
              />
            </div>
          )}
        </div>
        {errors.description && (
          <div
            className="ml-6 text-sm"
            style={{ color: "var(--color-highlight)" }}
          >
            ! {errors.description}
          </div>
        )}

        {/* Installation Commands */}
        <div>
          <div className="flex items-center mb-1">
            <span
              className="mr-2 w-4 text-xs"
              style={{ color: "var(--color-text)" }}
            >
              {focusedElement === "install" ? ">" : " "}
            </span>
            <label
              htmlFor="installCommands"
              className="text-sm pr-2"
              style={{
                color: "var(--color-text)",
                backgroundColor: "var(--color-primary)",
              }}
            >
              <span className="underline">i</span>nstall commands
            </label>
            <button
              type="button"
              onClick={() =>
                setPreviewMode((prev) =>
                  prev === "install" ? null : "install"
                )
              }
              onFocus={() => setFocusedElement("installPreview")}
              onBlur={() => setFocusedElement(null)}
              className="text-xs focus:outline-none ml-2"
              style={{
                color: "var(--color-accent)",
                textDecoration:
                  focusedElement === "installPreview" ? "underline" : "none",
              }}
            >
              {previewMode === "install" ? (
                <>
                  [<span className="underline">e</span>dit mode]
                </>
              ) : (
                <>
                  [pre<span className="underline">v</span>iew]
                </>
              )}
            </button>
          </div>

          {previewMode === "install" ? (
            <div
              className="p-3 min-h-[100px] font-mono text-sm ml-6 mt-3"
              style={{
                backgroundColor: "var(--color-primary)",
                border: "1px solid var(--color-accent)",
                color: "var(--color-text)",
              }}
            >
              <pre className="whitespace-pre-wrap">
                {formData.installCommands}
              </pre>
            </div>
          ) : (
            <div
              className="p-3 min-h-[100px] ml-6 mt-3"
              style={{
                backgroundColor: "var(--color-primary)",
                border: "1px solid var(--color-accent)",
              }}
            >
              <textarea
                ref={installRef}
                id="installCommands"
                value={formData.installCommands}
                onFocus={() => setFocusedElement("install")}
                onBlur={() => setFocusedElement(null)}
                onChange={(e) =>
                  handleInputChange("installCommands", e.target.value)
                }
                className="w-full bg-transparent font-mono text-sm focus:outline-none resize-none"
                style={{
                  color: "var(--color-text)",
                  minHeight: "80px",
                }}
                placeholder="npm install your-app"
                required
              />
            </div>
          )}
        </div>
        {errors.installCommands && (
          <div
            className="ml-6 text-sm"
            style={{ color: "var(--color-highlight)" }}
          >
            ! {errors.installCommands}
          </div>
        )}

        {/* Identifier */}
        <div className="flex items-center">
          <span className="mr-2 w-4 text-xs" style={{ color: "var(--color-text)" }}>
            {focusedElement === "identifier" ? ">" : " "}
          </span>
          <label htmlFor="identifier" className="text-sm pr-2" style={{ color: "var(--color-text)", backgroundColor: "var(--color-primary)" }}>
            <span className="underline">I</span>D (unique)
          </label>
          <input
            type="text"
            id="identifier"
            value={formData.identifier}
            onFocus={() => setFocusedElement("identifier")}
            onBlur={() => setFocusedElement(null)}
            onChange={(e) => handleInputChange("identifier", e.target.value)}
            className="flex-1 px-2 py-1 focus:outline-none text-sm"
            style={{ backgroundColor: "var(--color-primary)", color: "var(--color-text)" }}
            placeholder="e.g. my-app"
            required
          />
        </div>
        {errors.identifier && (
          <div className="ml-6 text-sm" style={{ color: "var(--color-highlight)" }}>
            ! {errors.identifier}
          </div>
        )}

        {/* Primary Install Command */}
        <div className="flex items-center">
          <span className="mr-2 w-4 text-xs" style={{ color: "var(--color-text)" }}>
            {focusedElement === "primaryInstallCommand" ? ">" : " "}
          </span>
          <label htmlFor="primaryInstallCommand" className="text-sm pr-2" style={{ color: "var(--color-text)", backgroundColor: "var(--color-primary)" }}>
            <span className="underline">P</span>rimary Install Command
          </label>
          <input
            type="text"
            id="primaryInstallCommand"
            value={formData.primaryInstallCommand}
            onFocus={() => setFocusedElement("primaryInstallCommand")}
            onBlur={() => setFocusedElement(null)}
            onChange={(e) => handleInputChange("primaryInstallCommand", e.target.value)}
            className="flex-1 px-2 py-1 focus:outline-none text-sm"
            style={{ backgroundColor: "var(--color-primary)", color: "var(--color-text)" }}
            placeholder={`hunt ${formData.identifier}`}
          />
        </div>

        {/* ASCII Art Alignment */}
        <div className="flex items-center mb-2">
          <span className="mr-2 w-4 text-xs" style={{ color: "var(--color-text)" }}>
            {focusedElement === "asciiArtAlignment" ? ">" : " "}
          </span>
          <label className="text-sm pr-2" style={{ color: "var(--color-text)", backgroundColor: "var(--color-primary)" }}>
            ASCII Art Alignment
          </label>
          <div className="flex gap-2">
            {['left', 'center', 'right'].map((align) => (
              <button
                key={align}
                type="button"
                className={`px-2 py-1 text-xs border rounded ${formData.asciiArtAlignment === align ? 'bg-[var(--color-highlight)] text-[var(--color-primary)]' : 'bg-[var(--color-primary)] text-[var(--color-text)]'}`}
                style={{ borderColor: 'var(--color-accent)' }}
                onClick={() => handleInputChange('asciiArtAlignment', align)}
                onFocus={() => setFocusedElement("asciiArtAlignment")}
                onBlur={() => setFocusedElement(null)}
              >
                {align.charAt(0).toUpperCase() + align.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Makefile */}
        <div>
          <div className="flex items-center mb-1">
            <span className="mr-2 w-4 text-xs" style={{ color: "var(--color-text)" }}>
              {focusedElement === "makefile" ? ">" : " "}
            </span>
            <label htmlFor="makefile" className="text-sm pr-2" style={{ color: "var(--color-text)", backgroundColor: "var(--color-primary)" }}>
              Exec commands (optional)
            </label>
          </div>
          <div className="p-3 min-h-[80px] ml-6 mt-3" style={{ backgroundColor: "var(--color-primary)", border: "1px solid var(--color-accent)" }}>
            <textarea
              id="makefile"
              value={formData.makefile}
              onFocus={() => setFocusedElement("makefile")}
              onBlur={() => setFocusedElement(null)}
              onChange={(e) => handleInputChange("makefile", e.target.value)}
              className="w-full bg-transparent font-mono text-xs focus:outline-none resize-none"
              style={{ color: "var(--color-text)", minHeight: "60px" }}
              placeholder="Paste your exec commands here (optional)"
            />
          </div>
        </div>

        {/* Update Button */}
        <div className="flex items-center justify-start">
          <span
            className="mr-2 w-4 text-xs"
            style={{ color: "var(--color-text)" }}
          >
            {focusedElement === "update" ? ">" : " "}
          </span>
          <button
            ref={updateRef}
            type="button"
            onClick={() => handleSubmit()}
            onFocus={() => setFocusedElement("update")}
            onBlur={() => setFocusedElement(null)}
            disabled={loading}
            className="px-2 py-1 font-medium focus:outline-none transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "var(--color-highlight)",
              color: "var(--color-primary)",
            }}
          >
            {loading ? (
              "updating..."
            ) : (
              <>
                [<span className="underline">u</span>pdate app]
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
