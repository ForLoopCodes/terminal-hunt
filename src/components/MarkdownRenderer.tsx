"use client";

import ReactMarkdown from "react-markdown";
import { CopyButton } from "./CopyButton";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Helper function to extract clean command text (remove backticks and trim)
const extractCommand = (text: string): string => {
  return text.replace(/^`+|`+$/g, "").trim();
};

// Helper function to detect if text looks like a command
const isCommand = (text: string): boolean => {
  const cleanText = text.trim();
  // Common command patterns
  const commandPatterns = [
    /^(npm|yarn|pnpm|bun)\s+/,
    /^(pip|pipx|poetry)\s+/,
    /^(cargo|go|make|cmake)\s+/,
    /^(git|curl|wget|ssh)\s+/,
    /^(docker|kubectl|helm)\s+/,
    /^(brew|apt|yum|dnf)\s+/,
    /^[a-zA-Z0-9_-]+\s+(install|add|create|run|build|start|stop)/,
    /^\$\s+/,
    /^#\s+/,
    /^hunt\s+/,
  ];

  return commandPatterns.some((pattern) => pattern.test(cleanText));
};

export function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        components={{
          code({ node, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const codeContent = String(children).replace(/\n$/, "");
            const inline = !className;

            if (inline) {
              const cleanCommand = extractCommand(codeContent);
              const showCopyButton =
                isCommand(cleanCommand) || cleanCommand.length > 10;

              return (
                <span className="relative inline-group">
                  <code
                    className="px-1 py-0.5 text-sm font-mono rounded"
                    style={{
                      backgroundColor: "var(--color-accent)",
                      color: "var(--color-text)",
                    }}
                    {...props}
                  >
                    {children}
                  </code>
                  {showCopyButton && (
                    <span className="ml-1 inline-block">
                      <CopyButton
                        text={cleanCommand}
                        className="text-xs opacity-70 hover:opacity-100"
                      />
                    </span>
                  )}
                </span>
              );
            }

            return (
              <div className="relative group">
                <pre
                  className="p-4 text-sm font-mono rounded overflow-x-auto"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-text)",
                    border: "1px solid var(--color-accent)",
                  }}
                >
                  <code {...props}>{children}</code>
                </pre>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <CopyButton
                    text={extractCommand(codeContent)}
                    className="bg-black bg-opacity-50 px-2 py-1 rounded text-xs"
                  />
                </div>
              </div>
            );
          },
          pre({ children, ...props }: any) {
            const codeElement = children as any;
            const codeContent = codeElement?.props?.children || "";
            const cleanCodeContent = extractCommand(String(codeContent));

            return (
              <div className="relative group">
                <pre
                  className="p-4 text-sm font-mono rounded overflow-x-auto"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-text)",
                    border: "1px solid var(--color-accent)",
                  }}
                  {...props}
                >
                  {children}
                </pre>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <CopyButton
                    text={cleanCodeContent}
                    className="bg-black bg-opacity-50 px-2 py-1 rounded text-xs"
                  />
                </div>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
