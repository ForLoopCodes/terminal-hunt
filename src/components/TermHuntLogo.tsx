"use client";

import { TERMHUNT_ASCII } from "@/lib/ascii-utils";

interface TermHuntLogoProps {
  animated?: boolean;
  showTitle?: boolean;
  size?: "sm" | "md" | "lg";
}

export function TermHuntLogo({
  animated = false,
  showTitle = true,
  size = "md",
}: TermHuntLogoProps) {
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className="font-mono">
      <pre
        className={`text-[6px] md:text-xs lg:text-sm leading-tight ${
          animated ? "animate-pulse" : ""
        }`}
        style={{ color: "var(--color-highlight)" }}
      >
        {TERMHUNT_ASCII}
      </pre>
      {showTitle && (
        <div
          className={`${sizeClasses[size]} text-center font-semibold tracking-widest mt-2`}
          style={{ color: "var(--color-text)" }}
        >
          T E R M I N A L H U N T
        </div>
      )}
    </div>
  );
}
