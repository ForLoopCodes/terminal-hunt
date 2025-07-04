"use client";

import { useState, useEffect, useRef } from "react";
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
    shortDescription: "",
    description: "",
    website: "",
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
  const [focusedElement, setFocusedElement] = useState<string | null>(null);

  // Refs for programmatic focus
  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const installRef = useRef<HTMLTextAreaElement>(null);
  const repoRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    fetchTags();
  }, []);

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
          submitRef.current?.click();
          break;
        case "p":
          e.preventDefault();
          setPreviewMode(previewMode === "description" ? null : "description");
          break;
        case "v":
          e.preventDefault();
          setPreviewMode(previewMode === "install" ? null : "install");
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [previewMode]);

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

    if (!formData.shortDescription.trim()) {
      newErrors.shortDescription = "Short description is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.installCommands.trim()) {
      newErrors.installCommands = "Installation instructions are required";
    }

    if (!formData.repoUrl.trim()) {
      newErrors.repoUrl = "Repository URL is required";
    } else {
      try {
        new URL(formData.repoUrl);
      } catch {
        newErrors.repoUrl = "Invalid URL format";
      }
    }

    if (formData.website && formData.website.trim()) {
      try {
        new URL(formData.website);
      } catch {
        newErrors.website = "Invalid URL format";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 font-mono text-lg">loading_submit...</div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to signin
  }

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
                  
  S U B M I T   Y O U R   A P P
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

        <div className="space-y-6 max-w-[650px] mx-auto">
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
              <span className="underline">n</span>ame
            </label>
            <input
              ref={nameRef}
              type="text"
              id="name"
              value={formData.name}
              onFocus={() => setFocusedElement("name")}
              onBlur={() => setFocusedElement(null)}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
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
              type="text"
              id="shortDescription"
              value={formData.shortDescription}
              onFocus={() => setFocusedElement("shortDesc")}
              onBlur={() => setFocusedElement(null)}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  shortDescription: e.target.value,
                }))
              }
              className="flex-1 px-2 py-1 focus:outline-none text-sm"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-text)",
              }}
              placeholder="_"
              required
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
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, repoUrl: e.target.value }))
              }
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

          {/* Description */}
          <div>
            <div className="flex items-start">
              <span
                className="mr-2 w-4 text-xs mt-1"
                style={{ color: "var(--color-text)" }}
              >
                {focusedElement === "description" ? ">" : " "}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="description"
                    className="text-sm"
                    style={{ color: "var(--color-text)" }}
                  >
                    <span className="underline">d</span>escription (markdown
                    supported)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewMode(
                        previewMode === "description" ? null : "description"
                      )
                    }
                    className="text-sm px-2 py-1 focus:outline-none focus:underline"
                    style={{
                      color: "var(--color-accent)",
                      backgroundColor:
                        previewMode === "description"
                          ? "var(--color-accent)"
                          : "var(--color-primary)",
                    }}
                  >
                    [{previewMode === "description" ? "edit" : "preview"}]
                  </button>
                </div>
                {previewMode === "description" ? (
                  <div
                    className="min-h-[120px] p-3 text-sm"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      color: "var(--color-text)",
                    }}
                  >
                    <ReactMarkdown>
                      {formData.description || "*No content to preview*"}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <textarea
                    ref={descriptionRef}
                    id="description"
                    value={formData.description}
                    onFocus={() => setFocusedElement("description")}
                    onBlur={() => setFocusedElement(null)}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={6}
                    className="w-full px-3 py-2 border focus:outline-none text-sm font-mono"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      border: "1px solid var(--color-accent)",
                      color: "var(--color-text)",
                      resize: "vertical",
                    }}
                    placeholder="_"
                    required
                  />
                )}
              </div>
            </div>
            {errors.description && (
              <div
                className="ml-6 text-sm"
                style={{ color: "var(--color-highlight)" }}
              >
                ! {errors.description}
              </div>
            )}
          </div>

          {/* Install Commands */}
          <div>
            <div className="flex items-start">
              <span
                className="mr-2 w-4 text-xs mt-1"
                style={{ color: "var(--color-text)" }}
              >
                {focusedElement === "install" ? ">" : " "}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="installCommands"
                    className="text-sm"
                    style={{ color: "var(--color-text)" }}
                  >
                    <span className="underline">i</span>nstall commands
                    (markdown supported)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewMode(
                        previewMode === "install" ? null : "install"
                      )
                    }
                    className="text-sm px-2 py-1 focus:outline-none focus:underline"
                    style={{
                      color: "var(--color-accent)",
                      backgroundColor:
                        previewMode === "install"
                          ? "var(--color-accent)"
                          : "var(--color-primary)",
                    }}
                  >
                    [{previewMode === "install" ? "edit" : "view"}]
                  </button>
                </div>
                {previewMode === "install" ? (
                  <div
                    className="min-h-[120px] p-3 text-sm"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      color: "var(--color-text)",
                    }}
                  >
                    <ReactMarkdown>
                      {formData.installCommands ||
                        "*No installation instructions*"}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <textarea
                    ref={installRef}
                    id="installCommands"
                    value={formData.installCommands}
                    onFocus={() => setFocusedElement("install")}
                    onBlur={() => setFocusedElement(null)}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        installCommands: e.target.value,
                      }))
                    }
                    rows={4}
                    className="w-full px-3 py-2 border focus:outline-none text-sm font-mono"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      border: "1px solid var(--color-accent)",
                      color: "var(--color-text)",
                      resize: "vertical",
                    }}
                    placeholder={`_`}
                    required
                  />
                )}
              </div>
            </div>
            {errors.installCommands && (
              <div
                className="ml-6 text-sm"
                style={{ color: "var(--color-highlight)" }}
              >
                ! {errors.installCommands}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="mx-6">
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--color-text)" }}
            >
              tags (select multiple)
            </label>
            {tags.length === 0 ? (
              <div className="text-sm" style={{ color: "var(--color-accent)" }}>
                Loading tags...
              </div>
            ) : (
              <div
                className="flex flex-wrap gap-2 min-h-[2.5rem] p-3"
                style={{
                  backgroundColor: "var(--color-primary)",
                }}
              >
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className="px-3 py-1 text-sm transition-colors"
                    style={{
                      backgroundColor: formData.tagIds.includes(tag.id)
                        ? "var(--color-highlight)"
                        : "var(--color-primary)",
                      color: formData.tagIds.includes(tag.id)
                        ? "var(--color-primary)"
                        : "var(--color-text)",
                    }}
                  >
                    {tag.name}
                  </button>
                ))}
                {tags.length === 0 && (
                  <span
                    className="text-sm"
                    style={{ color: "var(--color-accent)" }}
                  >
                    No tags available
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-start">
            <span
              className="mr-2 w-4 text-xs"
              style={{ color: "var(--color-text)" }}
            >
              {focusedElement === "submit" ? ">" : " "}
            </span>
            <button
              ref={submitRef}
              type="button"
              onClick={handleSubmit}
              onFocus={() => setFocusedElement("submit")}
              onBlur={() => setFocusedElement(null)}
              disabled={loading}
              className="px-2 py-1 font-medium focus:outline-none transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--color-highlight)",
                color: "var(--color-primary)",
              }}
            >
              {loading ? "uploading..." : "[upload app]"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
