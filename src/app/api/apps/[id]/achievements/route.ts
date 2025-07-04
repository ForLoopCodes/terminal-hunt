import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { achievements, apps, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const appAchievements = await db
      .select({
        id: achievements.id,
        title: achievements.title,
        description: achievements.description,
        type: achievements.type,
        criteria: achievements.criteria,
        iconUrl: achievements.iconUrl,
        badgeColor: achievements.badgeColor,
        isActive: achievements.isActive,
        awardedAt: achievements.awardedAt,
        createdAt: achievements.createdAt,
      })
      .from(achievements)
      .where(and(eq(achievements.appId, id), eq(achievements.isActive, true)))
      .orderBy(achievements.awardedAt);

    return NextResponse.json({ achievements: appAchievements });
  } catch (error) {
    console.error("Error fetching app achievements:", error);
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}

export async function POST(
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
    const { title, description, type, criteria, iconUrl, badgeColor } = body;

    // Check if the user owns this app
    const appOwner = await db
      .select({
        creatorEmail: users.email,
      })
      .from(apps)
      .leftJoin(users, eq(apps.creatorId, users.id))
      .where(eq(apps.id, id))
      .limit(1);

    if (!appOwner.length) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    if (appOwner[0].creatorEmail !== session.user.email) {
      return NextResponse.json(
        {
          error:
            "Forbidden: You can only manage achievements for your own apps",
        },
        { status: 403 }
      );
    }

    // Create achievement
    const [newAchievement] = await db
      .insert(achievements)
      .values({
        appId: id,
        title,
        description,
        type,
        criteria,
        iconUrl,
        badgeColor: badgeColor || "#3b82f6",
      })
      .returning();

    return NextResponse.json(newAchievement, { status: 201 });
  } catch (error) {
    console.error("Error creating achievement:", error);
    return NextResponse.json(
      { error: "Failed to create achievement" },
      { status: 500 }
    );
  }
}
