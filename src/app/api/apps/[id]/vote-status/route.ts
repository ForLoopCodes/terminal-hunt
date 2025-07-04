import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { votes, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ hasVoted: false });
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
      return NextResponse.json({ hasVoted: false });
    }

    // Check if user has voted
    const existingVote = await db
      .select()
      .from(votes)
      .where(and(eq(votes.userId, user[0].id), eq(votes.appId, appId)))
      .limit(1);

    return NextResponse.json({ hasVoted: existingVote.length > 0 });
  } catch (error) {
    console.error("Error checking vote status:", error);
    return NextResponse.json({ hasVoted: false });
  }
}
