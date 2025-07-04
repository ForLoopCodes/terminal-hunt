import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { collections, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// PUT - Reorder collections
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { collectionIds } = body; // Array of collection IDs in new order

    if (!Array.isArray(collectionIds)) {
      return NextResponse.json(
        { error: "Collection IDs must be an array" },
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

    // Update sort order for each collection
    await Promise.all(
      collectionIds.map(async (collectionId, index) => {
        await db
          .update(collections)
          .set({ sortOrder: index, updatedAt: new Date() })
          .where(
            and(
              eq(collections.id, collectionId),
              eq(collections.userId, user[0].id)
            )
          );
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering collections:", error);
    return NextResponse.json(
      { error: "Failed to reorder collections" },
      { status: 500 }
    );
  }
}
