import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apps, viewLogs } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Increment view count
    await db
      .update(apps)
      .set({
        viewCount: sql`${apps.viewCount} + 1`,
      })
      .where(eq(apps.id, id));

    // Log the view
    await db.insert(viewLogs).values({
      appId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging view:", error);
    return NextResponse.json({ error: "Failed to log view" }, { status: 500 });
  }
}
