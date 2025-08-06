import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import {
  users,
  apps,
  comments,
  achievements,
  votes,
  followers,
} from "@/lib/db/schema";
import { and, count, eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userTag: string }> }
) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  try {
    const { userTag } = await params;

    // Get user profile
    const user = await db
      .select({
        id: users.id,
        userTag: users.userTag,
        name: users.name,
        bio: users.bio,
        socialLinks: users.socialLinks,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.userTag, userTag))
      .limit(1);

    if (!user.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userProfile = user[0];

    // Get follower and following counts
    const followersCount = await db
      .select({ count: count() })
      .from(followers)
      .where(eq(followers.followingId, userProfile.id));

    const followingCount = await db
      .select({ count: count() })
      .from(followers)
      .where(eq(followers.followerId, userProfile.id));

    // Check if the current user is following this user
    let isFollowing = false;
    if (currentUserId) {
      const result = await db
        .select()
        .from(followers)
        .where(
          and(
            eq(followers.followerId, currentUserId),
            eq(followers.followingId, userProfile.id)
          )
        )
        .limit(1);
      isFollowing = result.length > 0;
    }

    // Get user's submitted apps
    const userApps = await db
      .select({
        id: apps.id,
        name: apps.name,
        shortDescription: apps.shortDescription,
        description: apps.description,
        website: apps.website,
        asciiArt: apps.asciiArt,
        viewCount: apps.viewCount,
        createdAt: apps.createdAt,
      })
      .from(apps)
      .where(eq(apps.creatorId, userProfile.id));

    // Get vote counts for each app
    const appsWithVotes = await Promise.all(
      userApps.map(async (app) => {
        const voteCount = await db
          .select()
          .from(votes)
          .where(eq(votes.appId, app.id));

        return {
          ...app,
          voteCount: voteCount.length,
        };
      })
    );

    // Get user's comments
    const userComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        appId: comments.appId,
        appName: apps.name,
      })
      .from(comments)
      .leftJoin(apps, eq(comments.appId, apps.id))
      .where(eq(comments.userId, userProfile.id));

    // Get achievements for user's apps
    const userAchievements = await db
      .select({
        id: achievements.id,
        title: achievements.title,
        description: achievements.description,
        type: achievements.type,
        awardedAt: achievements.awardedAt,
        appId: achievements.appId,
        appName: apps.name,
      })
      .from(achievements)
      .leftJoin(apps, eq(achievements.appId, apps.id))
      .where(eq(apps.creatorId, userProfile.id));

    return NextResponse.json({
      ...userProfile,
      apps: appsWithVotes,
      comments: userComments,
      achievements: userAchievements,
      followersCount: followersCount[0].count,
      followingCount: followingCount[0].count,
      isFollowing,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userTag: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userTag } = params;
    const body = await request.json();
    const { name, bio, socialLinks, newUserTag } = body;

    // Check if the user is updating their own profile
    if ((session as any).user.userTag !== userTag) {
      return NextResponse.json(
        { error: "Forbidden: You can only update your own profile" },
        { status: 403 }
      );
    }

    // If updating userTag, check if the new one is available
    if (newUserTag && newUserTag !== userTag) {
      // Validate new userTag format
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(newUserTag)) {
        return NextResponse.json(
          {
            error:
              "User tag must be 3-30 characters, alphanumeric and underscores only",
          },
          { status: 400 }
        );
      }

      // Check if new userTag already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.userTag, newUserTag))
        .limit(1);

      if (existingUser.length > 0) {
        return NextResponse.json(
          { error: "User tag already taken" },
          { status: 409 }
        );
      }
    }

    // Update user profile
    const updateData: any = {
      name,
      bio,
      socialLinks,
      updatedAt: new Date(),
    };

    // Add userTag to update if provided
    if (newUserTag && newUserTag !== userTag) {
      updateData.userTag = newUserTag;
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.userTag, userTag))
      .returning({
        id: users.id,
        userTag: users.userTag,
        name: users.name,
        bio: users.bio,
        socialLinks: users.socialLinks,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}
