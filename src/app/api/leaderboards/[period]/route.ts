import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apps, users, votes, viewLogs } from "@/lib/db/schema";
import { eq, sql, gte, desc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ period: string }> }
) {
  try {
    const { period } = await params;

    if (!["daily", "weekly", "monthly", "yearly"].includes(period)) {
      return NextResponse.json(
        { error: "Invalid period. Must be daily, weekly, monthly, or yearly" },
        { status: 400 }
      );
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "daily":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "weekly":
        const dayOfWeek = now.getDay();
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - dayOfWeek
        );
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    // Get vote counts for the period
    const voteLeaderboard = await db
      .select({
        appId: votes.appId,
        appName: apps.name,
        creatorName: users.name,
        creatorUserTag: users.userTag,
        voteCount: sql<number>`count(${votes.id})`.as("vote_count"),
      })
      .from(votes)
      .innerJoin(apps, eq(votes.appId, apps.id))
      .innerJoin(users, eq(apps.creatorId, users.id))
      .where(gte(votes.createdAt, startDate))
      .groupBy(votes.appId, apps.name, users.name, users.userTag)
      .orderBy(desc(sql`count(${votes.id})`))
      .limit(10);

    // Get view counts for the period
    const viewLeaderboard = await db
      .select({
        appId: viewLogs.appId,
        appName: apps.name,
        creatorName: users.name,
        creatorUserTag: users.userTag,
        viewCount: sql<number>`count(${viewLogs.id})`.as("view_count"),
      })
      .from(viewLogs)
      .innerJoin(apps, eq(viewLogs.appId, apps.id))
      .innerJoin(users, eq(apps.creatorId, users.id))
      .where(gte(viewLogs.viewedAt, startDate))
      .groupBy(viewLogs.appId, apps.name, users.name, users.userTag)
      .orderBy(desc(sql`count(${viewLogs.id})`))
      .limit(10);

    return NextResponse.json({
      period,
      startDate: startDate.toISOString(),
      voteLeaderboard,
      viewLeaderboard,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
