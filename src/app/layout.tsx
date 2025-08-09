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
  title: {
    default: "Termhunt - Discover Amazing Terminal Apps",
    template: "%s | Termhunt - Terminal Apps Discovery",
  },
  description:
    "Discover, share, and explore the best terminal-based applications and CLI tools. A curated platform for developers to find powerful command-line utilities, productivity tools, and developer essentials.",
  keywords: [
    "terminal apps",
    "cli tools",
    "command line interface",
    "developer tools",
    "programming utilities",
    "unix tools",
    "linux applications",
    "bash scripts",
    "shell utilities",
    "productivity tools",
    "command line productivity",
    "terminal productivity",
    "developer productivity",
    "open source tools",
    "terminal software",
    "cli applications",
    "command line apps",
    "terminal utilities",
    "developer resources",
    "programming tools",
  ],
  authors: [{ name: "Termhunt Team", url: "https://termhunt.dev" }],
  creator: "Termhunt",
  publisher: "Termhunt",
  applicationName: "Termhunt",
  category: "Technology",
  classification: "Developer Tools Platform",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://termhunt.dev"),
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [
        {
          url: "/feed.xml",
          title: "Termhunt - Latest Terminal Apps",
        },
      ],
    },
  },
  openGraph: {
    title: "Termhunt - Discover Amazing Terminal Apps",
    description:
      "Discover, share, and explore the best terminal-based applications and CLI tools. A curated platform for developers to find powerful command-line utilities.",
    url: "/",
    siteName: "Termhunt",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/termhunt-og-image.png",
        width: 1200,
        height: 630,
        alt: "Termhunt - Discover Amazing Terminal Apps Platform",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Termhunt - Discover Amazing Terminal Apps",
    description:
      "Discover, share, and explore the best terminal-based applications and CLI tools. A curated platform for developers.",
    site: "@termhunt",
    creator: "@termhunt",
    images: [
      {
        url: "/termhunt-og-image.png",
        width: 1200,
        height: 630,
        alt: "Termhunt - Discover Amazing Terminal Apps Platform",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    noarchive: false,
    nosnippet: false,
    noimageindex: false,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_CODE,
    // yandex: process.env.YANDEX_VERIFICATION_CODE,
    // bing: process.env.BING_VERIFICATION_CODE,
  },
  other: {
    "google-site-verification": process.env.GOOGLE_VERIFICATION_CODE || "",
    "msvalidate.01": process.env.BING_VERIFICATION_CODE || "",
    "theme-color": "#03050c",
    "color-scheme": "dark",
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
        <link
          rel="canonical"
          href={process.env.NEXTAUTH_URL || "https://termhunt.dev"}
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <meta name="theme-color" content="#03050c" />
        <meta name="color-scheme" content="dark" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />

        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": `${
                    process.env.NEXTAUTH_URL || "https://termhunt.dev"
                  }/#website`,
                  url: process.env.NEXTAUTH_URL || "https://termhunt.dev",
                  name: "Termhunt",
                  description:
                    "Discover, share, and explore the best terminal-based applications and CLI tools.",
                  publisher: {
                    "@id": `${
                      process.env.NEXTAUTH_URL || "https://termhunt.dev"
                    }/#organization`,
                  },
                  potentialAction: [
                    {
                      "@type": "SearchAction",
                      target: {
                        "@type": "EntryPoint",
                        urlTemplate: `${
                          process.env.NEXTAUTH_URL || "https://termhunt.dev"
                        }/?search={search_term_string}`,
                      },
                      "query-input": "required name=search_term_string",
                    },
                  ],
                  inLanguage: "en-US",
                },
                {
                  "@type": "Organization",
                  "@id": `${
                    process.env.NEXTAUTH_URL || "https://termhunt.dev"
                  }/#organization`,
                  name: "Termhunt",
                  url: process.env.NEXTAUTH_URL || "https://termhunt.dev",
                  logo: {
                    "@type": "ImageObject",
                    inLanguage: "en-US",
                    "@id": `${
                      process.env.NEXTAUTH_URL || "https://termhunt.dev"
                    }/#/schema/logo/image/`,
                    url: `${
                      process.env.NEXTAUTH_URL || "https://termhunt.dev"
                    }/termhunt-logo.png`,
                    contentUrl: `${
                      process.env.NEXTAUTH_URL || "https://termhunt.dev"
                    }/termhunt-logo.png`,
                    width: 512,
                    height: 512,
                    caption: "Termhunt",
                  },
                  image: {
                    "@id": `${
                      process.env.NEXTAUTH_URL || "https://termhunt.dev"
                    }/#/schema/logo/image/`,
                  },
                  sameAs: [
                    "https://github.com/ForLoopCodes/terminal-hunt",
                    "https://www.npmjs.com/package/termhunt-cli",
                  ],
                },
                {
                  "@type": "WebPage",
                  "@id": `${
                    process.env.NEXTAUTH_URL || "https://termhunt.dev"
                  }/#webpage`,
                  url: process.env.NEXTAUTH_URL || "https://termhunt.dev",
                  name: "Termhunt - Discover Amazing Terminal Apps",
                  isPartOf: {
                    "@id": `${
                      process.env.NEXTAUTH_URL || "https://termhunt.dev"
                    }/#website`,
                  },
                  about: {
                    "@id": `${
                      process.env.NEXTAUTH_URL || "https://termhunt.dev"
                    }/#organization`,
                  },
                  description:
                    "Discover, share, and explore the best terminal-based applications and CLI tools. A curated platform for developers to find powerful command-line utilities.",
                  breadcrumb: {
                    "@id": `${
                      process.env.NEXTAUTH_URL || "https://termhunt.dev"
                    }/#breadcrumb`,
                  },
                  inLanguage: "en-US",
                  potentialAction: [
                    {
                      "@type": "ReadAction",
                      target: [
                        `${process.env.NEXTAUTH_URL || "https://termhunt.dev"}`,
                      ],
                    },
                  ],
                },
              ],
            }),
          }}
        />

        {/* Theme initialization script */}
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
