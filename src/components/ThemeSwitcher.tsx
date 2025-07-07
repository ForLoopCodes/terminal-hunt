"use client";

import { useState, useEffect, useRef } from "react";

const themes = [
  {
    name: "Terminal Green",
    key: "green",
    colors: {
      primary: "#03050c",
      secondary: "#1c2541",
      accent: "#4b6688",
      highlight: "#5bc0be",
      text: "#6fffe9",
      textSecondary: "#4b6688",
    },
  },
  {
    name: "Cyberpunk",
    key: "cyberpunk",
    colors: {
      primary: "#0a0a0a",
      secondary: "#1a1a2e",
      accent: "#16213e",
      highlight: "#e94560",
      text: "#0f4c75",
      textSecondary: "#533483",
    },
  },
  {
    name: "Matrix",
    key: "matrix",
    colors: {
      primary: "#000000",
      secondary: "#001100",
      accent: "#003300",
      highlight: "#00ff00",
      text: "#00aa00",
      textSecondary: "#005500",
    },
  },
  {
    name: "Retro Amber",
    key: "amber",
    colors: {
      primary: "#1e1611",
      secondary: "#2d241b",
      accent: "#3d3025",
      highlight: "#ffb000",
      text: "#ffa500",
      textSecondary: "#cc8400",
    },
  },
  {
    name: "Hacker Blue",
    key: "hacker-blue",
    colors: {
      primary: "#0c0c0c",
      secondary: "#1a1a1a",
      accent: "#2a2a2a",
      highlight: "#00aaff",
      text: "#66ccff",
      textSecondary: "#4488cc",
    },
  },
  {
    name: "Neon Purple",
    key: "neon-purple",
    colors: {
      primary: "#0f0f0f",
      secondary: "#1a0d1a",
      accent: "#2a1a2a",
      highlight: "#cc00ff",
      text: "#bb99ff",
      textSecondary: "#8866cc",
    },
  },
  {
    name: "Blood Red",
    key: "blood-red",
    colors: {
      primary: "#0f0505",
      secondary: "#1a0a0a",
      accent: "#2a1515",
      highlight: "#ff3333",
      text: "#ff6666",
      textSecondary: "#cc4444",
    },
  },
  {
    name: "Ocean Deep",
    key: "ocean-deep",
    colors: {
      primary: "#051025",
      secondary: "#0a1a35",
      accent: "#152545",
      highlight: "#00ccff",
      text: "#66ddff",
      textSecondary: "#4499cc",
    },
  },
  {
    name: "Forest Dark",
    key: "forest-dark",
    colors: {
      primary: "#0a1a0a",
      secondary: "#152515",
      accent: "#203020",
      highlight: "#44ff44",
      text: "#88ff88",
      textSecondary: "#55cc55",
    },
  },
  {
    name: "Sunset Orange",
    key: "sunset-orange",
    colors: {
      primary: "#1a0f05",
      secondary: "#251a0a",
      accent: "#302515",
      highlight: "#ff6600",
      text: "#ff9944",
      textSecondary: "#cc7733",
    },
  },
  {
    name: "Midnight Blue",
    key: "midnight-blue",
    colors: {
      primary: "#050a15",
      secondary: "#0a1525",
      accent: "#152035",
      highlight: "#4488ff",
      text: "#77aaff",
      textSecondary: "#5588cc",
    },
  },
  {
    name: "Electric Lime",
    key: "electric-lime",
    colors: {
      primary: "#0a1005",
      secondary: "#151a0a",
      accent: "#20250f",
      highlight: "#ccff00",
      text: "#99ff33",
      textSecondary: "#77cc22",
    },
  },
  {
    name: "Hot Pink",
    key: "hot-pink",
    colors: {
      primary: "#150a15",
      secondary: "#250a25",
      accent: "#350f35",
      highlight: "#ff1493",
      text: "#ff69b4",
      textSecondary: "#cc4488",
    },
  },
  {
    name: "Vapor Wave",
    key: "vapor-wave",
    colors: {
      primary: "#0a0a15",
      secondary: "#15152a",
      accent: "#20203f",
      highlight: "#ff00ff",
      text: "#00ffff",
      textSecondary: "#8888ff",
    },
  },
  {
    name: "Terminal Classic",
    key: "terminal-classic",
    colors: {
      primary: "#000000",
      secondary: "#111111",
      accent: "#333333",
      highlight: "#ffffff",
      text: "#c0c0c0",
      textSecondary: "#808080",
    },
  },
  {
    name: "Blade Runner",
    key: "blade-runner",
    colors: {
      primary: "#0a0a0f",
      secondary: "#151520",
      accent: "#202030",
      highlight: "#ff6600",
      text: "#ffaa00",
      textSecondary: "#cc8800",
    },
  },
  {
    name: "Toxic Green",
    key: "toxic-green",
    colors: {
      primary: "#0f1505",
      secondary: "#1a250a",
      accent: "#25350f",
      highlight: "#88ff00",
      text: "#aaff44",
      textSecondary: "#77cc22",
    },
  },
  {
    name: "Ice Blue",
    key: "ice-blue",
    colors: {
      primary: "#051015",
      secondary: "#0a1a25",
      accent: "#0f2535",
      highlight: "#00ddff",
      text: "#88eeff",
      textSecondary: "#55aacc",
    },
  },
  {
    name: "Royal Purple",
    key: "royal-purple",
    colors: {
      primary: "#0f050f",
      secondary: "#1a0a1a",
      accent: "#250f25",
      highlight: "#9933ff",
      text: "#bb66ff",
      textSecondary: "#8844cc",
    },
  },
  {
    name: "Golden Hour",
    key: "golden-hour",
    colors: {
      primary: "#151005",
      secondary: "#251a0a",
      accent: "#35250f",
      highlight: "#ffcc00",
      text: "#ffdd44",
      textSecondary: "#ccaa22",
    },
  },
  {
    name: "Steel Gray",
    key: "steel-gray",
    colors: {
      primary: "#0f0f0f",
      secondary: "#1a1a1a",
      accent: "#2a2a2a",
      highlight: "#888888",
      text: "#cccccc",
      textSecondary: "#999999",
    },
  },
  {
    name: "Cherry Blossom",
    key: "cherry-blossom",
    colors: {
      primary: "#150a10",
      secondary: "#250f20",
      accent: "#351530",
      highlight: "#ff88cc",
      text: "#ffaadd",
      textSecondary: "#cc77aa",
    },
  },
];

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState("green");
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    right: 0,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const themeButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Apply theme immediately on mount to prevent flash
  useEffect(() => {
    // Apply theme synchronously on first load
    const savedTheme = localStorage.getItem("terminal-hunt-theme") || "green";
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  // Also apply theme on the document level to prevent any delays
  useEffect(() => {
    // This runs before React hydration to prevent theme flash
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("terminal-hunt-theme") || "green";
      applyTheme(savedTheme);
    }
  }, []);

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

      if (e.key.toLowerCase() === "t" && !e.ctrlKey && !e.metaKey && !isOpen) {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(themes.findIndex((t) => t.key === currentTheme));
      }

      if (isOpen) {
        switch (e.key) {
          case "Escape":
            e.preventDefault();
            setIsOpen(false);
            buttonRef.current?.focus();
            break;
          case "ArrowDown":
            e.preventDefault();
            setFocusedIndex((prev) => (prev + 1) % themes.length);
            break;
          case "ArrowUp":
            e.preventDefault();
            setFocusedIndex(
              (prev) => (prev - 1 + themes.length) % themes.length
            );
            break;
          case "Enter":
          case " ":
            e.preventDefault();
            switchTheme(themes[focusedIndex].key);
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, focusedIndex, currentTheme]);

  // Focus the selected theme button when focusedIndex changes
  useEffect(() => {
    if (isOpen && themeButtonRefs.current[focusedIndex]) {
      themeButtonRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const applyTheme = (themeKey: string) => {
    const theme = themes.find((t) => t.key === themeKey);
    if (!theme) return;

    const root = document.documentElement;
    root.style.setProperty("--color-primary", theme.colors.primary);
    root.style.setProperty("--color-secondary", theme.colors.secondary);
    root.style.setProperty("--color-accent", theme.colors.accent);
    root.style.setProperty("--color-highlight", theme.colors.highlight);
    root.style.setProperty("--color-text", theme.colors.text);
    root.style.setProperty(
      "--color-text-secondary",
      theme.colors.textSecondary
    );
  };

  const switchTheme = (themeKey: string) => {
    setCurrentTheme(themeKey);
    applyTheme(themeKey);
    localStorage.setItem("terminal-hunt-theme", themeKey);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
      // Set focus to current theme when opening
      setFocusedIndex(themes.findIndex((t) => t.key === currentTheme));
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="px-2 py-1 text-sm font-medium transition-colors focus:outline-none"
        style={{ color: "var(--color-text)" }}
        title="Switch Theme [T]"
      >
        <span className="underline">T</span>
        <span className="hidden sm:inline">heme</span>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed border border-solid min-w-52"
          style={{
            top: `${dropdownPosition.top}px`,
            right: `${dropdownPosition.right}px`,
            backgroundColor: "var(--color-primary)",
            borderColor: "var(--color-accent)",
            zIndex: 9999,
          }}
        >
          {themes.map((theme, index) => (
            <button
              key={theme.key}
              ref={(el) => {
                themeButtonRefs.current[index] = el;
              }}
              onClick={() => switchTheme(theme.key)}
              className="flex items-center gap-2 w-full px-2 py-1 text-sm text-left hover:bg-opacity-80 transition-colors focus:outline-none"
              style={{
                color:
                  currentTheme === theme.key
                    ? "var(--color-highlight)"
                    : "var(--color-text)",
                backgroundColor:
                  currentTheme === theme.key
                    ? "var(--color-secondary)"
                    : focusedIndex === index
                    ? "var(--color-accent)"
                    : "transparent",
              }}
            >
              {/* Color preview swatches */}
              <div className="flex gap-1">
                <div
                  className="w-3 h-3 border border-solid"
                  style={{
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.accent,
                  }}
                  title="Primary color"
                />
                <div
                  className="w-3 h-3 border border-solid"
                  style={{
                    backgroundColor: theme.colors.highlight,
                    borderColor: theme.colors.accent,
                  }}
                  title="Highlight color"
                />
                <div
                  className="w-3 h-3 border border-solid"
                  style={{
                    backgroundColor: theme.colors.text,
                    borderColor: theme.colors.accent,
                  }}
                  title="Text color"
                />
              </div>
              <span className="flex-1">{theme.name}</span>
              {currentTheme === theme.key && (
                <span
                  className="text-xs"
                  style={{ color: "var(--color-highlight)" }}
                >
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
