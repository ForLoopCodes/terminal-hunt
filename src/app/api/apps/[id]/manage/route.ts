import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { apps, users, appTags } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      description,
      installCommands,
      repoUrl,
      tagIds,
      isPublic,
      licenseType,
    } = body;

    // Get the app to check ownership
    const existingApp = await db
      .select({
        id: apps.id,
        creatorId: apps.creatorId,
        creatorEmail: users.email,
      })
      .from(apps)
      .leftJoin(users, eq(apps.creatorId, users.id))
      .where(eq(apps.id, id))
      .limit(1);

    if (!existingApp.length) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    // Check if the user owns this app
    if (existingApp[0].creatorEmail !== session.user.email) {
      return NextResponse.json(
        { error: "Forbidden: You can only edit your own apps" },
        { status: 403 }
      );
    }

    // Update the app
    const [updatedApp] = await db
      .update(apps)
      .set({
        name,
        description,
        installCommands,
        repoUrl,
        isPublic: isPublic !== undefined ? isPublic : true,
        licenseType,
        updatedAt: new Date(),
      })
      .where(eq(apps.id, id))
      .returning();

    // Update tags if provided
    if (tagIds && Array.isArray(tagIds)) {
      // Remove existing tags
      await db.delete(appTags).where(eq(appTags.appId, id));

      // Add new tags
      if (tagIds.length > 0) {
        const tagRelations = tagIds.map((tagId: string) => ({
          appId: id,
          tagId,
        }));
        await db.insert(appTags).values(tagRelations);
      }
    }

    return NextResponse.json(updatedApp);
  } catch (error) {
    console.error("Error updating app:", error);
    return NextResponse.json(
      { error: "Failed to update app" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Get the app to check ownership
    const existingApp = await db
      .select({
        id: apps.id,
        creatorId: apps.creatorId,
        creatorEmail: users.email,
      })
      .from(apps)
      .leftJoin(users, eq(apps.creatorId, users.id))
      .where(eq(apps.id, id))
      .limit(1);

    if (!existingApp.length) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    // Check if the user owns this app
    if (existingApp[0].creatorEmail !== session.user.email) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own apps" },
        { status: 403 }
      );
    }

    // Delete the app (cascade will handle related records)
    await db.delete(apps).where(eq(apps.id, id));

    return NextResponse.json({
      success: true,
      message: "App deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting app:", error);
    return NextResponse.json(
      { error: "Failed to delete app" },
      { status: 500 }
    );
  }
}
