import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import {
  apps,
  users,
  votes,
  comments,
  viewLogs,
  collectionApps,
} from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get app with creator info
    const app = await db
      .select({
        id: apps.id,
        name: apps.name,
        shortDescription: apps.shortDescription,
        description: apps.description,
        website: apps.website,
        documentationUrl: apps.documentationUrl,
        asciiArt: apps.asciiArt,
        asciiArtAlignment: apps.asciiArtAlignment,
        installCommands: apps.installCommands,
        primaryInstallCommand: apps.primaryInstallCommand,
        makefile: apps.makefile,
        identifier: apps.identifier,
        repoUrl: apps.repoUrl,
        viewCount: apps.viewCount,
        createdAt: apps.createdAt,
        creatorId: apps.creatorId,
        creatorName: users.name,
        creatorUserTag: users.userTag,
      })
      .from(apps)
      .leftJoin(users, eq(apps.creatorId, users.id))
      .where(or(eq(apps.id, id), eq(apps.identifier, id)))
      .limit(1);

    if (!app.length) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    // Get vote count
    const voteCount = await db.select().from(votes).where(eq(votes.appId, id));

    // Get comments with user info
    const appComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        userId: comments.userId,
        userName: users.name,
        userTag: users.userTag,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.appId, id));

    return NextResponse.json({
      ...app[0],
      voteCount: voteCount.length,
      comments: appComments,
    });
  } catch (error) {
    console.error("Error fetching app:", error);
    return NextResponse.json({ error: "Failed to fetch app" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Increment view count
    await db
      .update(apps)
      .set({
        viewCount: sql`${apps.viewCount} + 1`,
      })
      .where(eq(apps.id, id));

    // Log the view
    await db.insert(viewLogs).values({
      appId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging view:", error);
    return NextResponse.json({ error: "Failed to log view" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
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
    } = body;

    // Get user from database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is the creator of the app
    const app = await db.select().from(apps).where(eq(apps.id, id)).limit(1);

    if (!app.length) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    if (app[0].creatorId !== user[0].id) {
      return NextResponse.json(
        { error: "Unauthorized to edit this app" },
        { status: 403 }
      );
    }

    // Validate required fields
    if (
      !name?.trim() ||
      !description?.trim() ||
      !installCommands?.trim() ||
      !repoUrl?.trim() ||
      !identifier?.trim()
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    // Check identifier uniqueness (if changed)
    if (identifier !== app[0].identifier) {
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
    }
    // Default values
    const asciiAlignment = asciiArtAlignment || "center";
    const primaryCmd = primaryInstallCommand || `hunt ${identifier}`;
    // Update the app
    const updatedApp = await db
      .update(apps)
      .set({
        name: name.trim(),
        shortDescription: shortDescription?.trim() || null,
        description: description.trim(),
        website: website?.trim() || null,
        documentationUrl: documentationUrl?.trim() || null,
        asciiArt: asciiArt?.trim() || null,
        asciiArtAlignment: asciiAlignment,
        installCommands: installCommands.trim(),
        primaryInstallCommand: primaryCmd,
        makefile,
        identifier,
        repoUrl: repoUrl.trim(),
        updatedAt: new Date(),
      })
      .where(eq(apps.id, id))
      .returning();

    if (!updatedApp.length) {
      return NextResponse.json(
        { error: "Failed to update app" },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedApp[0]);
  } catch (error) {
    console.error("Error updating app:", error);
    return NextResponse.json(
      { error: "Failed to update app" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get user from database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is the creator of the app
    const app = await db.select().from(apps).where(eq(apps.id, id)).limit(1);

    if (!app.length) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    if (app[0].creatorId !== user[0].id) {
      return NextResponse.json(
        { error: "Unauthorized to delete this app" },
        { status: 403 }
      );
    }

    // Delete related data first (foreign key constraints)
    await db.delete(collectionApps).where(eq(collectionApps.appId, id));
    await db.delete(comments).where(eq(comments.appId, id));
    await db.delete(votes).where(eq(votes.appId, id));
    await db.delete(viewLogs).where(eq(viewLogs.appId, id));

    // Delete the app
    await db.delete(apps).where(eq(apps.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting app:", error);
    return NextResponse.json(
      { error: "Failed to delete app" },
      { status: 500 }
    );
  }
}
