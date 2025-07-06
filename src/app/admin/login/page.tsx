"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedElement, setFocusedElement] = useState<string | null>(null);

  // Refs for programmatic focus
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const loginRef = useRef<HTMLButtonElement>(null);

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
        case "e":
          e.preventDefault();
          emailRef.current?.focus();
          break;
        case "p":
          e.preventDefault();
          passwordRef.current?.focus();
          break;
        case "l":
          e.preventDefault();
          loginRef.current?.click();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Redirect if user is already an admin
  useEffect(() => {
    if (session?.user?.isAdmin) {
      router.push("/admin/dashboard");
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/admin/dashboard");
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch (error) {
      console.error("Admin login error:", error);
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const termhuntText = `
 ___                                   ___                      ___      
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
                  
  A D M I N   L O G I N
  `;

  return (
    <div
      className="min-h-screen pt-20 pb-8"
      style={{ backgroundColor: "var(--color-primary)" }}
    >
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <pre
            className="text-[8px] md:text-sm whitespace-pre-wrap font-semibold mb-6"
            style={{ color: "var(--color-accent)" }}
          >
            {termhuntText}
          </pre>
        </div>

        {error && (
          <div
            className="p-4 mb-6"
            style={{
              backgroundColor: "var(--color-primary)",
            }}
          >
            <p style={{ color: "var(--color-highlight)" }}>! {error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
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
              <span className="underline">e</span>mail
            </label>
            <input
              ref={emailRef}
              type="email"
              id="email"
              value={credentials.email}
              onFocus={() => setFocusedElement("email")}
              onBlur={() => setFocusedElement(null)}
              onChange={(e) =>
                setCredentials((prev) => ({ ...prev, email: e.target.value }))
              }
              className="flex-1 px-2 py-1 focus:outline-none text-sm"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-text)",
              }}
              placeholder="_"
              required
            />
          </div>

          {/* Password */}
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
              <span className="underline">p</span>assword
            </label>
            <input
              ref={passwordRef}
              type="password"
              id="password"
              value={credentials.password}
              onFocus={() => setFocusedElement("password")}
              onBlur={() => setFocusedElement(null)}
              onChange={(e) =>
                setCredentials((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              className="flex-1 px-2 py-1 focus:outline-none text-sm"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-text)",
              }}
              placeholder="_"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-start">
            <span
              className="mr-2 w-4 text-xs"
              style={{ color: "var(--color-text)" }}
            >
              {focusedElement === "login" ? ">" : " "}
            </span>
            <button
              ref={loginRef}
              type="submit"
              onFocus={() => setFocusedElement("login")}
              onBlur={() => setFocusedElement(null)}
              disabled={loading}
              className="px-2 py-1 font-medium focus:outline-none transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--color-highlight)",
                color: "var(--color-primary)",
              }}
            >
              {loading ? (
                "logging_in..."
              ) : (
                <>
                  [<span className="underline">l</span>ogin]
                </>
              )}
            </button>
          </div>

          {/* Keyboard Shortcuts Help */}
          <div
            className="mt-8 p-3 text-xs"
            style={{
              backgroundColor: "var(--color-primary)",
              border: "1px solid var(--color-accent)",
              color: "var(--color-accent)",
            }}
          >
            <div className="font-mono mb-1">keyboard shortcuts:</div>
            <div className="grid grid-cols-1 gap-y-1 font-mono">
              <span>[e] email</span>
              <span>[p] password</span>
              <span>[l] login</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
