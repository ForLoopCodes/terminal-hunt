import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tags } from "@/lib/db/schema";

export async function GET() {
  try {
    const allTags = await db.select().from(tags);

    return NextResponse.json({ tags: allTags });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}
