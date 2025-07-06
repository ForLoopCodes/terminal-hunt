"use client";

import { useState, useEffect, forwardRef } from "react";
import { useRouter } from "next/navigation";

interface EditAppButtonProps {
  appId: string;
  creatorId: string;
  userEmail: string;
}

export const EditAppButton = forwardRef<HTMLButtonElement, EditAppButtonProps>(
  function EditAppButton({ appId, creatorId, userEmail }, ref) {
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
        ref={ref}
        onClick={handleEdit}
        className="w-full px-3 py-1 text-sm font-medium focus:outline-none transition-colors"
        style={{
          backgroundColor: "var(--color-primary)",
          color: "var(--color-text)",
          border: "1px solid var(--color-accent)",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--color-highlight)";
          e.target.style.boxShadow = "0 0 0 1px var(--color-highlight)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--color-accent)";
          e.target.style.boxShadow = "none";
        }}
        title="Edit this app (E)"
      >
        <span className="underline">E</span>dit
      </button>
    );
  }
);
