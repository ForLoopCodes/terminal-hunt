import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { db } from "@/lib/db";
import { reports, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
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

    const { action, adminNotes } = await request.json();
    const { reportId } = await params;

    if (!reportId || !action) {
      return NextResponse.json(
        { error: "Report ID and action are required" },
        { status: 400 }
      );
    }

    // Get the report to check if it involves a user
    const report = await db.query.reports.findFirst({
      where: eq(reports.id, reportId),
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Update report status
    await db
      .update(reports)
      .set({
        status: action,
        adminNotes: adminNotes || null,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
      })
      .where(eq(reports.id, reportId));

    // If action is "accepted" and it's a user report, suspend the user
    if (action === "accepted" && report.userId) {
      await db
        .update(users)
        .set({
          suspended: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, report.userId));
    }

    return NextResponse.json({
      success: true,
      message: "Report updated successfully",
    });
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
