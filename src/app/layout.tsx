import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Navigation } from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Termhunt - Discover Amazing Terminal Apps",
  description:
    "A Product Hunt-inspired platform for discovering and sharing terminal-based applications.",
  keywords: [
    "terminal",
    "cli",
    "command line",
    "apps",
    "tools",
    "developer",
    "programming",
    "unix",
    "linux",
    "bash",
    "shell",
    "productivity",
  ],
  authors: [{ name: "Termhunt Team" }],
  creator: "Termhunt",
  publisher: "Termhunt",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Termhunt - Discover Amazing Terminal Apps",
    description:
      "A Product Hunt-inspired platform for discovering and sharing terminal-based applications.",
    url: "/",
    siteName: "Termhunt",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://imageupload.app/i/9a3fa3be78bcfe585ea5", // The ASCII art image you provided
        width: 1200,
        height: 630,
        alt: "Termhunt - Discover Amazing Terminal Apps",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Termhunt - Discover Amazing Terminal Apps",
    description:
      "A Product Hunt-inspired platform for discovering and sharing terminal-based applications.",
    site: "@termhunt", // Replace with your actual Twitter handle
    creator: "@termhunt", // Replace with your actual Twitter handle
    images: [
      {
        url: "https://imageupload.app/i/9a3fa3be78bcfe585ea5", // The ASCII art image you provided
        width: 1200,
        height: 630,
        alt: "Termhunt - Discover Amazing Terminal Apps",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // google: "your-google-verification-code", // Add when you set up Google Search Console
    // yandex: "your-yandex-verification-code", // Add if needed
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-black">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('terminal-hunt-theme') || 'green';
                  const themes = {
                    green: { primary: '#03050c', secondary: '#1c2541', accent: '#4b6688', highlight: '#5bc0be', text: '#6fffe9', textSecondary: '#4b6688' },
                    cyberpunk: { primary: '#0a0a0a', secondary: '#1a1a2e', accent: '#16213e', highlight: '#e94560', text: '#0f4c75', textSecondary: '#533483' },
                    matrix: { primary: '#000000', secondary: '#001100', accent: '#003300', highlight: '#00ff00', text: '#00aa00', textSecondary: '#005500' },
                    amber: { primary: '#1e1611', secondary: '#2d241b', accent: '#3d3025', highlight: '#ffb000', text: '#ffa500', textSecondary: '#cc8400' },
                    'hacker-blue': { primary: '#0c0c0c', secondary: '#1a1a1a', accent: '#2a2a2a', highlight: '#00aaff', text: '#66ccff', textSecondary: '#4488cc' },
                    'neon-purple': { primary: '#0f0f0f', secondary: '#1a0d1a', accent: '#2a1a2a', highlight: '#cc00ff', text: '#bb99ff', textSecondary: '#8866cc' },
                    'blood-red': { primary: '#0f0505', secondary: '#1a0a0a', accent: '#2a1515', highlight: '#ff3333', text: '#ff6666', textSecondary: '#cc4444' },
                    'ocean-deep': { primary: '#051025', secondary: '#0a1a35', accent: '#152545', highlight: '#00ccff', text: '#66ddff', textSecondary: '#4499cc' },
                    'forest-dark': { primary: '#0a1a0a', secondary: '#152515', accent: '#203020', highlight: '#44ff44', text: '#88ff88', textSecondary: '#55cc55' },
                    'sunset-orange': { primary: '#1a0f05', secondary: '#251a0a', accent: '#302515', highlight: '#ff6600', text: '#ff9944', textSecondary: '#cc7733' },
                    'midnight-blue': { primary: '#050a15', secondary: '#0a1525', accent: '#152035', highlight: '#4488ff', text: '#77aaff', textSecondary: '#5588cc' },
                    'electric-lime': { primary: '#0a1005', secondary: '#151a0a', accent: '#20250f', highlight: '#ccff00', text: '#99ff33', textSecondary: '#77cc22' },
                    'hot-pink': { primary: '#150a15', secondary: '#250a25', accent: '#350f35', highlight: '#ff1493', text: '#ff69b4', textSecondary: '#cc4488' },
                    'vapor-wave': { primary: '#0a0a15', secondary: '#15152a', accent: '#20203f', highlight: '#ff00ff', text: '#00ffff', textSecondary: '#8888ff' },
                    'terminal-classic': { primary: '#000000', secondary: '#111111', accent: '#333333', highlight: '#ffffff', text: '#c0c0c0', textSecondary: '#808080' },
                    'blade-runner': { primary: '#0a0a0f', secondary: '#151520', accent: '#202030', highlight: '#ff6600', text: '#ffaa00', textSecondary: '#cc8800' },
                    'toxic-green': { primary: '#0f1505', secondary: '#1a250a', accent: '#25350f', highlight: '#88ff00', text: '#aaff44', textSecondary: '#77cc22' },
                    'ice-blue': { primary: '#051015', secondary: '#0a1a25', accent: '#0f2535', highlight: '#00ddff', text: '#88eeff', textSecondary: '#55aacc' },
                    'royal-purple': { primary: '#0f050f', secondary: '#1a0a1a', accent: '#250f25', highlight: '#9933ff', text: '#bb66ff', textSecondary: '#8844cc' },
                    'golden-hour': { primary: '#151005', secondary: '#251a0a', accent: '#35250f', highlight: '#ffcc00', text: '#ffdd44', textSecondary: '#ccaa22' },
                    'steel-gray': { primary: '#0f0f0f', secondary: '#1a1a1a', accent: '#2a2a2a', highlight: '#888888', text: '#cccccc', textSecondary: '#999999' },
                    'cherry-blossom': { primary: '#150a10', secondary: '#250f20', accent: '#351530', highlight: '#ff88cc', text: '#ffaadd', textSecondary: '#cc77aa' }
                  };
                  
                  const theme = themes[savedTheme];
                  if (theme) {
                    const root = document.documentElement;
                    root.style.setProperty('--color-primary', theme.primary);
                    root.style.setProperty('--color-secondary', theme.secondary);
                    root.style.setProperty('--color-accent', theme.accent);
                    root.style.setProperty('--color-highlight', theme.highlight);
                    root.style.setProperty('--color-text', theme.text);
                    root.style.setProperty('--color-text-secondary', theme.textSecondary);
                  }
                } catch (e) {
                  // Fallback to default theme if something goes wrong
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <AuthProvider>
          <Navigation />
          <main className="min-h-screen bg-black">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
