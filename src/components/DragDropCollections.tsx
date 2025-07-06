"use client";

import { useState } from "react";

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

interface DragDropCollectionsProps {
  collections: Collection[];
  selectedCollection: Collection | null;
  editingCollection: string | null;
  onCollectionSelect: (collection: Collection) => void;
  onCollectionEdit: (collectionId: string) => void;
  onCollectionDelete: (collectionId: string) => void;
  onCollectionUpdate: (
    collectionId: string,
    updates: Partial<Collection>
  ) => void;
  onCollectionReorder: (reorderedCollections: Collection[]) => void;
  setEditingCollection: (id: string | null) => void;
}

export function DragDropCollections({
  collections,
  selectedCollection,
  editingCollection,
  onCollectionSelect,
  onCollectionEdit,
  onCollectionDelete,
  onCollectionUpdate,
  onCollectionReorder,
  setEditingCollection,
}: DragDropCollectionsProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newCollections = [...collections];
    const [draggedCollection] = newCollections.splice(draggedIndex, 1);
    newCollections.splice(dropIndex, 0, draggedCollection);

    onCollectionReorder(newCollections);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-2">
      {collections.map((collection, index) => (
        <div key={collection.id}>
          {editingCollection === collection.id ? (
            <div
              className="p-3 border"
              style={{
                borderColor: "var(--color-accent)",
                backgroundColor: "var(--color-primary)",
              }}
            >
              <input
                type="text"
                defaultValue={collection.name}
                placeholder="Collection name"
                className="w-full px-3 py-2 mb-2 text-sm focus:outline-none"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-text)",
                  border: "1px solid var(--color-accent)",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const target = e.target as HTMLInputElement;
                    onCollectionUpdate(collection.id, { name: target.value });
                  }
                  if (e.key === "Escape") {
                    setEditingCollection(null);
                  }
                }}
                autoFocus
              />
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    const input = e.currentTarget.parentElement
                      ?.previousElementSibling as HTMLInputElement;
                    onCollectionUpdate(collection.id, { name: input.value });
                  }}
                  className="flex-1 px-3 py-1 text-sm focus:outline-none"
                  style={{
                    backgroundColor: "var(--color-highlight)",
                    color: "var(--color-primary)",
                    border: "1px solid var(--color-highlight)",
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingCollection(null)}
                  className="px-3 py-1 text-sm focus:outline-none"
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
          ) : (
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`p-3 border cursor-pointer transition-all ${
                selectedCollection?.id === collection.id ? "" : ""
              } ${draggedIndex === index ? "opacity-50" : ""} ${
                dragOverIndex === index && draggedIndex !== index ? "" : ""
              }`}
              style={{
                borderColor:
                  selectedCollection?.id === collection.id
                    ? "var(--color-highlight)"
                    : "var(--color-accent)",
                backgroundColor:
                  selectedCollection?.id === collection.id
                    ? "var(--color-highlight)"
                    : "var(--color-primary)",
                color:
                  selectedCollection?.id === collection.id
                    ? "var(--color-primary)"
                    : "var(--color-text)",
              }}
              onClick={() => onCollectionSelect(collection)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 cursor-grab opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8h16M4 16h16"
                      />
                    </svg>
                    <div>
                      <div className="text-sm font-medium">
                        {collection.name}
                      </div>
                      <div className="text-xs opacity-75">
                        {collection.appCount} apps
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCollectionEdit(collection.id);
                    }}
                    className="p-1 opacity-75 hover:opacity-100"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCollectionDelete(collection.id);
                    }}
                    className="p-1 opacity-75 hover:opacity-100"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
