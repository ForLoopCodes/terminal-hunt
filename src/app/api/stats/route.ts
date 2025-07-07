import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apps, users, votes } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Get total number of apps
    const totalAppsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(apps);
    const totalApps = totalAppsResult[0]?.count || 0;

    // Get total number of users
    const totalUsersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // Get total number of votes
    const totalVotesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(votes);
    const totalVotes = totalVotesResult[0]?.count || 0;

    return NextResponse.json({
      totalApps,
      totalUsers,
      totalVotes,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
