import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { collections, users, collectionApps } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// PUT - Reorder apps within a collection
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: collectionId } = await params;
    const body = await request.json();
    const { appIds } = body; // Array of app IDs in new order

    if (!Array.isArray(appIds)) {
      return NextResponse.json(
        { error: "App IDs must be an array" },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if collection exists and user owns it
    const collection = await db
      .select()
      .from(collections)
      .where(
        and(
          eq(collections.id, collectionId),
          eq(collections.userId, user[0].id)
        )
      )
      .limit(1);

    if (!collection.length) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    // Update sort order for each app in the collection
    await Promise.all(
      appIds.map(async (appId, index) => {
        await db
          .update(collectionApps)
          .set({ sortOrder: index })
          .where(
            and(
              eq(collectionApps.collectionId, collectionId),
              eq(collectionApps.appId, appId)
            )
          );
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering collection apps:", error);
    return NextResponse.json(
      { error: "Failed to reorder collection apps" },
      { status: 500 }
    );
  }
}
