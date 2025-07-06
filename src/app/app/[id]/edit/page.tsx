"use client";

import { useState, useEffect, useRef } from "react";
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
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const appId = params.id as string;

  const [app, setApp] = useState<AppDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [focusedElement, setFocusedElement] = useState<string | null>(null);

  // Ref for back button
  const backRef = useRef<HTMLButtonElement>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore shortcuts when typing in inputs
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.tagName === "SELECT")
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      switch (key) {
        case "b":
          e.preventDefault();
          router.push(`/app/${appId}`);
          backRef.current?.focus();
          break;
        case "escape":
          e.preventDefault();
          setFocusedElement(null);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [router, appId]);

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
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <div
          className="font-mono text-sm"
          style={{ color: "var(--color-text)" }}
        >
          loading_app...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <p
              className="text-sm font-mono"
              style={{ color: "var(--color-highlight)" }}
            >
              ! {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <p
              className="text-sm font-mono"
              style={{ color: "var(--color-text)" }}
            >
              App not found
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-20 pb-8"
      style={{ backgroundColor: "var(--color-primary)" }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <pre
            className="text-[8px] md:text-sm whitespace-pre-wrap font-semibold mb-6"
            style={{ color: "var(--color-accent)" }}
          >
            {` ___                                   ___                      ___      
(   )                                 (   )                    (   )     
 | |_     .--.  ___ .-.  ___ .-. .-.   | | .-. ___  ___ ___ .-. | |_     
(   __)  /    \\(   )   \\(   )   '   \\  | |/   (   )(   |   )   (   __)   
 | |    |  .-. ;| ' .-. ;|  .-.  .-. ; |  .-. .| |  | | |  .-. .| |      
 | | ___|  | | ||  / (___) |  | |  | | | |  | || |  | | | |  | || | ___  
 | |(   )  |/  || |      | |  | |  | | | |  | || |  | | | |  | || |(   ) 
 | | | ||  ' _.'| |      | |  | |  | | | |  | || |  | | | |  | || | | |  
 | ' | ||  .'.-.| |      | |  | |  | | | |  | || |  ; ' | |  | || ' | |  
 ' \`-' ;'  \`-' /| |      | |  | |  | | | |  | |' \`-'  / | |  | |' \`-' ;  
  \`.__.  \`.__.'(___)    (___)(___)(___|___)(___)'.__.' (___)(___)\`.__.   
                  
  E D I T   Y O U R   A P P`}
          </pre>
        </div>

        <div className="space-y-6 max-w-[650px] mx-auto">
          {/* Back to App Button */}
          <div className="flex items-center">
            <span
              className="mr-2 w-4 text-xs"
              style={{ color: "var(--color-text)" }}
            >
              {focusedElement === "back" ? ">" : " "}
            </span>
            <button
              ref={backRef}
              onFocus={() => setFocusedElement("back")}
              onBlur={() => setFocusedElement(null)}
              onClick={() => router.push(`/app/${appId}`)}
              className="px-0 py-0 text-sm font-medium focus:outline-none font-mono"
              style={{
                color: "var(--color-text)",
                backgroundColor: "var(--color-primary)",
                borderBottom:
                  focusedElement === "back"
                    ? "2px solid var(--color-highlight)"
                    : "2px solid transparent",
              }}
            >
              <span className="underline">b</span>ack to app
            </button>
          </div>

          <EditAppForm app={app} onSuccess={handleAppUpdate} />

          {/* Keyboard Shortcuts Help */}
          <div
            className="mt-8 ml-6 p-3 text-xs"
            style={{
              backgroundColor: "var(--color-primary)",
              border: "1px solid var(--color-accent)",
              color: "var(--color-accent)",
            }}
          >
            <div className="font-mono mb-1">keyboard shortcuts:</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono">
              <span>[b] back to app</span>
              <span>[n] name</span>
              <span>[s] short desc</span>
              <span>[w] website</span>
              <span>[o] docs</span>
              <span>[a] ascii art</span>
              <span>[d] description</span>
              <span>[i] install</span>
              <span>[r] repo</span>
              <span>[u] update</span>
              <span>[p] preview ascii</span>
              <span>[esc] clear focus</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
