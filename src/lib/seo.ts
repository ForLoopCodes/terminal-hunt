import { Metadata } from "next";

const baseUrl = process.env.NEXTAUTH_URL || "https://termhunt.dev";

interface GenerateMetadataProps {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
  canonical?: string;
  keywords?: string[];
}

export function generateMetadata({
  title = "Termhunt - Discover Amazing Terminal Apps",
  description = "Discover, share, and explore the best terminal-based applications and CLI tools. A curated platform for developers to find powerful command-line utilities.",
  image = "/termhunt-og-image.png",
  noIndex = false,
  canonical,
  keywords = [],
}: GenerateMetadataProps = {}): Metadata {
  const fullTitle = title.includes("Termhunt") ? title : `${title} | Termhunt`;
  const imageUrl = image.startsWith("http") ? image : `${baseUrl}${image}`;

  const defaultKeywords = [
    "terminal apps",
    "cli tools",
    "command line interface",
    "developer tools",
    "programming utilities",
  ];

  return {
    title: fullTitle,
    description,
    keywords: [...defaultKeywords, ...keywords],
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonical || baseUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical || baseUrl,
      siteName: "Termhunt",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
      site: "@termhunt",
      creator: "@termhunt",
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export function generateStructuredData(
  type: "website" | "app" | "profile" | "collection",
  data: any
) {
  const baseStructure = {
    "@context": "https://schema.org",
  };

  switch (type) {
    case "website":
      return {
        ...baseStructure,
        "@type": "WebSite",
        name: "Termhunt",
        url: baseUrl,
        description:
          "Discover, share, and explore the best terminal-based applications and CLI tools.",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${baseUrl}/?search={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      };

    case "app":
      return {
        ...baseStructure,
        "@type": "SoftwareApplication",
        name: data.name,
        description: data.description,
        url: `${baseUrl}/app/${data.id}`,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Linux, macOS, Windows",
        softwareVersion: data.version,
        datePublished: data.createdAt,
        author: {
          "@type": "Person",
          name: data.author,
        },
        aggregateRating: data.rating && {
          "@type": "AggregateRating",
          ratingValue: data.rating,
          reviewCount: data.reviewCount,
        },
      };

    case "profile":
      return {
        ...baseStructure,
        "@type": "ProfilePage",
        mainEntity: {
          "@type": "Person",
          name: data.name,
          url: `${baseUrl}/profile/${data.userTag}`,
          description: data.bio,
        },
      };

    case "collection":
      return {
        ...baseStructure,
        "@type": "Collection",
        name: data.name,
        description: data.description,
        url: `${baseUrl}/collections/${data.id}`,
        numberOfItems: data.appCount,
        creator: {
          "@type": "Person",
          name: data.creator,
        },
      };

    default:
      return baseStructure;
  }
}
