"use client";

import { useState, useEffect, useRef } from "react";

export default function FAQPage() {
  const [focusedElement, setFocusedElement] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set()
  );

  // Refs for keyboard navigation
  const sectionRefs = useRef<(HTMLButtonElement | null)[]>([]);

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

      // Number keys 1-9 to focus/toggle FAQ sections
      if (key >= "1" && key <= "9") {
        e.preventDefault();
        const index = parseInt(key) - 1;
        if (index < faqData.length) {
          sectionRefs.current[index]?.focus();
          sectionRefs.current[index]?.click();
        }
      }

      switch (key) {
        case "a":
          e.preventDefault();
          // Expand all sections
          setExpandedSections(
            new Set(Array.from({ length: faqData.length }, (_, i) => i))
          );
          break;
        case "c":
          e.preventDefault();
          // Collapse all sections
          setExpandedSections(new Set());
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const faqData = [
    {
      question: "What is Terminal Hunt?",
      answer:
        "Terminal Hunt is a community-driven platform for discovering, sharing, and showcasing amazing terminal-based applications. Think of it as Product Hunt specifically for command-line tools and terminal applications.",
    },
    {
      question: "How do I submit an app?",
      answer:
        "After signing in, click the 'Submit App' button in the navigation or press 'S'. Fill out the form with your app's name, description, installation commands, and repository URL. You can use Markdown for formatting.",
    },
    {
      question: "What makes a good terminal app submission?",
      answer:
        "A good submission includes: clear app name, detailed description of what it does, step-by-step installation instructions, active repository link, appropriate tags, and screenshots or examples if possible.",
    },
    {
      question: "How does the voting system work?",
      answer:
        "Community members can upvote apps they find useful. Apps with more votes rank higher and gain more visibility. You need to be signed in to vote, and you can only vote once per app.",
    },
    {
      question: "Can I edit my submitted apps?",
      answer:
        "Yes! Visit your profile page and click on any of your submitted apps. You'll see management options if you're the creator, including edit and delete functionality.",
    },
    {
      question: "What are the keyboard shortcuts?",
      answer:
        "Navigate with: H (Home), L (Leaderboard), F (FAQ), S (Submit/Sign Up), P (Profile), I (Sign In). On this page: 1-9 (toggle FAQ sections), A (expand all), C (collapse all).",
    },
    {
      question: "How do tags work?",
      answer:
        "Tags help categorize apps by type, language, or use case. You can filter the main page by tags and select multiple tags when submitting an app. Popular tags include CLI, DevTools, Productivity, etc.",
    },
    {
      question: "Is Terminal Hunt open source?",
      answer:
        "Yes! Terminal Hunt is built with transparency in mind. The platform itself demonstrates the kind of tools we celebrate - built for developers, by developers.",
    },
    {
      question: "How do I report issues or suggest features?",
      answer:
        "You can report bugs or suggest features through the repository issues page. We welcome community contributions and feedback to make the platform better.",
    },
  ];

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
                  
  F R E Q U E N T L Y   A S K E D   Q U E S T I O N S
  `;

  return (
    <div
      className="min-h-screen pt-20 pb-8"
      style={{ backgroundColor: "var(--color-primary)" }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <pre
            className="text-xs md:text-sm whitespace-pre-wrap font-semibold mb-8"
            style={{ color: "var(--color-accent)" }}
          >
            {termhuntText}
          </pre>
        </div>

        {/* Navigation Help */}
        <div
          className="p-4 max-w-[650px] px-6 mx-auto mb-8"
          style={{
            backgroundColor: "var(--color-primary)",
          }}
        >
          <div className="text-sm space-y-1">
            <div style={{ color: "var(--color-text)" }}>
              <span style={{ color: "var(--color-highlight)" }}>
                Navigation:{" "}
              </span>
              1-9 (toggle sections) | <span className="underline">A</span>{" "}
              (expand all) | <span className="underline">C</span> (collapse all)
            </div>
          </div>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-4 max-w-[650px] mx-auto">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className=""
              style={{
                backgroundColor: "var(--color-primary)",
              }}
            >
              <button
                ref={(el) => {
                  sectionRefs.current[index] = el;
                }}
                onClick={() => toggleSection(index)}
                onFocus={() => setFocusedElement(`faq-${index}`)}
                onBlur={() => setFocusedElement(null)}
                className="w-full text-left py-1 focus:outline-none text-sm flex items-center justify-between"
                style={{ color: "var(--color-text)" }}
              >
                <div className="flex items-center">
                  <span
                    className="mr-0 w-6 text-xs"
                    style={{ color: "var(--color-highlight)" }}
                  >
                    {focusedElement === `faq-${index}` ? ">" : " "}
                  </span>
                  <span className="font-medium">
                    <span
                      className="mr-2"
                      style={{ color: "var(--color-highlight)" }}
                    >
                      [{index + 1}]
                    </span>
                    {faq.question}
                  </span>
                </div>
                <span
                  className="text-sm font-mono"
                  style={{ color: "var(--color-accent)" }}
                >
                  {expandedSections.has(index) ? "[-]" : "[+]"}
                </span>
              </button>

              {expandedSections.has(index) && (
                <div
                  className="px-4 pb-4"
                  style={{ color: "var(--color-accent)" }}
                >
                  <div className="pl-2 text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Commands */}
        <div className="mt-12 text-center">
          <div
            className="text-xs mt-2"
            style={{ color: "var(--color-accent)" }}
          >
            for more help, dm me on twitter:{" "}
            <a
              href="https://twitter.com/forloopcodes"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--color-accent)" }}
            >
              @forloopcodes
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
