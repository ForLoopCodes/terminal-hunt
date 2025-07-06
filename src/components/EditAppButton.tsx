"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface EditAppButtonProps {
  appId: string;
  creatorId: string;
  userEmail: string;
}

export function EditAppButton({
  appId,
  creatorId,
  userEmail,
}: EditAppButtonProps) {
  const [isCreator, setIsCreator] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  const handleEdit = () => {
    router.push(`/app/${appId}/edit`);
  };

  if (loading || !isCreator) {
    return null;
  }

  return (
    <button
      onClick={handleEdit}
      className="w-full px-3 py-1 text-sm font-medium focus:outline-none"
      style={{
        backgroundColor: "var(--color-primary)",
        color: "var(--color-text)",
        border: "1px solid var(--color-accent)",
      }}
    >
      ✏ Edit App
    </button>
  );
}
