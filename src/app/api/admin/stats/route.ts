import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { db } from "@/lib/db";
import { reports, users, apps, comments } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is an admin
    if (!session.user.isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get various statistics
    const [
      totalReportsResult,
      pendingReportsResult,
      totalUsersResult,
      suspendedUsersResult,
      totalAppsResult,
      totalCommentsResult,
    ] = await Promise.all([
      db.select({ count: count() }).from(reports),
      db
        .select({ count: count() })
        .from(reports)
        .where(eq(reports.status, "pending")),
      db.select({ count: count() }).from(users),
      db
        .select({ count: count() })
        .from(users)
        .where(eq(users.suspended, true)),
      db.select({ count: count() }).from(apps),
      db.select({ count: count() }).from(comments),
    ]);

    const stats = {
      totalReports: totalReportsResult[0]?.count || 0,
      pendingReports: pendingReportsResult[0]?.count || 0,
      totalUsers: totalUsersResult[0]?.count || 0,
      suspendedUsers: suspendedUsersResult[0]?.count || 0,
      totalApps: totalAppsResult[0]?.count || 0,
      totalComments: totalCommentsResult[0]?.count || 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
