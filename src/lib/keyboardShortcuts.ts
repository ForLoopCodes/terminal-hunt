"use client";

import { useEffect, useRef, MutableRefObject } from "react";

export interface ShortcutAction {
  key: string;
  action: () => void;
  description: string;
  requiresCtrl?: boolean;
  requiresMeta?: boolean;
  requiresShift?: boolean;
  requiresAlt?: boolean;
  priority?: number; // Higher priority shortcuts override lower ones
  disabled?: boolean; // Allow temporarily disabling shortcuts
}

export interface ShortcutContext {
  name: string;
  shortcuts: ShortcutAction[];
  priority: number;
  enabled?: boolean; // Allow disabling entire contexts
}

class KeyboardShortcutManager {
  private contexts: Map<string, ShortcutContext> = new Map();
  private globalListener: ((e: KeyboardEvent) => void) | null = null;
  private isListening = false;
  private globallyDisabled = false;

  private shouldIgnoreShortcut(e: KeyboardEvent): boolean {
    if (this.globallyDisabled) return true;

    const activeElement = document.activeElement;
    if (!activeElement) return false;

    // Ignore shortcuts when typing in form elements
    const inputTags = ["INPUT", "TEXTAREA", "SELECT"];
    if (inputTags.includes(activeElement.tagName)) return true;

    // Ignore shortcuts when in contenteditable elements
    if (activeElement.getAttribute("contenteditable") === "true") return true;

    // Allow most browser shortcuts to work normally (mainly Ctrl/Cmd combinations)
    const allowedBrowserShortcuts = [
      { key: "r", ctrl: true }, // Ctrl+R (reload)
      { key: "r", meta: true }, // Cmd+R (reload)
      { key: "f", ctrl: true }, // Ctrl+F (find)
      { key: "f", meta: true }, // Cmd+F (find)
      { key: "c", ctrl: true }, // Ctrl+C (copy)
      { key: "c", meta: true }, // Cmd+C (copy)
      { key: "v", ctrl: true }, // Ctrl+V (paste)
      { key: "v", meta: true }, // Cmd+V (paste)
      { key: "x", ctrl: true }, // Ctrl+X (cut)
      { key: "x", meta: true }, // Cmd+X (cut)
      { key: "z", ctrl: true }, // Ctrl+Z (undo)
      { key: "z", meta: true }, // Cmd+Z (undo)
      { key: "y", ctrl: true }, // Ctrl+Y (redo)
      { key: "y", meta: true }, // Cmd+Y (redo)
      { key: "a", ctrl: true }, // Ctrl+A (select all)
      { key: "a", meta: true }, // Cmd+A (select all)
      { key: "s", ctrl: true }, // Ctrl+S (save)
      { key: "s", meta: true }, // Cmd+S (save)
      { key: "n", ctrl: true }, // Ctrl+N (new)
      { key: "n", meta: true }, // Cmd+N (new)
      { key: "t", ctrl: true }, // Ctrl+T (new tab)
      { key: "t", meta: true }, // Cmd+T (new tab)
      { key: "w", ctrl: true }, // Ctrl+W (close tab)
      { key: "w", meta: true }, // Cmd+W (close tab)
    ];

    // Check if this is a browser shortcut that should be preserved
    const isBrowserShortcut = allowedBrowserShortcuts.some(
      (shortcut) =>
        e.key.toLowerCase() === shortcut.key &&
        ((shortcut.ctrl && e.ctrlKey) || (shortcut.meta && e.metaKey))
    );

    if (isBrowserShortcut) return true;

    return false;
  }

  private matchesShortcut(e: KeyboardEvent, shortcut: ShortcutAction): boolean {
    if (shortcut.disabled) return false;
    if (e.key !== shortcut.key) return false;

    if (shortcut.requiresCtrl && !e.ctrlKey) return false;
    if (shortcut.requiresMeta && !e.metaKey) return false;
    if (shortcut.requiresShift && !e.shiftKey) return false;
    if (shortcut.requiresAlt && !e.altKey) return false;

    // Ensure modifiers match exactly
    if (!shortcut.requiresCtrl && e.ctrlKey) return false;
    if (!shortcut.requiresMeta && e.metaKey) return false;
    if (!shortcut.requiresShift && e.shiftKey) return false;
    if (!shortcut.requiresAlt && e.altKey) return false;

    return true;
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (this.shouldIgnoreShortcut(e)) return;

    // Get all enabled contexts sorted by priority (higher first)
    const sortedContexts = Array.from(this.contexts.values())
      .filter((context) => context.enabled !== false)
      .sort((a, b) => b.priority - a.priority);

    // Find the highest priority matching shortcut
    for (const context of sortedContexts) {
      const matchingShortcuts = context.shortcuts
        .filter((shortcut) => this.matchesShortcut(e, shortcut))
        .sort((a, b) => (b.priority || 0) - (a.priority || 0));

      if (matchingShortcuts.length > 0) {
        const shortcut = matchingShortcuts[0];
        e.preventDefault();
        e.stopPropagation();
        try {
          shortcut.action();
        } catch (error) {
          console.error("Error executing shortcut:", error);
        }
        return;
      }
    }
  };

  addContext(context: ShortcutContext): void {
    this.contexts.set(context.name, {
      ...context,
      enabled: context.enabled !== false,
    });
    this.startListening();
  }

  removeContext(name: string): void {
    this.contexts.delete(name);
    if (this.contexts.size === 0) {
      this.stopListening();
    }
  }

  updateContext(name: string, shortcuts: ShortcutAction[]): void {
    const context = this.contexts.get(name);
    if (context) {
      context.shortcuts = shortcuts;
    }
  }

  enableContext(name: string): void {
    const context = this.contexts.get(name);
    if (context) {
      context.enabled = true;
    }
  }

  disableContext(name: string): void {
    const context = this.contexts.get(name);
    if (context) {
      context.enabled = false;
    }
  }

  private startListening(): void {
    if (!this.isListening) {
      document.addEventListener("keydown", this.handleKeyDown, true);
      this.isListening = true;
    }
  }

  private stopListening(): void {
    if (this.isListening) {
      document.removeEventListener("keydown", this.handleKeyDown, true);
      this.isListening = false;
    }
  }

  // Method to temporarily disable all shortcuts (useful for modals, etc.)
  disableShortcuts(): void {
    this.globallyDisabled = true;
  }

  enableShortcuts(): void {
    this.globallyDisabled = false;
  }

  // Get all active shortcuts for documentation
  getActiveShortcuts(): { context: string; shortcuts: ShortcutAction[] }[] {
    return Array.from(this.contexts.entries())
      .filter(([, context]) => context.enabled !== false)
      .map(([name, context]) => ({
        context: name,
        shortcuts: context.shortcuts.filter((s) => !s.disabled),
      }));
  }
}

// Global instance
const shortcutManager = new KeyboardShortcutManager();

// Hook for using keyboard shortcuts in components
export function useKeyboardShortcuts(
  contextName: string,
  shortcuts: ShortcutAction[],
  priority: number = 0,
  dependencies: any[] = []
): void {
  const contextRef = useRef<ShortcutContext | undefined>(undefined);

  useEffect(() => {
    const context: ShortcutContext = {
      name: contextName,
      shortcuts,
      priority,
      enabled: true,
    };

    contextRef.current = context;
    shortcutManager.addContext(context);

    return () => {
      shortcutManager.removeContext(contextName);
    };
  }, [contextName, priority, ...dependencies]);

  useEffect(() => {
    if (contextRef.current) {
      shortcutManager.updateContext(contextName, shortcuts);
    }
  }, [shortcuts, contextName]);
}

// Utility hook for temporarily disabling shortcuts
export function useShortcutControl(): {
  disableShortcuts: () => void;
  enableShortcuts: () => void;
  disableContext: (name: string) => void;
  enableContext: (name: string) => void;
  getActiveShortcuts: () => { context: string; shortcuts: ShortcutAction[] }[];
} {
  return {
    disableShortcuts: () => shortcutManager.disableShortcuts(),
    enableShortcuts: () => shortcutManager.enableShortcuts(),
    disableContext: (name: string) => shortcutManager.disableContext(name),
    enableContext: (name: string) => shortcutManager.enableContext(name),
    getActiveShortcuts: () => shortcutManager.getActiveShortcuts(),
  };
}

export default shortcutManager;
