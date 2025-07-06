import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { db } from "@/lib/db";
import { admins } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required", isAdmin: false },
        { status: 401 }
      );
    }

    // Check if user is an admin
    const adminRecord = await db
      .select()
      .from(admins)
      .where(eq(admins.userId, session.user.id))
      .limit(1);

    const isAdmin = adminRecord.length > 0;
    const adminRole = isAdmin ? adminRecord[0].role : null;

    return NextResponse.json({
      isAdmin,
      adminRole,
      userId: session.user.id,
    });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json(
      { error: "Internal server error", isAdmin: false },
      { status: 500 }
    );
  }
}
