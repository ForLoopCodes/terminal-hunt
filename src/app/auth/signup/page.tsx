"use client";

import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SecurityWarning } from "@/components/SecurityWarning";
import { TermHuntLogo } from "@/components/TermHuntLogo";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    userTag: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedElement, setFocusedElement] = useState<string | null>(null);

  // Refs for programmatic focus
  const userTagRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const signinRef = useRef<HTMLAnchorElement>(null);
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
        case "r":
          e.preventDefault();
          userTagRef.current?.focus();
          break;
        case "n":
          e.preventDefault();
          nameRef.current?.focus();
          break;
        case "e":
          e.preventDefault();
          emailRef.current?.focus();
          break;
        case "w":
          e.preventDefault();
          passwordRef.current?.focus();
          break;
        case "f":
          e.preventDefault();
          confirmPasswordRef.current?.focus();
          break;
        case "u":
          e.preventDefault();
          submitRef.current?.click();
          break;
        case "i":
          e.preventDefault();
          signinRef.current?.click();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Tag validation
    if (!formData.userTag.trim()) {
      newErrors.userTag = "Tag required";
    } else if (!/^[a-zA-Z0-9_]{3,30}$/.test(formData.userTag)) {
      newErrors.userTag = "3-30 chars, alphanumeric only";
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Min 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password required";
    } else {
      const password = formData.password;
      if (password.length < 8) {
        newErrors.password = "Min 8 characters";
      } else if (!/(?=.*[a-z])/.test(password)) {
        newErrors.password = "Need lowercase letter";
      } else if (!/(?=.*[A-Z])/.test(password)) {
        newErrors.password = "Need uppercase letter";
      } else if (!/(?=.*\d)/.test(password)) {
        newErrors.password = "Need number";
      }
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userTag: formData.userTag,
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Auto sign in after successful signup
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          setErrors({
            submit:
              "Account created but sign in failed. Please try signing in manually.",
          });
        } else {
          router.push("/");
          router.refresh();
        }
      } else {
        setErrors({ submit: data.error || "Failed to create account" });
      }
    } catch (error) {
      console.error("Error signing up:", error);
      setErrors({ submit: "An error occurred during signup" });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (
    provider: "google" | "github" | "twitter"
  ) => {
    setLoading(true);
    try {
      await signIn(provider, { callbackUrl: "/" });
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
      setErrors({ submit: `Failed to sign in with ${provider}` });
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
              {"JOIN THE HUNT".toUpperCase().split("").join(" ")}
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

          {/* Signup Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {errors.submit && (
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
                  {errors.submit}
                </p>
              </div>
            )}

            <div className="space-y-4 pt-2">
              <div className="flex items-center">
                <span
                  className="mr-2 w-4 text-xs"
                  style={{ color: "var(--color-text)" }}
                >
                  {focusedElement === "userTag" ? ">" : " "}
                </span>
                <label
                  htmlFor="userTag"
                  className="text-sm pr-2"
                  style={{
                    color: "var(--color-text)",
                    backgroundColor: "var(--color-primary)",
                  }}
                >
                  Tag/<span className="underline">@</span>
                </label>
                <input
                  ref={userTagRef}
                  id="userTag"
                  name="userTag"
                  type="text"
                  required
                  value={formData.userTag}
                  onFocus={() => setFocusedElement("userTag")}
                  onBlur={() => setFocusedElement(null)}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      userTag: e.target.value,
                    }))
                  }
                  className="relative w-full px-2 focus:outline-none focus:ring-none focus:z-10 text-sm"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-text)",
                    borderColor: "var(--color-accent)",
                  }}
                  placeholder="_"
                />
              </div>
              {errors.userTag && (
                <p
                  className="text-sm ml-6"
                  style={{ color: "var(--color-highlight)" }}
                >
                  {errors.userTag}
                </p>
              )}

              <div className="flex items-center">
                <span
                  className="mr-2 w-4 text-xs"
                  style={{ color: "var(--color-text)" }}
                >
                  {focusedElement === "name" ? ">" : " "}
                </span>
                <label
                  htmlFor="name"
                  className="text-sm pr-2"
                  style={{
                    color: "var(--color-text)",
                    backgroundColor: "var(--color-primary)",
                  }}
                >
                  <span className="underline">N</span>ame
                </label>
                <input
                  ref={nameRef}
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onFocus={() => setFocusedElement("name")}
                  onBlur={() => setFocusedElement(null)}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="relative w-full px-2 focus:outline-none focus:ring-none focus:z-10 text-sm"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-text)",
                    borderColor: "var(--color-accent)",
                  }}
                  placeholder="_"
                />
              </div>
              {errors.name && (
                <p
                  className="text-sm ml-6"
                  style={{ color: "var(--color-highlight)" }}
                >
                  {errors.name}
                </p>
              )}

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
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="relative w-full px-2 focus:outline-none focus:ring-none focus:z-10 text-sm"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-text)",
                    borderColor: "var(--color-accent)",
                  }}
                  placeholder="_"
                />
              </div>
              {errors.email && (
                <p
                  className="text-sm ml-6"
                  style={{ color: "var(--color-highlight)" }}
                >
                  {errors.email}
                </p>
              )}

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
                  autoComplete="new-password"
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
                  className="relative w-full px-2 focus:outline-none focus:ring-none focus:z-10 text-sm"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-text)",
                    borderColor: "var(--color-accent)",
                  }}
                  placeholder="_"
                />
              </div>
              {errors.password && (
                <p
                  className="text-sm ml-6"
                  style={{ color: "var(--color-highlight)" }}
                >
                  {errors.password}
                </p>
              )}

              <div className="flex items-center">
                <span
                  className="mr-2 w-4 text-xs"
                  style={{ color: "var(--color-text)" }}
                >
                  {focusedElement === "confirmPassword" ? ">" : " "}
                </span>
                <label
                  htmlFor="confirmPassword"
                  className="text-sm pr-2"
                  style={{
                    color: "var(--color-text)",
                    backgroundColor: "var(--color-primary)",
                  }}
                >
                  Con<span className="underline">f</span>irm
                </label>
                <input
                  ref={confirmPasswordRef}
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onFocus={() => setFocusedElement("confirmPassword")}
                  onBlur={() => setFocusedElement(null)}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="relative w-full px-2 focus:outline-none focus:ring-none focus:z-10 text-sm"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-text)",
                    borderColor: "var(--color-accent)",
                  }}
                  placeholder="_"
                />
              </div>
              {errors.confirmPassword && (
                <p
                  className="text-sm ml-6"
                  style={{ color: "var(--color-highlight)" }}
                >
                  {errors.confirmPassword}
                </p>
              )}
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
                    "Creating..."
                  ) : (
                    <>
                      Sign <span className="underline">u</span>p
                    </>
                  )}
                </button>
              </div>
              <div className="flex items-center">
                <span
                  className="w-4 text-xs"
                  style={{ color: "var(--color-text)" }}
                >
                  {focusedElement === "signin" ? ">" : " "}
                </span>
                <Link
                  ref={signinRef}
                  href="/auth/signin"
                  onFocus={() => setFocusedElement("signin")}
                  onBlur={() => setFocusedElement(null)}
                  className="font-medium text-sm focus:outline-none"
                  style={{ color: "var(--color-text)" }}
                >
                  Sign <span className="underline">i</span>n
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
