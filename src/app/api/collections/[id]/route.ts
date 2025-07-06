import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { collections, users, collectionApps, apps } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// GET collection details with apps
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session: { user: { email: string } } | null = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Get user from database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get collection
    const collection = await db
      .select()
      .from(collections)
      .where(and(eq(collections.id, id), eq(collections.userId, user[0].id)))
      .limit(1);

    if (!collection.length) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    // Get apps in collection
    const collectionWithApps = await db
      .select({
        collectionAppId: collectionApps.id,
        sortOrder: collectionApps.sortOrder,
        addedAt: collectionApps.addedAt,
        notes: collectionApps.notes,
        appId: apps.id,
        appName: apps.name,
        appDescription: apps.description,
        appShortDescription: apps.shortDescription,
        appWebsite: apps.website,
        asciiArt: apps.asciiArt,
        appViewCount: apps.viewCount,
        appCreatedAt: apps.createdAt,
        creatorId: apps.creatorId,
      })
      .from(collectionApps)
      .innerJoin(apps, eq(collectionApps.appId, apps.id))
      .where(eq(collectionApps.collectionId, id))
      .orderBy(collectionApps.sortOrder, collectionApps.addedAt);

    return NextResponse.json({
      ...collection[0],
      apps: collectionWithApps,
    });
  } catch (error) {
    console.error("Error fetching collection:", error);
    return NextResponse.json(
      { error: "Failed to fetch collection" },
      { status: 500 }
    );
  }
}

// PUT - Update collection
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session: { user: { email: string } } | null = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, isPublic, color } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Collection name is required" },
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
    const existingCollection = await db
      .select()
      .from(collections)
      .where(and(eq(collections.id, id), eq(collections.userId, user[0].id)))
      .limit(1);

    if (!existingCollection.length) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    // Check if name conflicts with another collection
    if (name.trim() !== existingCollection[0].name) {
      const nameConflict = await db
        .select()
        .from(collections)
        .where(
          and(
            eq(collections.userId, user[0].id),
            eq(collections.name, name.trim()),
            eq(collections.id, id) // Exclude current collection
          )
        )
        .limit(1);

      if (nameConflict.length) {
        return NextResponse.json(
          { error: "A collection with this name already exists" },
          { status: 400 }
        );
      }
    }

    // Update collection
    const [updatedCollection] = await db
      .update(collections)
      .set({
        name: name.trim(),
        description: description?.trim() || null,
        isPublic: isPublic ?? existingCollection[0].isPublic,
        color: color || existingCollection[0].color,
        updatedAt: new Date(),
      })
      .where(eq(collections.id, id))
      .returning();

    return NextResponse.json(updatedCollection);
  } catch (error) {
    console.error("Error updating collection:", error);
    return NextResponse.json(
      { error: "Failed to update collection" },
      { status: 500 }
    );
  }
}

// DELETE collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session: { user: { email: string } } | null = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

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
    const existingCollection = await db
      .select()
      .from(collections)
      .where(and(eq(collections.id, id), eq(collections.userId, user[0].id)))
      .limit(1);

    if (!existingCollection.length) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    // Delete collection (cascade will delete collection_apps)
    await db.delete(collections).where(eq(collections.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return NextResponse.json(
      { error: "Failed to delete collection" },
      { status: 500 }
    );
  }
}
