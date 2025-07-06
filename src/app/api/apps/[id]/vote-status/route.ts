import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { votes, users } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id: appId } = await params;

  // Get total vote count
  const voteCountResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(votes)
    .where(eq(votes.appId, appId));

  const voteCount = Number(voteCountResult[0]?.count || 0);

  if (!session?.user?.email) {
    return NextResponse.json({
      hasVoted: false,
      voteCount,
    });
  }

  try {
    // Get user from database
    const userResult = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!userResult.length) {
      return NextResponse.json({
        hasVoted: false,
        voteCount,
      });
    }

    const userId = userResult[0].id;

    // Check if user has voted
    const existingVote = await db
      .select({ id: votes.id })
      .from(votes)
      .where(and(eq(votes.userId, userId), eq(votes.appId, appId)))
      .limit(1);

    return NextResponse.json({
      hasVoted: existingVote.length > 0,
      voteCount,
    });
  } catch (error) {
    console.error("Error checking vote status:", error);
    return NextResponse.json({
      hasVoted: false,
      voteCount,
    });
  }
}
