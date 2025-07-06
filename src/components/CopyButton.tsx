"use client";

import { useState } from "react";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-1 text-xs focus:outline-none transition-colors ${className}`}
      style={{
        color: copied ? "var(--color-highlight)" : "var(--color-accent)",
        backgroundColor: "transparent",
      }}
      title={copied ? "Copied!" : "Copy to clipboard"}
    >
      {copied ? "✓" : "📋"}
    </button>
  );
}
