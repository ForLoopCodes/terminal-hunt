import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apps, users, votes, comments, viewLogs } from "@/lib/db/schema";
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
      .where(eq(apps.id, id))
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
