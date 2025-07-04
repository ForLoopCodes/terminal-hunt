"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DragDropCollections } from "@/components/DragDropCollections";
import { DragDropApps } from "@/components/DragDropApps";

interface Collection {
  id: string;
  name: string;
  description?: string;
  color: string;
  appCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface App {
  collectionAppId: string;
  sortOrder: number;
  addedAt: string;
  notes?: string;
  appId: string;
  appName: string;
  appDescription: string;
  appViewCount: number;
  appCreatedAt: string;
}

export default function MyCollectionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [collectionApps, setCollectionApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState<string | null>(
    null
  );
  const [newCollection, setNewCollection] = useState({
    name: "",
    description: "",
    color: "#3b82f6",
    isPublic: false,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchCollections();
    }
  }, [status, router]);

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

  const fetchCollectionApps = async (collectionId: string) => {
    setAppsLoading(true);
    try {
      const response = await fetch(`/api/collections/${collectionId}`);
      const data = await response.json();
      setCollectionApps(data.apps || []);
    } catch (error) {
      console.error("Error fetching collection apps:", error);
    } finally {
      setAppsLoading(false);
    }
  };

  const createCollection = async () => {
    if (!newCollection.name.trim()) return;

    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCollection),
      });

      if (response.ok) {
        const created = await response.json();
        setCollections([...collections, created]);
        setNewCollection({
          name: "",
          description: "",
          color: "#3b82f6",
          isPublic: false,
        });
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error("Error creating collection:", error);
    }
  };

  const updateCollection = async (
    collectionId: string,
    updates: Partial<Collection>
  ) => {
    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updated = await response.json();
        setCollections(
          collections.map((c) => (c.id === collectionId ? updated : c))
        );
        setEditingCollection(null);
        if (selectedCollection?.id === collectionId) {
          setSelectedCollection(updated);
        }
      }
    } catch (error) {
      console.error("Error updating collection:", error);
    }
  };

  const deleteCollection = async (collectionId: string) => {
    if (!confirm("Are you sure you want to delete this collection?")) return;

    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCollections(collections.filter((c) => c.id !== collectionId));
        if (selectedCollection?.id === collectionId) {
          setSelectedCollection(null);
          setCollectionApps([]);
        }
      }
    } catch (error) {
      console.error("Error deleting collection:", error);
    }
  };

  const removeAppFromCollection = async (
    collectionId: string,
    appId: string
  ) => {
    try {
      const response = await fetch(
        `/api/collections/${collectionId}/apps?appId=${appId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setCollectionApps(collectionApps.filter((app) => app.appId !== appId));
        setCollections(
          collections.map((c) =>
            c.id === collectionId ? { ...c, appCount: c.appCount - 1 } : c
          )
        );
      }
    } catch (error) {
      console.error("Error removing app from collection:", error);
    }
  };

  const reorderCollections = async (reorderedCollections: Collection[]) => {
    setCollections(reorderedCollections);

    try {
      const collectionIds = reorderedCollections.map((c) => c.id);
      await fetch("/api/collections/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionIds }),
      });
    } catch (error) {
      console.error("Error reordering collections:", error);
      // Revert on error
      fetchCollections();
    }
  };

  const reorderApps = async (reorderedApps: App[]) => {
    setCollectionApps(reorderedApps);

    if (!selectedCollection) return;

    try {
      const appIds = reorderedApps.map((app) => app.appId);
      await fetch(`/api/collections/${selectedCollection.id}/apps/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appIds }),
      });
    } catch (error) {
      console.error("Error reordering apps:", error);
      // Revert on error
      if (selectedCollection) {
        fetchCollectionApps(selectedCollection.id);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (status === "loading" || loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <div
          className="font-mono text-lg"
          style={{ color: "var(--color-text)" }}
        >
          loading_collections...
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-20 pb-8"
      style={{ backgroundColor: "var(--color-primary)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <pre
            className="text-xs md:text-sm whitespace-pre-wrap font-semibold mb-6"
            style={{ color: "var(--color-accent)" }}
          >
            {`
  ___           _ _           _   _                 
 / __\\___  _ __| | |___  ___| |_(_) ___  _ __  ___ 
/ /  / _ \\| '__| | / _ \\/ _ \\ __| |/ _ \\| '_ \\/ __|
/ /__| (_) | |  | | (_) |  __/ |_| | (_) | | | \\__ \\
\\____/\\___/|_|  |_|\\___/ \\___|\\__|_|\\___/|_| |_|___/
                                                  
  COLLECTION MANAGER
  `}
          </pre>
        </div>

        <div className="flex gap-6 max-w-[1000px] mx-auto">
          {/* Collections Sidebar */}
          <div className="w-1/3">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1
                  className="text-lg font-mono font-semibold"
                  style={{ color: "var(--color-text)" }}
                >
                  {"> collections"}
                </h1>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="font-mono text-sm focus:outline-none"
                  style={{ color: "var(--color-text)" }}
                >
                  [+new]
                </button>
              </div>

              {/* Create Form */}
              {showCreateForm && (
                <div
                  className="mb-6 pb-4 border-b"
                  style={{ borderColor: "var(--color-accent)" }}
                >
                  <div className="space-y-3">
                    <div>
                      <label
                        className="text-xs font-mono block mb-1"
                        style={{ color: "var(--color-text)" }}
                      >
                        name
                      </label>
                      <input
                        type="text"
                        value={newCollection.name}
                        onChange={(e) =>
                          setNewCollection({
                            ...newCollection,
                            name: e.target.value,
                          })
                        }
                        placeholder="_"
                        className="w-full px-2 py-1 text-sm font-mono focus:outline-none"
                        style={{
                          backgroundColor: "var(--color-primary)",
                          color: "var(--color-text)",
                          borderBottom: "1px solid var(--color-accent)",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="text-xs font-mono block mb-1"
                        style={{ color: "var(--color-text)" }}
                      >
                        description
                      </label>
                      <textarea
                        value={newCollection.description}
                        onChange={(e) =>
                          setNewCollection({
                            ...newCollection,
                            description: e.target.value,
                          })
                        }
                        placeholder="_"
                        className="w-full px-2 py-1 text-sm font-mono focus:outline-none resize-vertical"
                        style={{
                          backgroundColor: "var(--color-primary)",
                          color: "var(--color-text)",
                          border: "1px solid var(--color-accent)",
                        }}
                        rows={2}
                      />
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={createCollection}
                        disabled={!newCollection.name.trim()}
                        className="px-2 py-1 font-mono text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: "var(--color-highlight)",
                          color: "var(--color-primary)",
                        }}
                      >
                        create
                      </button>
                      <button
                        onClick={() => setShowCreateForm(false)}
                        className="font-mono text-sm focus:outline-none"
                        style={{ color: "var(--color-text)" }}
                      >
                        cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Collections List */}
              {collections.length > 0 ? (
                <DragDropCollections
                  collections={collections}
                  selectedCollection={selectedCollection}
                  editingCollection={editingCollection}
                  onCollectionSelect={(collection) => {
                    setSelectedCollection(collection);
                    fetchCollectionApps(collection.id);
                  }}
                  onCollectionEdit={setEditingCollection}
                  onCollectionDelete={deleteCollection}
                  onCollectionUpdate={updateCollection}
                  onCollectionReorder={reorderCollections}
                  setEditingCollection={setEditingCollection}
                />
              ) : !showCreateForm ? (
                <div className="text-center py-8">
                  <div
                    className="text-sm font-mono mb-4"
                    style={{ color: "var(--color-text)" }}
                  >
                    [ ] empty
                  </div>
                  <p
                    className="font-mono mb-4 text-sm"
                    style={{ color: "var(--color-text)" }}
                  >
                    no collections yet
                  </p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-3 py-1 font-mono text-sm focus:outline-none"
                    style={{
                      backgroundColor: "var(--color-highlight)",
                      color: "var(--color-primary)",
                    }}
                  >
                    create_first_collection
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {/* Collection Content */}
          <div className="flex-1">
            {selectedCollection ? (
              <div
                className="border p-6"
                style={{
                  backgroundColor: "var(--color-primary)",
                  borderColor: "var(--color-accent)",
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2
                      className="text-lg font-mono font-semibold"
                      style={{ color: "var(--color-text)" }}
                    >
                      {"> " + selectedCollection.name}
                    </h2>
                    {selectedCollection.description && (
                      <p
                        className="mt-1 text-sm font-mono"
                        style={{ color: "var(--color-text)" }}
                      >
                        {selectedCollection.description}
                      </p>
                    )}
                    <p
                      className="text-xs font-mono mt-2"
                      style={{ color: "var(--color-text)" }}
                    >
                      {selectedCollection.appCount} apps • created{" "}
                      {formatDate(selectedCollection.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Apps in Collection */}
                {appsLoading ? (
                  <div className="flex justify-center py-12">
                    <div
                      className="font-mono text-sm"
                      style={{ color: "var(--color-text)" }}
                    >
                      loading_apps...
                    </div>
                  </div>
                ) : collectionApps.length > 0 ? (
                  <DragDropApps
                    apps={collectionApps}
                    onAppRemove={(appId) =>
                      removeAppFromCollection(selectedCollection.id, appId)
                    }
                    onAppReorder={reorderApps}
                    formatDate={formatDate}
                  />
                ) : (
                  <div className="text-center py-12">
                    <div
                      className="text-sm font-mono mb-4"
                      style={{ color: "var(--color-text)" }}
                    >
                      [ ] empty_collection
                    </div>
                    <p
                      className="font-mono mb-4 text-sm"
                      style={{ color: "var(--color-text)" }}
                    >
                      this collection is empty
                    </p>
                    <p
                      className="text-xs font-mono"
                      style={{ color: "var(--color-text)" }}
                    >
                      browse apps and click +collection to add them here
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div
                className="border p-6"
                style={{
                  backgroundColor: "var(--color-primary)",
                  borderColor: "var(--color-accent)",
                }}
              >
                <div className="text-center py-12">
                  <div
                    className="text-sm font-mono mb-4"
                    style={{ color: "var(--color-text)" }}
                  >
                    [ ? ] select_collection
                  </div>
                  <h3
                    className="text-lg font-mono font-semibold mb-2"
                    style={{ color: "var(--color-text)" }}
                  >
                    choose collection
                  </h3>
                  <p
                    className="font-mono text-sm"
                    style={{ color: "var(--color-text)" }}
                  >
                    select a collection from sidebar to view and manage apps
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
