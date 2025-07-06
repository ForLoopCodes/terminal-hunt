import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { votes, users, apps } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

// POST method for voting (upvote)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: appId } = await params;

    // Get user from database
    const userResult = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!userResult.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userResult[0].id;

    // Check if app exists
    const appExists = await db
      .select({ id: apps.id })
      .from(apps)
      .where(eq(apps.id, appId))
      .limit(1);

    if (!appExists.length) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    // Check if user already voted
    const existingVote = await db
      .select({ id: votes.id })
      .from(votes)
      .where(and(eq(votes.userId, userId), eq(votes.appId, appId)))
      .limit(1);

    if (existingVote.length > 0) {
      // User already voted, remove the vote (toggle off)
      await db
        .delete(votes)
        .where(and(eq(votes.userId, userId), eq(votes.appId, appId)));

      // Get updated vote count
      const voteCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(votes)
        .where(eq(votes.appId, appId));

      return NextResponse.json({
        voted: false,
        voteCount: Number(voteCountResult[0]?.count || 0),
        message: "Vote removed",
      });
    } else {
      // User hasn't voted, create new vote
      await db.insert(votes).values({
        userId,
        appId,
        createdAt: new Date(),
      });

      // Get updated vote count
      const voteCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(votes)
        .where(eq(votes.appId, appId));

      return NextResponse.json({
        voted: true,
        voteCount: Number(voteCountResult[0]?.count || 0),
        message: "Vote added",
      });
    }
  } catch (error) {
    console.error("Error handling vote:", error);
    return NextResponse.json(
      { error: "Failed to process vote" },
      { status: 500 }
    );
  }
}

// DELETE method for removing vote (downvote)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: appId } = await params;

    // Get user from database
    const userResult = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!userResult.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userResult[0].id;

    // Delete the vote if it exists
    const deletedVote = await db
      .delete(votes)
      .where(and(eq(votes.userId, userId), eq(votes.appId, appId)))
      .returning();

    // Get updated vote count
    const voteCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(votes)
      .where(eq(votes.appId, appId));

    return NextResponse.json({
      voted: false,
      voteCount: Number(voteCountResult[0]?.count || 0),
      message: deletedVote.length > 0 ? "Vote removed" : "No vote to remove",
    });
  } catch (error) {
    console.error("Error removing vote:", error);
    return NextResponse.json(
      { error: "Failed to remove vote" },
      { status: 500 }
    );
  }
}
