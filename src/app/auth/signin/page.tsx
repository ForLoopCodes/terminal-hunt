"use client";

import { useState, useEffect, useRef } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SecurityWarning } from "@/components/SecurityWarning";
import { TermHuntLogo } from "@/components/TermHuntLogo";

export default function SignInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedElement, setFocusedElement] = useState<string | null>(null);

  // Refs for programmatic focus
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const signupRef = useRef<HTMLAnchorElement>(null);
  const googleRef = useRef<HTMLButtonElement>(null);
  const githubRef = useRef<HTMLButtonElement>(null);
  const twitterRef = useRef<HTMLButtonElement>(null);

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
        case "g":
          e.preventDefault();
          googleRef.current?.click();
          break;
        case "h":
          e.preventDefault();
          githubRef.current?.click();
          break;
        case "t":
          e.preventDefault();
          twitterRef.current?.click();
          break;
        case "e":
          e.preventDefault();
          emailRef.current?.focus();
          break;
        case "w":
          e.preventDefault();
          passwordRef.current?.focus();
          break;
        case "i":
          e.preventDefault();
          submitRef.current?.click();
          break;
        case "n":
          e.preventDefault();
          signupRef.current?.click();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        // Wait for session to be established
        await getSession();
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Error signing in:", error);
      setError("An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (
    provider: "google" | "github" | "twitter"
  ) => {
    setLoading(true);
    setError("");
    try {
      const result = await signIn(provider, {
        callbackUrl: "/",
        redirect: true,
      });

      if (result?.error) {
        console.error(`OAuth sign-in error:`, result.error);
        setError(`Failed to sign in with ${provider}`);
        setLoading(false);
      }
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
      setError(`Failed to sign in with ${provider}`);
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center py-12 px-4 gap-10 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--color-primary)" }}
    >
      <SecurityWarning />
      <div className="text-center">
        <pre
          className="text-[8px] md:text-sm whitespace-pre-wrap font-semibold"
          style={{ color: "var(--color-accent)" }}
        >
          <TermHuntLogo size="md" />
          <div className="mt-4 mb-6">
            <h1
              className="text-sm font-bold tracking-wide"
              style={{ color: "var(--color-highlight)" }}
            >
              {"DISCOVER WILD TERMINAL APPS".toUpperCase().split("").join(" ")}
            </h1>
          </div>
        </pre>
      </div>
      <div className="max-w-[650px] w-full">
        <div className="space-y-4">
          {/* OAuth Providers */}
          <div>
            <div className="flex items-center">
              <span
                className="mr-2 w-4 text-xs"
                style={{ color: "var(--color-text)" }}
              >
                {focusedElement === "google" ? ">" : " "}
              </span>
              <button
                ref={googleRef}
                onFocus={() => setFocusedElement("google")}
                onBlur={() => setFocusedElement(null)}
                onClick={() => handleOAuthSignIn("google")}
                disabled={loading}
                className="justify-center py-2 text-sm font-medium focus:outline-none focus:ring-none disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-text)",
                }}
              >
                <span className="underline">G</span>oogle
              </button>
            </div>
            <div className="flex items-center">
              <span
                className="mr-2 w-4 text-xs"
                style={{ color: "var(--color-text)" }}
              >
                {focusedElement === "github" ? ">" : " "}
              </span>
              <button
                ref={githubRef}
                onFocus={() => setFocusedElement("github")}
                onBlur={() => setFocusedElement(null)}
                onClick={() => handleOAuthSignIn("github")}
                disabled={loading}
                className="justify-center py-2 text-sm font-medium focus:outline-none focus:ring-none disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-text)",
                }}
              >
                Git<span className="underline">H</span>ub
              </button>
            </div>
            <div className="flex items-center">
              <span
                className="mr-2 w-4 text-xs"
                style={{ color: "var(--color-text)" }}
              >
                {focusedElement === "twitter" ? ">" : " "}
              </span>
              <button
                ref={twitterRef}
                onFocus={() => setFocusedElement("twitter")}
                onBlur={() => setFocusedElement(null)}
                onClick={() => handleOAuthSignIn("twitter")}
                disabled={loading}
                className="justify-center py-2 text-sm font-medium focus:outline-none focus:ring-none disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-text)",
                }}
              >
                <span className="underline">T</span>witter
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="relative flex text-sm">
              <span
                className="px-6"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-accent)",
                }}
              >
                \\
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div
                className="border p-4"
                style={{
                  backgroundColor: "var(--color-secondary)",
                  borderColor: "var(--color-accent)",
                }}
              >
                <p
                  className="text-sm"
                  style={{ color: "var(--color-highlight)" }}
                >
                  {error}
                </p>
              </div>
            )}

            <div className="space-y-4 pt-2">
              <div className="flex items-center">
                <span
                  className="mr-2 w-4 text-xs"
                  style={{ color: "var(--color-text)" }}
                >
                  {focusedElement === "email" ? ">" : " "}
                </span>
                <label
                  htmlFor="email"
                  className="text-sm pr-2"
                  style={{
                    color: "var(--color-text)",
                    backgroundColor: "var(--color-primary)",
                  }}
                >
                  <span className="underline">E</span>mail
                </label>
                <input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onFocus={() => setFocusedElement("email")}
                  onBlur={() => setFocusedElement(null)}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="relative w-full px-2 focus:outline-none focus:ring-none focus:z-10 text-sm"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-text)",
                    borderColor:
                      focusedElement === "email"
                        ? "var(--color-highlight)"
                        : "var(--color-accent)",
                  }}
                  placeholder="_"
                />
              </div>
              <div className="flex items-center">
                <span
                  className="mr-2 w-4 text-xs"
                  style={{ color: "var(--color-text)" }}
                >
                  {focusedElement === "password" ? ">" : " "}
                </span>
                <label
                  htmlFor="password"
                  className="text-sm pr-2"
                  style={{
                    color: "var(--color-text)",
                    backgroundColor: "var(--color-primary)",
                  }}
                >
                  Pass<span className="underline">w</span>ord
                </label>
                <input
                  ref={passwordRef}
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onFocus={() => setFocusedElement("password")}
                  onBlur={() => setFocusedElement(null)}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="relative w-full px-2 focus:ring-none focus:outline-none focus:ring-none focus:z-10 text-sm"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-text)",
                    borderColor: "var(--color-accent)",
                  }}
                  placeholder="_"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span
                  className="mr-0 w-4 text-xs"
                  style={{ color: "var(--color-text)" }}
                >
                  {focusedElement === "submit" ? ">" : " "}
                </span>
                <button
                  ref={submitRef}
                  type="submit"
                  disabled={loading}
                  onFocus={() => setFocusedElement("submit")}
                  onBlur={() => setFocusedElement(null)}
                  className="group relative px-2 ml-1 flex py-1 border border-transparent text-sm font-medium focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "var(--color-highlight)",
                    color: "var(--color-primary)",
                  }}
                >
                  {loading ? (
                    "Signing in..."
                  ) : (
                    <>
                      Sign <span className="underline ml-1">i</span>n
                    </>
                  )}
                </button>
              </div>
              <div className="flex items-center">
                <span
                  className="w-4 text-xs"
                  style={{ color: "var(--color-text)" }}
                >
                  {focusedElement === "signup" ? ">" : " "}
                </span>
                <Link
                  ref={signupRef}
                  href="/auth/signup"
                  onFocus={() => setFocusedElement("signup")}
                  onBlur={() => setFocusedElement(null)}
                  className="font-medium text-sm focus:outline-none"
                  style={{ color: "var(--color-text)" }}
                >
                  <span className="underline">N</span>ew account
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
