
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { followers, users } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  req: Request,
  { params }: { params: { userTag: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const followerId = session.user.id;
  const { userTag } = params;

  try {
    const userToFollow = await db.query.users.findFirst({
      where: eq(users.userTag, userTag),
    });

    if (!userToFollow) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (followerId === userToFollow.id) {
      return NextResponse.json(
        { error: "You cannot follow yourself" },
        { status: 400 }
      );
    }

    await db
      .insert(followers)
      .values({
        followerId: followerId,
        followingId: userToFollow.id,
      })
      .onConflictDoNothing();

    return NextResponse.json({ message: "Successfully followed user" });
  } catch (error) {
    console.error("Error following user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { userTag: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const followerId = session.user.id;
  const { userTag } = params;

  try {
    const userToUnfollow = await db.query.users.findFirst({
      where: eq(users.userTag, userTag),
    });

    if (!userToUnfollow) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await db
      .delete(followers)
      .where(
        and(
          eq(followers.followerId, followerId),
          eq(followers.followingId, userToUnfollow.id)
        )
      );

    return NextResponse.json({ message: "Successfully unfollowed user" });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
