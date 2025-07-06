"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

interface Collection {
  id: string;
  name: string;
  description?: string;
  color: string;
  appCount: number;
  isPublic: boolean;
}

interface CollectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appId: string;
  appName: string;
}

export function CollectionsModal({
  isOpen,
  onClose,
  appId,
  appName,
}: CollectionsModalProps) {
  const { data: session } = useSession();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Refs for keyboard navigation
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && session) {
      fetchCollections();
    }
  }, [isOpen, session]);

  // Handle keyboard navigation and escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        case "x":
          // Allow 'x' to close if not in an input
          const activeElement = document.activeElement;
          if (
            activeElement?.tagName !== "INPUT" &&
            activeElement?.tagName !== "TEXTAREA"
          ) {
            e.preventDefault();
            onClose();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/collections");
      const data = await response.json();
      setCollections(data.collections || []);
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setLoading(false);
    }
  };

  const createCollection = async () => {
    if (!newCollectionName.trim()) return;

    setCreating(true);
    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCollectionName.trim(),
          description: "",
          isPublic: false,
        }),
      });

      if (response.ok) {
        const newCollection = await response.json();
        setCollections([...collections, newCollection]);
        setNewCollectionName("");
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error("Error creating collection:", error);
    } finally {
      setCreating(false);
    }
  };

  const addToCollection = async (collectionId: string) => {
    try {
      const response = await fetch(`/api/collections/${collectionId}/apps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId }),
      });

      if (response.ok) {
        // Update collection app count
        setCollections(
          collections.map((c) =>
            c.id === collectionId ? { ...c, appCount: c.appCount + 1 } : c
          )
        );
        onClose();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to add to collection");
      }
    } catch (error) {
      console.error("Error adding to collection:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 text-sm flex items-center justify-center z-50 p-2 sm:p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="border max-w-md w-full max-h-[90vh] sm:max-h-[80vh] overflow-hidden"
        style={{
          backgroundColor: "var(--color-primary)",
          borderColor: "var(--color-accent)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-4 sm:px-6 py-4 border-b"
          style={{ borderColor: "var(--color-accent)" }}
        >
          <div className="flex items-center justify-between">
            <h3
              className="text-sm font-mono"
              style={{ color: "var(--color-text)" }}
            >
              {"> add to collection"}
            </h3>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="focus:outline-none focus:underline font-mono"
              style={{ color: "var(--color-text)" }}
              title="Close (Esc or X)"
            >
              [<span className="underline">x</span>]
            </button>
          </div>
          <p
            className="text-xs sm:text-sm mt-1 font-mono break-words"
            style={{ color: "var(--color-text)" }}
          >
            add &quot;{appName}&quot; to collection
          </p>
        </div>

        {/* Content */}
        <div className="p-2 max-h-72 sm:max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div
                className="font-mono text-sm"
                style={{ color: "var(--color-text)" }}
              >
                loading_collections...
              </div>
            </div>
          ) : (
            <>
              {/* Collections List */}
              {collections.length > 0 ? (
                <div className="space-y-2 mb-2">
                  {collections.map((collection) => (
                    <button
                      key={collection.id}
                      onClick={() => addToCollection(collection.id)}
                      className="w-full flex items-center justify-between p-3 border transition-colors text-left focus:outline-none font-mono"
                      style={{
                        borderColor: "var(--color-accent)",
                        backgroundColor: "var(--color-primary)",
                        color: "var(--color-text)",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "var(--color-highlight)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "var(--color-accent)";
                      }}
                    >
                      <div className="flex items-center">
                        <div>
                          <div
                            className="font-medium text-sm"
                            style={{ color: "var(--color-text)" }}
                          >
                            {collection.name}
                          </div>
                          <div
                            className="text-xs"
                            style={{ color: "var(--color-text)" }}
                          >
                            {collection.appCount} apps
                          </div>
                        </div>
                      </div>
                      <span
                        className="text-sm"
                        style={{ color: "var(--color-text)" }}
                      >
                        [+]
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div
                    className="text-sm font-mono mb-4"
                    style={{ color: "var(--color-text)" }}
                  >
                    [ ] empty
                  </div>
                  <p
                    className="text-sm font-mono mb-4"
                    style={{ color: "var(--color-text)" }}
                  >
                    no collections yet
                  </p>
                </div>
              )}

              {/* Create New Collection */}
              {!showCreateForm ? (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full flex items-center justify-center p-3 border transition-colors focus:outline-none font-mono"
                  style={{
                    borderColor: "var(--color-accent)",
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-text)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--color-highlight)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--color-accent)";
                  }}
                >
                  <span className="text-sm mr-2">[+]</span>
                  new
                </button>
              ) : (
                <div
                  className="border p-4 space-y-3"
                  style={{
                    borderColor: "var(--color-accent)",
                    backgroundColor: "var(--color-primary)",
                  }}
                >
                  <div className="space-y-1">
                    <label
                      className="text-xs font-mono block"
                      style={{ color: "var(--color-text)" }}
                    >
                      name
                    </label>
                    <input
                      type="text"
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      placeholder="_"
                      className="w-full px-2 py-1 border font-mono text-sm focus:outline-none"
                      style={{
                        backgroundColor: "var(--color-primary)",
                        borderColor: "var(--color-accent)",
                        color: "var(--color-text)",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "var(--color-highlight)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "var(--color-accent)";
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") createCollection();
                        if (e.key === "Escape") setShowCreateForm(false);
                      }}
                      autoFocus
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={createCollection}
                      disabled={!newCollectionName.trim() || creating}
                      className="flex-1 px-3 py-1 font-mono text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: "var(--color-highlight)",
                        color: "var(--color-primary)",
                      }}
                    >
                      {creating ? "creating..." : "create"}
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewCollectionName("");
                      }}
                      className="px-3 py-1 border font-mono text-sm focus:outline-none"
                      style={{
                        borderColor: "var(--color-accent)",
                        backgroundColor: "var(--color-primary)",
                        color: "var(--color-text)",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "var(--color-highlight)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "var(--color-accent)";
                      }}
                    >
                      cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
