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
    <div className="space-y-4">
      {apps.map((app, index) => (
        <div
          key={app.collectionAppId}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`border border-gray-700 rounded-lg p-4 transition-all cursor-grab ${
            draggedIndex === index ? "opacity-50" : ""
          } ${
            dragOverIndex === index && draggedIndex !== index
              ? "border-green-500 bg-green-900/20"
              : ""
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <svg
                  className="w-4 h-4 text-gray-500 mr-2"
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
                <Link
                  href={`/app/${app.appId}`}
                  className="text-lg font-medium text-blue-400 hover:text-blue-300 hover:underline"
                >
                  {app.appName}
                </Link>
              </div>
              <p className="text-gray-300 mt-1 ml-6">
                {app.appDescription.substring(0, 200)}
                {app.appDescription.length > 200 ? "..." : ""}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2 ml-6">
                <span>{app.appViewCount} views</span>
                <span>Added {formatDate(app.addedAt)}</span>
              </div>
              {app.notes && (
                <div className="mt-2 ml-6 p-2 bg-gray-900 rounded text-sm text-gray-300">
                  <strong>Note:</strong> {app.notes}
                </div>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAppRemove(app.appId);
              }}
              className="text-gray-400 hover:text-red-400 p-2 ml-4"
              title="Remove from collection"
            >
              <svg
                className="w-5 h-5"
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
