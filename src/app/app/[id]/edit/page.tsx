"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { EditAppForm } from "@/components/EditAppForm";

interface AppDetail {
  id: string;
  name: string;
  shortDescription?: string;
  description: string;
  website?: string;
  documentationUrl?: string;
  asciiArt?: string;
  installCommands: string;
  repoUrl: string;
  creatorId: string;
}

export default function EditAppPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const appId = params.id as string;

  const [app, setApp] = useState<AppDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && appId) {
      fetchApp();
    }
  }, [status, appId, router]);

  const fetchApp = async () => {
    try {
      const response = await fetch(`/api/apps/${appId}`);
      const data = await response.json();

      if (response.ok) {
        // Check if user is the creator
        const userResponse = await fetch("/api/users/me");
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.id !== data.creatorId) {
            setError("You are not authorized to edit this app");
            return;
          }
        }

        setApp(data);
      } else {
        setError(data.error || "App not found");
      }
    } catch (error) {
      console.error("Error fetching app:", error);
      setError("Failed to load app");
    } finally {
      setLoading(false);
    }
  };

  const handleAppUpdate = () => {
    // Navigate back to the app page after successful update
    router.push(`/app/${appId}`);
  };

  if (status === "loading" || loading) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
          <div className="text-center" style={{ color: "var(--color-text)" }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
          <div className="text-center" style={{ color: "var(--color-error)" }}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
          <div className="text-center" style={{ color: "var(--color-text)" }}>
            App not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: "var(--color-text)" }}
          >
            Edit App
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push(`/app/${appId}`)}
              className="text-sm px-3 py-1 border focus:outline-none hover:underline"
              style={{
                color: "var(--color-text)",
                borderColor: "var(--color-accent)",
              }}
            >
              ← Back to App
            </button>
          </div>
        </div>

        <EditAppForm app={app} onSuccess={handleAppUpdate} />
      </div>
    </div>
  );
}
