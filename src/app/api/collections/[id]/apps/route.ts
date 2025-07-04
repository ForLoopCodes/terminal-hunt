import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { collections, users, collectionApps, apps } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

// POST - Add app to collection
export async function POST(
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
    const { appId, notes } = body;

    if (!appId) {
      return NextResponse.json(
        { error: "App ID is required" },
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

    // Check if app exists
    const app = await db.select().from(apps).where(eq(apps.id, appId)).limit(1);

    if (!app.length) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    // Check if app is already in collection
    const existingCollectionApp = await db
      .select()
      .from(collectionApps)
      .where(
        and(
          eq(collectionApps.collectionId, collectionId),
          eq(collectionApps.appId, appId)
        )
      )
      .limit(1);

    if (existingCollectionApp.length) {
      return NextResponse.json(
        { error: "App is already in this collection" },
        { status: 400 }
      );
    }

    // Get the next sort order
    const lastApp = await db
      .select({ sortOrder: collectionApps.sortOrder })
      .from(collectionApps)
      .where(eq(collectionApps.collectionId, collectionId))
      .orderBy(desc(collectionApps.sortOrder))
      .limit(1);

    const nextSortOrder = lastApp.length ? (lastApp[0].sortOrder || 0) + 1 : 0;

    // Add app to collection
    const [newCollectionApp] = await db
      .insert(collectionApps)
      .values({
        collectionId,
        appId,
        notes: notes?.trim() || null,
        sortOrder: nextSortOrder,
      })
      .returning();

    return NextResponse.json(newCollectionApp, { status: 201 });
  } catch (error) {
    console.error("Error adding app to collection:", error);
    return NextResponse.json(
      { error: "Failed to add app to collection" },
      { status: 500 }
    );
  }
}

// DELETE - Remove app from collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: collectionId } = await params;
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get("appId");

    if (!appId) {
      return NextResponse.json(
        { error: "App ID is required" },
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

    // Remove app from collection
    const deletedApp = await db
      .delete(collectionApps)
      .where(
        and(
          eq(collectionApps.collectionId, collectionId),
          eq(collectionApps.appId, appId)
        )
      )
      .returning();

    if (!deletedApp.length) {
      return NextResponse.json(
        { error: "App not found in collection" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing app from collection:", error);
    return NextResponse.json(
      { error: "Failed to remove app from collection" },
      { status: 500 }
    );
  }
}
