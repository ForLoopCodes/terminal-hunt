import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL || "https://termhunt.dev";

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Termhunt - Latest Terminal Apps</title>
    <description>Discover the latest and greatest terminal-based applications and CLI tools</description>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Termhunt RSS Generator</generator>
    <webMaster>contact@termhunt.dev (Termhunt Team)</webMaster>
    <managingEditor>contact@termhunt.dev (Termhunt Team)</managingEditor>
    <category>Technology</category>
    <category>Developer Tools</category>
    <category>Command Line</category>
    <image>
      <url>${baseUrl}/termhunt-logo.png</url>
      <title>Termhunt</title>
      <link>${baseUrl}</link>
      <description>Termhunt logo</description>
      <width>144</width>
      <height>144</height>
    </image>
    
    <!-- Static items for now - you can dynamically populate this with your latest apps -->
    <item>
      <title>Welcome to Termhunt</title>
      <description>Discover amazing terminal applications and CLI tools in our curated platform</description>
      <link>${baseUrl}</link>
      <guid isPermaLink="true">${baseUrl}</guid>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <category>General</category>
    </item>
    
    <!-- TODO: Add dynamic items from your database -->
    <!-- Example:
    <item>
      <title>App Name</title>
      <description>App description</description>
      <link>${baseUrl}/app/app-id</link>
      <guid isPermaLink="true">${baseUrl}/app/app-id</guid>
      <pubDate>App publication date</pubDate>
      <category>App category</category>
    </item>
    -->
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
