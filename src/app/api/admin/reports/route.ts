import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { db } from "@/lib/db";
import { reports, users, apps, comments } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
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

    // Fetch all reports with related data
    const reportsQuery = await db
      .select({
        id: reports.id,
        reason: reports.reason,
        status: reports.status,
        reporterId: reports.reporterId,
        appId: reports.appId,
        commentId: reports.commentId,
        userId: reports.userId,
        createdAt: reports.createdAt,
        adminNotes: reports.adminNotes,
        appName: apps.name,
        commentContent: comments.content,
        userTag: users.userTag,
      })
      .from(reports)
      .leftJoin(apps, eq(reports.appId, apps.id))
      .leftJoin(comments, eq(reports.commentId, comments.id))
      .leftJoin(users, eq(reports.userId, users.id))
      .orderBy(desc(reports.createdAt));

    // Get reporter userTags for each report
    const allReports = await Promise.all(
      reportsQuery.map(async (report) => {
        const reporter = await db.query.users.findFirst({
          where: eq(users.id, report.reporterId),
          columns: { userTag: true },
        });

        return {
          ...report,
          reporterUserTag: reporter?.userTag || "unknown",
        };
      })
    );

    return NextResponse.json({
      reports: allReports,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
