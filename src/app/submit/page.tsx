"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { TermHuntLogo } from "@/components/TermHuntLogo";

interface Tag {
  id: string;
  name: string;
  count?: number;
}

export default function SubmitAppPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    shortDescription: "",
    description: "",
    website: "",
    documentationUrl: "",
    asciiArt: "",
    installCommands: "",
    repoUrl: "",
    tagIds: [] as string[],
  });

  const [tags, setTags] = useState<Tag[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewMode, setPreviewMode] = useState<
    "description" | "install" | null
  >(null);
  const [focusedElement, setFocusedElement] = useState<string | null>(null);

  // Refs for programmatic focus
  const nameRef = useRef<HTMLInputElement>(null);
  const shortDescRef = useRef<HTMLInputElement>(null);
  const websiteRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);
  const asciiRef = useRef<HTMLTextAreaElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const installRef = useRef<HTMLTextAreaElement>(null);
  const repoRef = useRef<HTMLInputElement>(null);
  const tagSearchRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    fetchTags();
  }, []);

  // Debounced tag search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (tagSearch.trim()) {
        searchTags(tagSearch);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [tagSearch]);

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
        case "c":
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
        case "t":
          e.preventDefault();
          tagSearchRef.current?.focus();
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
      console.log("Fetching popular tags...");
      const response = await fetch("/api/tags?limit=15");
      console.log("Tags response status:", response.status);
      const data = await response.json();
      console.log("Tags data:", data);
      setTags(data.tags || []);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const searchTags = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `/api/tags?search=${encodeURIComponent(query)}&limit=10`
      );
      const data = await response.json();
      setSearchResults(data.tags || []);
    } catch (error) {
      console.error("Error searching tags:", error);
      setSearchResults([]);
    }
  };

  const createNewTag = async (tagName: string) => {
    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tagName }),
      });

      if (response.ok) {
        const data = await response.json();
        const newTag = data.tag;

        // Add to selected tags
        setFormData((prev) => ({
          ...prev,
          tagIds: [...prev.tagIds, newTag.id],
        }));

        // Add to tags list and search results
        setTags((prev) => [newTag, ...prev]);
        setSearchResults((prev) => [newTag, ...prev]);

        // Clear search
        setTagSearch("");
        setShowTagDropdown(false);

        return newTag;
      } else {
        const errorData = await response.json();
        if (response.status === 409) {
          // Tag already exists, try to find and select it
          await searchTags(tagName);

          // Try to find the existing tag in current results or tags
          const existingTag = [...tags, ...searchResults].find(
            (tag) => tag.name.toLowerCase() === tagName.toLowerCase()
          );

          if (existingTag && !formData.tagIds.includes(existingTag.id)) {
            handleTagToggle(existingTag.id);
          }

          setTagSearch("");
          setShowTagDropdown(false);
        } else {
          console.error("Error creating tag:", errorData.error);
        }
      }
    } catch (error) {
      console.error("Error creating tag:", error);
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
        <div className="text-gray-400 font-mono text-sm">loading_submit...</div>
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
          <TermHuntLogo size="md" />
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
              ref={shortDescRef}
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
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, website: e.target.value }))
              }
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
              do<span className="underline">c</span>s
            </label>
            <input
              ref={docRef}
              type="url"
              id="documentationUrl"
              value={formData.documentationUrl}
              onFocus={() => setFocusedElement("doc")}
              onBlur={() => setFocusedElement(null)}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  documentationUrl: e.target.value,
                }))
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
                    <MarkdownRenderer
                      content={
                        formData.description || "*No content to preview*"
                      }
                    />
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
                    <MarkdownRenderer
                      content={
                        formData.installCommands ||
                        "*No installation instructions*"
                      }
                    />
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

          {/* ASCII Art */}
          <div>
            <div className="flex items-start">
              <span
                className="mr-2 w-4 text-xs mt-1"
                style={{ color: "var(--color-text)" }}
              >
                {focusedElement === "ascii" ? ">" : " "}
              </span>
              <div className="flex-1">
                <label
                  htmlFor="asciiArt"
                  className="text-sm block mb-2"
                  style={{ color: "var(--color-text)" }}
                >
                  <span className="underline">a</span>scii art (optional)
                </label>
                <textarea
                  ref={asciiRef}
                  id="asciiArt"
                  value={formData.asciiArt}
                  onFocus={() => setFocusedElement("ascii")}
                  onBlur={() => setFocusedElement(null)}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      asciiArt: e.target.value,
                    }))
                  }
                  rows={6}
                  className="w-full px-3 py-2 border focus:outline-none text-xs font-mono"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    border: "1px solid var(--color-accent)",
                    color: "var(--color-text)",
                    resize: "vertical",
                  }}
                  placeholder="create custom ascii art for your app..."
                />
              </div>
            </div>
            {errors.asciiArt && (
              <div
                className="ml-6 text-sm"
                style={{ color: "var(--color-highlight)" }}
              >
                ! {errors.asciiArt}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="ml-6">
            <label
              className="block text-sm mb-2"
              style={{ color: "var(--color-text)" }}
            >
              <span className="underline">t</span>ags (select multiple)
            </label>

            {/* Tag Search */}
            <div className="relative mb-3">
              <div className="flex items-center">
                <span
                  className="-ml-6 mr-2 w-4 text-xs"
                  style={{ color: "var(--color-text)" }}
                >
                  {showTagDropdown ? ">" : " "}
                </span>
                <input
                  ref={tagSearchRef}
                  type="text"
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  onFocus={() => setShowTagDropdown(true)}
                  onBlur={() => {
                    // Delay hiding dropdown to allow clicks
                    setTimeout(() => setShowTagDropdown(false), 200);
                  }}
                  className="flex-1 px-2 py-1 focus:outline-none text-sm"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-text)",
                    border: "1px solid var(--color-accent)",
                  }}
                  placeholder="search tags or create new..."
                />
              </div>

              {/* Search Dropdown */}
              {showTagDropdown &&
                (tagSearch.trim() || searchResults.length > 0) && (
                  <div
                    className="absolute top-full left-6 right-0 mt-1 border max-h-48 overflow-y-auto z-10"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      border: "1px solid var(--color-accent)",
                    }}
                  >
                    {searchResults.length > 0 ? (
                      <>
                        {searchResults.map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => {
                              handleTagToggle(tag.id);
                              setTagSearch("");
                              setShowTagDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-opacity-50 transition-colors flex items-center justify-between"
                            style={{
                              color: formData.tagIds.includes(tag.id)
                                ? "var(--color-highlight)"
                                : "var(--color-text)",
                              backgroundColor: "transparent",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "var(--color-accent)";
                              e.currentTarget.style.opacity = "0.3";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                              e.currentTarget.style.opacity = "1";
                            }}
                          >
                            <span>{tag.name}</span>
                            <span style={{ color: "var(--color-accent)" }}>
                              {formData.tagIds.includes(tag.id)
                                ? "✓"
                                : `${tag.count || 0}`}
                            </span>
                          </button>
                        ))}
                        {tagSearch.trim() &&
                          !searchResults.some(
                            (tag) =>
                              tag.name.toLowerCase() ===
                              tagSearch.trim().toLowerCase()
                          ) && (
                            <button
                              type="button"
                              onClick={() => createNewTag(tagSearch.trim())}
                              className="w-full text-left px-3 py-2 text-sm transition-colors border-t"
                              style={{
                                color: "var(--color-accent)",
                                backgroundColor: "transparent",
                                borderTop: "1px solid var(--color-accent)",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "var(--color-accent)";
                                e.currentTarget.style.opacity = "0.3";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                                e.currentTarget.style.opacity = "1";
                              }}
                            >
                              + Create &quot;{tagSearch.trim()}&quot;
                            </button>
                          )}
                      </>
                    ) : tagSearch.trim() ? (
                      <button
                        type="button"
                        onClick={() => createNewTag(tagSearch.trim())}
                        className="w-full text-left px-3 py-2 text-sm transition-colors"
                        style={{
                          color: "var(--color-accent)",
                          backgroundColor: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "var(--color-accent)";
                          e.currentTarget.style.opacity = "0.3";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.opacity = "1";
                        }}
                      >
                        + Create &quot;{tagSearch.trim()}&quot;
                      </button>
                    ) : null}
                  </div>
                )}
            </div>

            {/* Selected Tags */}
            {formData.tagIds.length > 0 && (
              <div className="mb-3">
                <span
                  className="text-xs mb-2 block"
                  style={{ color: "var(--color-accent)" }}
                >
                  selected tags:
                </span>
                <div className="flex flex-wrap gap-2">
                  {formData.tagIds.map((tagId) => {
                    const tag = [...tags, ...searchResults].find(
                      (t) => t.id === tagId
                    );
                    if (!tag) return null;
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleTagToggle(tag.id)}
                        className="px-3 py-1 text-sm transition-colors flex items-center gap-2"
                        style={{
                          backgroundColor: "var(--color-highlight)",
                          color: "var(--color-primary)",
                        }}
                      >
                        {tag.name}
                        <span className="text-xs">×</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Popular Tags */}
            {tags.length === 0 ? (
              <div className="text-sm" style={{ color: "var(--color-accent)" }}>
                Loading tags...
              </div>
            ) : (
              <div>
                <span
                  className="text-xs mb-2 block"
                  style={{ color: "var(--color-accent)" }}
                >
                  popular tags:
                </span>
                <div
                  className="flex flex-wrap gap-2 min-h-[2.5rem] p-3"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    border: "1px solid var(--color-accent)",
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
                          : "transparent",
                        color: formData.tagIds.includes(tag.id)
                          ? "var(--color-primary)"
                          : "var(--color-text)",
                        border: formData.tagIds.includes(tag.id)
                          ? "none"
                          : "1px solid var(--color-accent)",
                      }}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
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
              {loading ? (
                "uploading..."
              ) : (
                <>
                  [<span className="underline">u</span>pload app]
                </>
              )}
            </button>
          </div>

          {/* Keyboard Shortcuts Help */}
          <div
            className="mt-8 ml-6 p-3 text-xs"
            style={{
              backgroundColor: "var(--color-primary)",
              border: "1px solid var(--color-accent)",
              color: "var(--color-accent)",
            }}
          >
            <div className="font-mono mb-1">keyboard shortcuts:</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono">
              <span>[n] name</span>
              <span>[s] short desc</span>
              <span>[w] website</span>
              <span>[c] docs</span>
              <span>[a] ascii art</span>
              <span>[d] description</span>
              <span>[i] install</span>
              <span>[r] repo</span>
              <span>[t] tags</span>
              <span>[p] preview desc</span>
              <span>[v] preview install</span>
              <span>[u] upload</span>
              <span>[u] upload</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
