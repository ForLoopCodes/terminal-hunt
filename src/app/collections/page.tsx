"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DragDropCollections } from "@/components/DragDropCollections";
import { DragDropApps } from "@/components/DragDropApps";
import { TermHuntLogo } from "@/components/TermHuntLogo";

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
  appShortDescription?: string;
  appWebsite?: string;
  appViewCount: number;
  appCreatedAt: string;
}

export default function MyCollectionsPage() {
  const { status } = useSession();
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
          className="font-mono text-sm"
          style={{ color: "var(--color-text)" }}
        >
          loading_collections...
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-20 pb-8 flex flex-col lg:flex-row font-mono"
      style={{ backgroundColor: "var(--color-primary)" }}
    >
      {/* Sidebar */}
      <div className="lg:fixed lg:left-0 lg:top-20 lg:h-[calc(100vh-5rem)] lg:z-40 lg:w-80 w-full lg:block">
        {/* Mobile toggle button */}
        <div
          className="lg:hidden border-b p-4"
          style={{ borderColor: "var(--color-accent)" }}
        >
          <button
            onClick={() => {
              const sidebar = document.getElementById(
                "collections-sidebar-content"
              );
              if (sidebar) {
                sidebar.style.display =
                  sidebar.style.display === "none" ? "block" : "none";
              }
            }}
            className="w-full text-left font-mono text-sm focus:outline-none focus:underline px-2 py-1"
            style={{ color: "var(--color-highlight)" }}
          >
            [±] COLLECTIONS
          </button>
        </div>

        <div
          id="collections-sidebar-content"
          className="lg:block hidden lg:border-none border-b"
          style={{ borderColor: "var(--color-accent)" }}
        >
          <div
            className="p-4 border-b hidden lg:block"
            style={{ borderColor: "var(--color-accent)" }}
          >
            <h2
              className="font-bold text-sm"
              style={{ color: "var(--color-highlight)" }}
            >
              COLLECTIONS
            </h2>
          </div>

          <div className="p-4 space-y-6 overflow-y-auto lg:h-full max-h-96 lg:max-h-none">
            {/* Create New Collection */}
            <div>
              <h3
                className="text-xs font-semibold mb-3 uppercase tracking-wider"
                style={{ color: "var(--color-accent)" }}
              >
                Actions
              </h3>
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full px-3 py-1 text-sm font-medium focus:outline-none"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-text)",
                  border: "1px solid var(--color-accent)",
                }}
              >
                + Create Collection
              </button>
            </div>

            {/* Create Form */}
            {showCreateForm && (
              <div>
                <h3
                  className="text-xs font-semibold mb-3 uppercase tracking-wider"
                  style={{ color: "var(--color-accent)" }}
                >
                  New Collection
                </h3>
                <div className="space-y-4">
                  <div>
                    <label
                      className="text-xs block mb-2"
                      style={{ color: "var(--color-text)" }}
                    >
                      Name
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
                      placeholder="Enter collection name"
                      className="w-full px-3 py-1 text-sm focus:outline-none"
                      style={{
                        backgroundColor: "var(--color-primary)",
                        color: "var(--color-text)",
                        border: "1px solid var(--color-accent)",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      className="text-xs block mb-2"
                      style={{ color: "var(--color-text)" }}
                    >
                      Description
                    </label>
                    <textarea
                      value={newCollection.description}
                      onChange={(e) =>
                        setNewCollection({
                          ...newCollection,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter description (optional)"
                      className="w-full px-3 py-1 text-sm focus:outline-none resize-vertical"
                      style={{
                        backgroundColor: "var(--color-primary)",
                        color: "var(--color-text)",
                        border: "1px solid var(--color-accent)",
                      }}
                      rows={3}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={createCollection}
                      disabled={!newCollection.name.trim()}
                      className="w-full px-3 py-1 text-sm font-medium focus:outline-none disabled:opacity-50"
                      style={{
                        backgroundColor: "var(--color-highlight)",
                        color: "var(--color-primary)",
                        border: "1px solid var(--color-highlight)",
                      }}
                    >
                      Create
                    </button>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="w-full px-3 py-1 text-sm font-medium focus:outline-none"
                      style={{
                        backgroundColor: "var(--color-primary)",
                        color: "var(--color-text)",
                        border: "1px solid var(--color-accent)",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Collections List */}
            <div>
              <h3
                className="text-xs font-semibold mb-3 uppercase tracking-wider"
                style={{ color: "var(--color-accent)" }}
              >
                My Collections ({collections.length})
              </h3>

              {collections.length > 0 ? (
                <div className="space-y-2">
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
                </div>
              ) : (
                <div className="text-center py-8">
                  <div
                    className="text-sm mb-4"
                    style={{ color: "var(--color-text)" }}
                  >
                    [ empty ]
                  </div>
                  <p
                    className="text-sm mb-4"
                    style={{ color: "var(--color-text)" }}
                  >
                    No collections yet
                  </p>
                  {!showCreateForm && (
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="px-3 py-1 text-sm font-medium focus:outline-none"
                      style={{
                        backgroundColor: "var(--color-highlight)",
                        color: "var(--color-primary)",
                        border: "1px solid var(--color-highlight)",
                      }}
                    >
                      Create your first collection
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-80 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-6 lg:mb-8">
            <pre
              className="text-[8px] md:text-sm whitespace-pre-wrap font-semibold mb-4 lg:mb-6 overflow-x-auto"
              style={{ color: "var(--color-accent)" }}
            >
              <TermHuntLogo size="md" />
            <div className="mt-4 mb-6">
              <h1
                className="text-sm font-bold tracking-wide"
                style={{ color: "var(--color-highlight)" }}
              >
                C O L L E C T I O N S
              </h1>
            </div>
            </pre>
          </div>

          {/* Content Area */}
          <div>
            {selectedCollection ? (
              <div>
                {/* Collection Header */}
                <div className="mb-6">
                  <h1
                    className="text-lg sm:text-xl font-medium mb-2"
                    style={{ color: "var(--color-text)" }}
                  >
                    {selectedCollection.name}
                  </h1>
                  {selectedCollection.description && (
                    <p
                      className="text-sm mb-3"
                      style={{ color: "var(--color-text)" }}
                    >
                      {selectedCollection.description}
                    </p>
                  )}
                  <div
                    className="text-xs"
                    style={{ color: "var(--color-accent)" }}
                  >
                    {selectedCollection.appCount} apps • created{" "}
                    {formatDate(selectedCollection.createdAt)}
                  </div>
                </div>

                {/* Apps in Collection */}
                {appsLoading ? (
                  <div className="flex items-center justify-center py-14">
                    <div
                      className="text-sm font-mono"
                      style={{ color: "var(--color-text)" }}
                    >
                      loading_apps...
                    </div>
                  </div>
                ) : collectionApps.length > 0 ? (
                  <div className="space-y-1">
                    <DragDropApps
                      apps={collectionApps}
                      onAppRemove={(appId) =>
                        removeAppFromCollection(selectedCollection.id, appId)
                      }
                      onAppReorder={reorderApps}
                      formatDate={formatDate}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-14">
                    <div
                      className="text-center"
                      style={{ color: "var(--color-text)" }}
                    >
                      <div className="text-sm font-mono mb-2">[ empty ]</div>
                      <div className="text-sm mb-4">
                        This collection is empty
                      </div>
                      <div className="text-xs">
                        Browse apps and click &quot;Add to Collection&quot; to add them
                        here
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-14">
                <div
                  className="text-center"
                  style={{ color: "var(--color-text)" }}
                >
                  <div className="text-sm font-mono mb-2">[ ? ]</div>
                  <div className="text-sm font-medium mb-2">
                    Choose Collection
                  </div>
                  <div className="text-sm">
                    Select a collection from the sidebar to view and manage apps
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
