import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { collections, users, collectionApps, apps } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

// GET user's collections
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user from database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's collections with app counts
    const userCollections = await db
      .select({
        id: collections.id,
        name: collections.name,
        description: collections.description,
        isPublic: collections.isPublic,
        color: collections.color,
        sortOrder: collections.sortOrder,
        createdAt: collections.createdAt,
        updatedAt: collections.updatedAt,
      })
      .from(collections)
      .where(eq(collections.userId, user[0].id))
      .orderBy(collections.sortOrder, collections.createdAt);

    // Get app counts for each collection
    const collectionsWithCounts = await Promise.all(
      userCollections.map(async (collection) => {
        const appCount = await db
          .select({ count: collectionApps.id })
          .from(collectionApps)
          .where(eq(collectionApps.collectionId, collection.id));

        return {
          ...collection,
          appCount: appCount.length,
        };
      })
    );

    return NextResponse.json({ collections: collectionsWithCounts });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { error: "Failed to fetch collections" },
      { status: 500 }
    );
  }
}

// POST - Create new collection
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, isPublic = false, color = "#3b82f6" } = body;

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

    // Check if collection name already exists for this user
    const existingCollection = await db
      .select()
      .from(collections)
      .where(
        and(
          eq(collections.userId, user[0].id),
          eq(collections.name, name.trim())
        )
      )
      .limit(1);

    if (existingCollection.length) {
      return NextResponse.json(
        { error: "A collection with this name already exists" },
        { status: 400 }
      );
    }

    // Get the next sort order
    const lastCollection = await db
      .select({ sortOrder: collections.sortOrder })
      .from(collections)
      .where(eq(collections.userId, user[0].id))
      .orderBy(desc(collections.sortOrder))
      .limit(1);

    const nextSortOrder = lastCollection.length
      ? (lastCollection[0].sortOrder || 0) + 1
      : 0;

    // Create collection
    const [newCollection] = await db
      .insert(collections)
      .values({
        userId: user[0].id,
        name: name.trim(),
        description: description?.trim() || null,
        isPublic,
        color,
        sortOrder: nextSortOrder,
      })
      .returning();

    return NextResponse.json(
      { ...newCollection, appCount: 0 },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating collection:", error);
    return NextResponse.json(
      { error: "Failed to create collection" },
      { status: 500 }
    );
  }
}
