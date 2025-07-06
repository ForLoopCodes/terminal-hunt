"use client";

import { useState, useEffect } from "react";

interface DeleteAppButtonProps {
  appId: string;
  creatorId: string;
  userEmail: string;
  onDelete: () => void;
}

export function DeleteAppButton({
  appId,
  creatorId,
  userEmail,
  onDelete,
}: DeleteAppButtonProps) {
  const [isCreator, setIsCreator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    checkIfCreator();
  }, [userEmail, creatorId]);

  const checkIfCreator = async () => {
    try {
      // Get current user info to check if they are the creator
      const response = await fetch("/api/users/me");
      if (response.ok) {
        const userData = await response.json();
        setIsCreator(userData.id === creatorId);
      }
    } catch (error) {
      console.error("Error checking creator status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this app? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/apps/${appId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onDelete();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete app");
      }
    } catch (error) {
      console.error("Error deleting app:", error);
      alert("Failed to delete app");
    } finally {
      setDeleting(false);
    }
  };

  if (loading || !isCreator) {
    return null;
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="w-full px-3 py-1 text-sm font-medium focus:outline-none disabled:opacity-50"
      style={{
        backgroundColor: "var(--color-primary)",
        color: "var(--color-text)",
        border: "1px solid var(--color-accent)",
      }}
      title="Delete this app"
    >
      {deleting ? "Deleting..." : "Delete"}
    </button>
  );
}
