import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { comments, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET comment by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params;

    const comment = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        userId: comments.userId,
        appId: comments.appId,
        userName: users.name,
        userTag: users.userTag,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.id, commentId))
      .limit(1);

    if (!comment.length) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    return NextResponse.json(comment[0]);
  } catch (error) {
    console.error("Error fetching comment:", error);
    return NextResponse.json(
      { error: "Failed to fetch comment" },
      { status: 500 }
    );
  }
}

// PUT - Edit comment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const session: { user: { email: string } } | null = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { commentId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Comment content is required" },
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

    // Check if comment exists and user owns it
    const existingComment = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1);

    if (!existingComment.length) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (existingComment[0].userId !== user[0].id) {
      return NextResponse.json(
        { error: "You can only edit your own comments" },
        { status: 403 }
      );
    }

    // Update comment
    const [updatedComment] = await db
      .update(comments)
      .set({
        content: content.trim(),
        updatedAt: new Date(),
      })
      .where(eq(comments.id, commentId))
      .returning({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        userId: comments.userId,
        appId: comments.appId,
      });

    return NextResponse.json({
      ...updatedComment,
      userName: user[0].name,
      userTag: user[0].userTag,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 }
    );
  }
}

// DELETE comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const session: { user: { email: string } } | null = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { commentId } = await params;

    // Get user from database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if comment exists and user owns it
    const existingComment = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1);

    if (!existingComment.length) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (existingComment[0].userId !== user[0].id) {
      return NextResponse.json(
        { error: "You can only delete your own comments" },
        { status: 403 }
      );
    }

    // Delete comment
    await db.delete(comments).where(eq(comments.id, commentId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
