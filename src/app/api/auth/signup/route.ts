import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // Validate request origin
    const origin = request.headers.get("origin");
    const allowedOrigins = [
      "http://localhost:3000",
      "https://localhost:3000",
      process.env.NEXTAUTH_URL,
    ].filter(Boolean);

    if (origin && !allowedOrigins.includes(origin)) {
      console.log(`Blocked request from unauthorized origin: ${origin}`);
      return NextResponse.json(
        { error: "Unauthorized origin" },
        { status: 403 }
      );
    }

    // Validate Content-Type
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { userTag, name, email, password } = body;

    // Validate required fields
    if (!userTag || !name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate userTag format (alphanumeric and underscores only)
    const userTagRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!userTagRegex.test(userTag)) {
      return NextResponse.json(
        {
          error:
            "User tag must be 3-30 characters, alphanumeric and underscores only",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.userTag, userTag)))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Email or user tag already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        userTag,
        name,
        email,
        passwordHash,
      })
      .returning({
        id: users.id,
        userTag: users.userTag,
        name: users.name,
        email: users.email,
      });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
