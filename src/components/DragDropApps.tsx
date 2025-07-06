"use client";

import { useState } from "react";
import Link from "next/link";
import { AppListItem } from "@/components/AppListItem";

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
  asciiArt?: string;
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
          className={`transition-all cursor-grab relative ${
            draggedIndex === index ? "opacity-50" : ""
          }`}
          style={{
            backgroundColor:
              dragOverIndex === index && draggedIndex !== index
                ? "var(--color-bg-alt)"
                : "transparent",
          }}
        >
          {/* Drag indicator */}
          <div
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10"
            style={{ color: "var(--color-accent)" }}
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
                d="M4 8h16M4 16h16"
              />
            </svg>
          </div>

          {/* Remove button */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAppRemove(app.appId);
              }}
              className="p-1 opacity-75 hover:opacity-100 transition-opacity"
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

          {/* App item with padding for drag/remove buttons */}
          <div className="pl-8 pr-8">
            <AppListItem
              app={{
                id: app.appId,
                name: app.appName,
                shortDescription: app.appShortDescription,
                website: app.appWebsite,
                viewCount: app.appViewCount,
                asciiArt: app.asciiArt,
              }}
              showStats={false}
              className="border-0"
            />
          </div>

          {/* Notes */}
          {app.notes && (
            <div
              className="mx-3 mb-2 p-2 border text-xs"
              style={{
                borderColor: "var(--color-accent)",
                backgroundColor: "var(--color-bg-alt)",
                color: "var(--color-text-secondary)",
              }}
            >
              <strong style={{ color: "var(--color-text)" }}>Note:</strong>{" "}
              {app.notes}
            </div>
          )}

          {/* Added date */}
          <div
            className="px-3 pb-2 text-xs"
            style={{ color: "var(--color-accent)" }}
          >
            Added {formatDate(app.addedAt)}
          </div>
        </div>
      ))}
    </div>
  );
}
