import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { votes, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: appId } = await params;

    // Get user from database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already voted
    const existingVote = await db
      .select()
      .from(votes)
      .where(and(eq(votes.userId, user[0].id), eq(votes.appId, appId)))
      .limit(1);

    if (existingVote.length > 0) {
      return NextResponse.json({ error: "Already voted" }, { status: 400 });
    }

    // Create vote
    const [newVote] = await db
      .insert(votes)
      .values({
        userId: user[0].id,
        appId,
      })
      .returning();

    return NextResponse.json(newVote, { status: 201 });
  } catch (error) {
    console.error("Error creating vote:", error);
    return NextResponse.json(
      { error: "Failed to create vote" },
      { status: 500 }
    );
  }
}

// DELETE method for unliking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: appId } = await params;

    // Get user from database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete the vote
    const deletedVote = await db
      .delete(votes)
      .where(and(eq(votes.userId, user[0].id), eq(votes.appId, appId)))
      .returning();

    if (!deletedVote.length) {
      return NextResponse.json({ error: "Vote not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting vote:", error);
    return NextResponse.json(
      { error: "Failed to delete vote" },
      { status: 500 }
    );
  }
}
