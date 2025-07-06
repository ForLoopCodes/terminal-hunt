"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportableType: "app" | "comment" | "user";
  reportableId: string;
  reportableName: string;
}

export function ReportModal({
  isOpen,
  onClose,
  reportableType,
  reportableId,
  reportableName,
}: ReportModalProps) {
  const { data: session } = useSession();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [focusedElement, setFocusedElement] = useState<string | null>(null);

  // Refs for keyboard navigation
  const reasonRef = useRef<HTMLSelectElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input field
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      switch (key) {
        case "r":
          e.preventDefault();
          reasonRef.current?.focus();
          break;
        case "d":
          e.preventDefault();
          descriptionRef.current?.focus();
          break;
        case "s":
          e.preventDefault();
          if (!submitting && reason) {
            submitButtonRef.current?.click();
          }
          break;
        case "c":
        case "escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, submitting, reason, onClose]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setReason("");
      setDescription("");
      setSubmitted(false);
      // Auto-focus the reason dropdown when modal opens
      setTimeout(() => reasonRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !reason || submitting) return;

    setSubmitting(true);
    try {
      // Create the payload with the correct field names
      const payload: any = {
        reason,
        description: description.trim() || null,
      };

      // Set the appropriate ID field based on reportable type
      if (reportableType === "app") {
        payload.appId = reportableId;
      } else if (reportableType === "comment") {
        payload.commentId = reportableId;
      } else if (reportableType === "user") {
        payload.userId = reportableId;
      }

      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        const errorData = await response.json();
        console.error("Report submission error:", errorData.error);
      }
    } catch (error) {
      console.error("Error submitting report:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md p-6 border"
        style={{
          backgroundColor: "var(--color-primary)",
          borderColor: "var(--color-accent)",
        }}
      >
        {submitted ? (
          <div className="text-center">
            <h2
              className="text-lg font-bold mb-4"
              style={{ color: "var(--color-text)" }}
            >
              Report Submitted
            </h2>
            <p
              className="text-sm mb-4"
              style={{ color: "var(--color-accent)" }}
            >
              Thank you for your report. We&apos;ll review it as soon as possible.
            </p>
            <div
              className="w-6 h-6 mx-auto animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: "var(--color-highlight)" }}
            />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-lg font-bold"
                style={{ color: "var(--color-text)" }}
              >
                Report {reportableType}
              </h2>
              <button
                onClick={onClose}
                className="text-xl focus:outline-none"
                style={{ color: "var(--color-accent)" }}
                title="Close (C or Escape)"
              >
                ×
              </button>
            </div>

            <p
              className="text-sm mb-4"
              style={{ color: "var(--color-accent)" }}
            >
              Reporting: <strong>{reportableName}</strong>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--color-text)" }}
                >
                  <span className="underline">R</span>eason *
                </label>
                <select
                  ref={reasonRef}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="w-full p-2 text-sm focus:outline-none"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-text)",
                    border: "1px solid var(--color-accent)",
                  }}
                  onFocus={(e) => {
                    setFocusedElement("reason");
                    e.target.style.borderColor = "var(--color-highlight)";
                    e.target.style.boxShadow =
                      "0 0 0 1px var(--color-highlight)";
                  }}
                  onBlur={(e) => {
                    setFocusedElement(null);
                    e.target.style.borderColor = "var(--color-accent)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option value="">Select a reason</option>
                  <option value="spam">Spam</option>
                  <option value="harassment">Harassment</option>
                  <option value="inappropriate_content">
                    Inappropriate Content
                  </option>
                  <option value="copyright_violation">
                    Copyright Violation
                  </option>
                  <option value="malicious_content">Malicious Content</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--color-text)" }}
                >
                  <span className="underline">D</span>escription (optional)
                </label>
                <textarea
                  ref={descriptionRef}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide additional details about this report..."
                  rows={3}
                  className="w-full p-2 text-sm focus:outline-none resize-none"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-text)",
                    border: "1px solid var(--color-accent)",
                  }}
                  onFocus={(e) => {
                    setFocusedElement("description");
                    e.target.style.borderColor = "var(--color-highlight)";
                    e.target.style.boxShadow =
                      "0 0 0 1px var(--color-highlight)";
                  }}
                  onBlur={(e) => {
                    setFocusedElement(null);
                    e.target.style.borderColor = "var(--color-accent)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  ref={submitButtonRef}
                  type="submit"
                  disabled={submitting || !reason}
                  className="flex-1 px-4 py-2 text-sm font-medium focus:outline-none disabled:opacity-50 transition-colors"
                  style={{
                    backgroundColor: "var(--color-highlight)",
                    color: "var(--color-primary)",
                    border: "1px solid var(--color-highlight)",
                  }}
                  onFocus={(e) => {
                    e.target.style.boxShadow =
                      "0 0 0 2px var(--color-highlight)";
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = "none";
                  }}
                  title="Submit Report (S)"
                >
                  {submitting ? "Submitting..." : "Submit Report"}
                </button>
                <button
                  ref={cancelButtonRef}
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium focus:outline-none transition-colors"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-text)",
                    border: "1px solid var(--color-accent)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--color-highlight)";
                    e.target.style.boxShadow =
                      "0 0 0 1px var(--color-highlight)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--color-accent)";
                    e.target.style.boxShadow = "none";
                  }}
                  title="Cancel (C or Escape)"
                >
                  Cancel
                </button>
              </div>
            </form>

            {/* Keyboard shortcuts help */}
            <div
              className="mt-4 pt-4 border-t text-xs"
              style={{
                borderColor: "var(--color-accent)",
                color: "var(--color-accent)",
              }}
            >
              <div className="grid grid-cols-2 gap-1">
                <span>R: Focus reason</span>
                <span>D: Focus description</span>
                <span>S: Submit report</span>
                <span>C/Esc: Cancel</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
