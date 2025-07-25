import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { apps, users, votes, appTags } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sortBy = searchParams.get("sort") || "newest";
  const tagId = searchParams.get("tag");
  const search = searchParams.get("search");

  try {
    // Simple query to get apps with creator info first
    const appsWithCreators = await db
      .select({
        id: apps.id,
        name: apps.name,
        shortDescription: apps.shortDescription,
        description: apps.description,
        website: apps.website,
        documentationUrl: apps.documentationUrl,
        asciiArt: apps.asciiArt,
        installCommands: apps.installCommands,
        repoUrl: apps.repoUrl,
        viewCount: apps.viewCount,
        createdAt: apps.createdAt,
        creatorId: apps.creatorId,
        creatorName: users.name,
        creatorUserTag: users.userTag,
      })
      .from(apps)
      .leftJoin(users, eq(apps.creatorId, users.id))
      .orderBy(desc(apps.createdAt));

    // Filter by tag if specified
    let filteredApps = appsWithCreators;
    if (tagId) {
      const appIdsWithTag = await db
        .select({ appId: appTags.appId })
        .from(appTags)
        .where(eq(appTags.tagId, tagId));

      const taggedAppIds = appIdsWithTag.map((row) => row.appId);
      filteredApps = appsWithCreators.filter((app) =>
        taggedAppIds.includes(app.id)
      );
    }

    // Filter by search if specified
    if (search) {
      const searchLower = search.toLowerCase();
      filteredApps = filteredApps.filter(
        (app) =>
          app.name.toLowerCase().includes(searchLower) ||
          app.description.toLowerCase().includes(searchLower) ||
          (app.shortDescription &&
            app.shortDescription.toLowerCase().includes(searchLower))
      );
    }

    // Get vote counts for each app
    const appsWithVotes = await Promise.all(
      filteredApps.map(async (app) => {
        const voteCount = await db
          .select()
          .from(votes)
          .where(eq(votes.appId, app.id));

        return {
          ...app,
          voteCount: voteCount.length,
        };
      })
    );

    // Apply sorting
    switch (sortBy) {
      case "votes":
        appsWithVotes.sort((a, b) => b.voteCount - a.voteCount);
        break;
      case "views":
        appsWithVotes.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        break;
      case "newest":
      default:
        appsWithVotes.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
    }

    return NextResponse.json({ apps: appsWithVotes });
  } catch (error) {
    console.error("Error fetching apps:", error);
    return NextResponse.json(
      { error: "Failed to fetch apps" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      shortDescription,
      description,
      website,
      documentationUrl,
      asciiArt,
      asciiArtAlignment,
      installCommands,
      primaryInstallCommand,
      makefile,
      identifier,
      repoUrl,
      tagIds,
    } = body;

    // Validate required fields
    if (!name || !description || !installCommands || !repoUrl || !identifier) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check identifier uniqueness
    const existingIdentifier = await db
      .select()
      .from(apps)
      .where(eq(apps.identifier, identifier))
      .limit(1);
    if (existingIdentifier.length > 0) {
      return NextResponse.json(
        { error: "Identifier already exists" },
        { status: 400 }
      );
    }

    // Get user from database using email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user.length) {
      // Try to create user if they don't exist (for OAuth users)
      const userTag = session.user.email
        .split("@")[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      const [newUser] = await db
        .insert(users)
        .values({
          email: session.user.email,
          name: session.user.name || session.user.email,
          userTag: userTag,
        })
        .returning();
      user.push(newUser);
    }

    // Default values
    const asciiAlignment = asciiArtAlignment || "center";
    const primaryCmd = primaryInstallCommand || `hunt ${identifier}`;

    // Create the app
    const [newApp] = await db
      .insert(apps)
      .values({
        name,
        shortDescription,
        description,
        website,
        documentationUrl,
        asciiArt,
        asciiArtAlignment: asciiAlignment,
        installCommands,
        primaryInstallCommand: primaryCmd,
        makefile,
        identifier,
        repoUrl,
        creatorId: user[0].id,
      })
      .returning();

    // Add tags if provided
    if (tagIds && tagIds.length > 0) {
      const tagRelations = tagIds.map((tagId: string) => ({
        appId: newApp.id,
        tagId,
      }));
      await db.insert(appTags).values(tagRelations);
    }

    return NextResponse.json(newApp, { status: 201 });
  } catch (error) {
    console.error("Error creating app:", error);
    return NextResponse.json(
      { error: "Failed to create app" },
      { status: 500 }
    );
  }
}
