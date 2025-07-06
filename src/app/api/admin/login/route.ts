import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, admins } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const foundUser = user[0];

    // Check if user is suspended
    if (foundUser.suspended) {
      return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    }

    // Verify password
    if (!foundUser.passwordHash) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(
      password,
      foundUser.passwordHash
    );
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminRecord = await db
      .select()
      .from(admins)
      .where(eq(admins.userId, foundUser.id))
      .limit(1);

    if (adminRecord.length === 0) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Return success with admin info
    return NextResponse.json({
      message: "Login successful",
      user: {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        userTag: foundUser.userTag,
        isAdmin: true,
        adminRole: adminRecord[0].role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
