"use client";

import { useState } from "react";
import Link from "next/link";

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

interface DragDropAppsProps {
  apps: App[];
  onAppRemove: (appId: string) => void;
  onAppReorder: (reorderedApps: App[]) => void;
  formatDate: (dateString: string) => string;
}

export function DragDropApps({
  apps,
  onAppRemove,
  onAppReorder,
  formatDate,
}: DragDropAppsProps) {
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

    const newApps = [...apps];
    const [draggedApp] = newApps.splice(draggedIndex, 1);
    newApps.splice(dropIndex, 0, draggedApp);

    onAppReorder(newApps);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-1 font-mono">
      {apps.map((app, index) => (
        <div
          key={app.collectionAppId}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`p-2 px-3 border transition-all cursor-grab ${
            draggedIndex === index ? "opacity-50" : ""
          }`}
          style={{
            borderColor:
              dragOverIndex === index && draggedIndex !== index
                ? "var(--color-success)"
                : "var(--color-accent)",
            borderWidth: "1px",
            backgroundColor:
              dragOverIndex === index && draggedIndex !== index
                ? "var(--color-bg-alt)"
                : "transparent",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <svg
                className="w-4 h-4 flex-shrink-0"
                style={{ color: "var(--color-accent)" }}
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

              <div className="flex-1 min-w-0">
                <Link
                  href={`/app/${app.appId}`}
                  className="text-sm font-medium focus:outline-none hover:underline block truncate"
                  style={{ color: "var(--color-text)" }}
                >
                  {app.appName}
                </Link>

                <p
                  className="text-xs mt-1 line-clamp-2"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {app.appDescription.substring(0, 150)}
                  {app.appDescription.length > 150 ? "..." : ""}
                </p>

                <div className="flex items-center space-x-3 text-xs mt-1">
                  <span style={{ color: "var(--color-accent)" }}>
                    {app.appViewCount} views
                  </span>
                  <span style={{ color: "var(--color-accent)" }}>
                    Added {formatDate(app.addedAt)}
                  </span>
                </div>

                {app.notes && (
                  <div
                    className="mt-2 p-2 border text-xs"
                    style={{
                      borderColor: "var(--color-accent)",
                      backgroundColor: "var(--color-bg-alt)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    <strong style={{ color: "var(--color-text)" }}>
                      Note:
                    </strong>{" "}
                    {app.notes}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onAppRemove(app.appId);
              }}
              className="p-1 ml-3 opacity-75 hover:opacity-100 transition-opacity"
              style={{ color: "var(--color-accent)" }}
              title="Remove from collection"
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
      ))}
    </div>
  );
}
