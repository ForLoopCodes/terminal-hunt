import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { db } from "@/lib/db";
import { reports, users } from "@/lib/db/schema";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { reason, description, appId, commentId, userId } =
      await request.json();

    if (!reason || (!appId && !commentId && !userId)) {
      return NextResponse.json(
        { error: "Reason and target (app, comment, or user) are required" },
        { status: 400 }
      );
    }

    // Create report
    const newReport = await db
      .insert(reports)
      .values({
        reporterId: session.user.id,
        reason,
        appId: appId || null,
        commentId: commentId || null,
        userId: userId || null,
        status: "pending",
      })
      .returning();

    return NextResponse.json({
      message: "Report submitted successfully",
      report: newReport[0],
    });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
