"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

export function Navigation() {
  const { data: session, status } = useSession();
  const [focusedElement, setFocusedElement] = useState<string | null>(null);

  // Refs for programmatic focus
  const homeRef = useRef<HTMLAnchorElement>(null);
  const leaderboardRef = useRef<HTMLAnchorElement>(null);
  const aboutRef = useRef<HTMLAnchorElement>(null);
  const submitRef = useRef<HTMLAnchorElement>(null);
  const profileRef = useRef<HTMLAnchorElement>(null);
  const signInRef = useRef<HTMLAnchorElement>(null);
  const signUpRef = useRef<HTMLAnchorElement>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore shortcuts when typing in inputs
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA")
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      switch (key) {
        case "h":
          e.preventDefault();
          homeRef.current?.click();
          break;
        case "l":
          e.preventDefault();
          leaderboardRef.current?.click();
          break;
        case "f":
          e.preventDefault();
          aboutRef.current?.click();
          break;
        case "s":
          e.preventDefault();
          if (session) {
            submitRef.current?.click();
          } else {
            signUpRef.current?.click();
          }
          break;
        case "p":
          e.preventDefault();
          profileRef.current?.click();
          break;
        case "i":
          e.preventDefault();
          signInRef.current?.click();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [session]);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: "var(--color-primary)",
      }}
    >
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span
                className="px-2 py-1 text-sm font-medium"
                style={{ color: "var(--color-text)" }}
              >
                &gt;.&lt;
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-1">
            <div className="flex items-center">
              <span
                className="w-1 text-xs"
                style={{ color: "var(--color-text)" }}
              >
                {focusedElement === "home" ? ">" : " "}
              </span>
              <Link
                ref={homeRef}
                href="/"
                onFocus={() => setFocusedElement("home")}
                onBlur={() => setFocusedElement(null)}
                className="px-2 py-1 text-sm font-medium transition-colors focus:outline-none"
                style={{ color: "var(--color-text)" }}
              >
                <span className="underline">H</span>ome
              </Link>
            </div>

            <div className="flex items-center">
              <span
                className="w-1 text-xs"
                style={{ color: "var(--color-text)" }}
              >
                {focusedElement === "leaderboard" ? ">" : " "}
              </span>
              <Link
                ref={leaderboardRef}
                href="/leaderboard"
                onFocus={() => setFocusedElement("leaderboard")}
                onBlur={() => setFocusedElement(null)}
                className="px-2 py-1 text-sm font-medium transition-colors focus:outline-none"
                style={{ color: "var(--color-text)" }}
              >
                <span className="underline">L</span>eaderboard
              </Link>
            </div>

            <div className="flex items-center">
              <span
                className="w-1 text-xs"
                style={{ color: "var(--color-text)" }}
              >
                {focusedElement === "about" ? ">" : " "}
              </span>
              <Link
                ref={aboutRef}
                href="/faq"
                onFocus={() => setFocusedElement("about")}
                onBlur={() => setFocusedElement(null)}
                className="px-2 py-1 text-sm font-medium transition-colors focus:outline-none"
                style={{ color: "var(--color-text)" }}
              >
                <span className="underline">F</span>AQ
              </Link>
            </div>

            {status === "loading" ? (
              <div
                className="w-6 h-6 animate-spin rounded-full border-2 border-t-transparent ml-4"
                style={{ borderColor: "var(--color-highlight)" }}
              ></div>
            ) : session ? (
              <>
                <div className="flex items-center">
                  <span
                    className="w-1 text-xs"
                    style={{ color: "var(--color-text)" }}
                  >
                    {focusedElement === "submit" ? ">" : " "}
                  </span>
                  <Link
                    ref={submitRef}
                    href="/submit"
                    onFocus={() => setFocusedElement("submit")}
                    onBlur={() => setFocusedElement(null)}
                    className="px-2 py-1 text-sm font-medium transition-colors focus:outline-none"
                    style={{
                      color: "var(--color-text)",
                    }}
                  >
                    <span className="underline">S</span>ubmit App
                  </Link>
                </div>

                <div className="flex items-center">
                  <span
                    className="w-1 text-xs"
                    style={{ color: "var(--color-text)" }}
                  >
                    {focusedElement === "profile" ? ">" : " "}
                  </span>
                  <Link
                    ref={profileRef}
                    href={`/profile/${session.user.userTag}`}
                    onFocus={() => setFocusedElement("profile")}
                    onBlur={() => setFocusedElement(null)}
                    className="px-2 py-1 text-sm font-medium transition-colors focus:outline-none"
                    style={{ color: "var(--color-text)" }}
                  >
                    @{session.user.userTag} [<span className="underline">p</span>]
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center">
                  <span
                    className="w-1 text-xs"
                    style={{ color: "var(--color-text)" }}
                  >
                    {focusedElement === "signin" ? ">" : " "}
                  </span>
                  <Link
                    ref={signInRef}
                    href="/auth/signin"
                    onFocus={() => setFocusedElement("signin")}
                    onBlur={() => setFocusedElement(null)}
                    className="px-2 py-1 text-sm font-medium transition-colors focus:outline-none"
                    style={{ color: "var(--color-text)" }}
                  >
                    Sign <span className="underline">I</span>n
                  </Link>
                </div>

                <div className="flex items-center">
                  <span
                    className="w-1 text-xs"
                    style={{ color: "var(--color-text)" }}
                  >
                    {focusedElement === "signup" ? ">" : " "}
                  </span>
                  <Link
                    ref={signUpRef}
                    href="/auth/signup"
                    onFocus={() => setFocusedElement("signup")}
                    onBlur={() => setFocusedElement(null)}
                    className="px-2 py-1 text-sm font-medium transition-colors focus:outline-none"
                    style={{
                      backgroundColor: "var(--color-highlight)",
                      color: "var(--color-background)",
                    }}
                  >
                    <span className="underline">S</span>ign Up
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}