"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { useKeyboardShortcuts } from "@/lib/keyboardShortcuts";

export function Navigation() {
  const { data: session, status } = useSession();
  const [focusedElement, setFocusedElement] = useState<string | null>(null);

  // Refs for programmatic focus
  const leaderboardRef = useRef<HTMLAnchorElement>(null);
  const aboutRef = useRef<HTMLAnchorElement>(null);
  const submitRef = useRef<HTMLAnchorElement>(null);
  const profileRef = useRef<HTMLAnchorElement>(null);
  const signInRef = useRef<HTMLAnchorElement>(null);
  const signUpRef = useRef<HTMLAnchorElement>(null);
  const adminRef = useRef<HTMLAnchorElement>(null);
  const cliRef = useRef<HTMLAnchorElement>(null);

  // Handle keyboard shortcuts using centralized system
  useKeyboardShortcuts(
    "navigation",
    [
      {
        key: "L",
        action: () => leaderboardRef.current?.click(),
        description: "Go to leaderboard (Shift+L)",
        requiresShift: true,
      },
      {
        key: "F",
        action: () => aboutRef.current?.click(),
        description: "Go to FAQ (Shift+F)",
        requiresShift: true,
      },
      {
        key: "S",
        action: () => {
          if (session) {
            submitRef.current?.click();
          } else {
            signUpRef.current?.click();
          }
        },
        description: "Submit app / Sign up (Shift+S)",
        requiresShift: true,
      },
      {
        key: "P",
        action: () => profileRef.current?.click(),
        description: "Go to profile (Shift+P)",
        requiresShift: true,
      },
      {
        key: "A",
        action: () => {
          if ((session?.user as any)?.isAdmin) {
            adminRef.current?.click();
          }
        },
        description: "Go to admin (Shift+A)",
        requiresShift: true,
      },
      {
        key: "I",
        action: () => signInRef.current?.click(),
        description: "Sign in (Shift+I)",
        requiresShift: true,
      },
      {
        key: "C",
        action: () => cliRef.current?.click(),
        description: "Go to CLI info (Shift+C)",
        requiresShift: true,
      },
    ],
    5, // Lower priority than page-specific shortcuts
    [session]
  );

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: "var(--color-primary)",
      }}
    >
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span
                className="px-2 py-1 text-sm font-medium"
                style={{ color: "var(--color-highlight)" }}
              >
                &gt;.&lt;
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-1">
            {/* CLI Link */}

            <div className="flex items-center">
              <span
                className="w-1 text-xs"
                style={{ color: "var(--color-text)" }}
              >
                {focusedElement === "shift" ? ">" : " "}
              </span>
              <span
                className="px-2 py-1 text-sm font-medium transition-colors focus:outline-none"
                style={{ color: "var(--color-text)" }}
              >
                use ⇧
              </span>
            </div>
            <div className="flex items-center">
              <span
                className="w-1 text-xs"
                style={{ color: "var(--color-text)" }}
              >
                {focusedElement === "cli" ? ">" : " "}
              </span>
              <a
                ref={cliRef}
                href="https://www.npmjs.com/package/termhunt-cli"
                target="_blank"
                rel="noopener noreferrer"
                onFocus={() => setFocusedElement("cli")}
                onBlur={() => setFocusedElement(null)}
                className="px-2 py-1 text-sm font-medium transition-colors focus:outline-none"
                style={{ color: "var(--color-text)" }}
              >
                <span className="underline">C</span>LI
              </a>
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
                <span className="underline">L</span>
                <span className="hidden sm:inline">eaderboard</span>
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
                <span className="underline">F</span>
                <span className="hidden sm:inline">AQ</span>
              </Link>
            </div>

            <div className="flex items-center">
              <span
                className="w-1 text-xs"
                style={{ color: "var(--color-text)" }}
              >
                {focusedElement === "theme" ? ">" : " "}
              </span>
              <ThemeSwitcher />
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
                    <span className="underline">S</span>
                    <span className="hidden sm:inline">ubmit</span>
                    <span className="hidden md:inline"> App</span>
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
                    <span className="sm:hidden">
                      @{session.user.userTag.slice(0, 4)}...
                    </span>
                    <span className="hidden sm:inline">
                      @{(session.user as any)?.userTag}
                    </span>{" "}
                    [p]
                  </Link>
                </div>

                {session.user.isAdmin && (
                  <div className="flex items-center">
                    <span
                      className="w-1 text-xs"
                      style={{ color: "var(--color-text)" }}
                    >
                      {focusedElement === "admin" ? ">" : " "}
                    </span>
                    <Link
                      ref={adminRef}
                      href="/admin/dashboard"
                      onFocus={() => setFocusedElement("admin")}
                      onBlur={() => setFocusedElement(null)}
                      className="px-2 py-1 text-sm font-medium transition-colors focus:outline-none"
                      style={{
                        color: "var(--color-highlight)",
                      }}
                    >
                      A<span className="hidden sm:inline">dmin</span>
                    </Link>
                  </div>
                )}
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
                    <span className="hidden sm:inline">Sign </span>
                    <span className="underline">I</span>
                    <span className="hidden sm:inline">n</span>
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
                    <span className="underline">S</span>
                    <span className="hidden sm:inline">ign Up</span>
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
