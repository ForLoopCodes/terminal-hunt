import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tags, appTags } from "@/lib/db/schema";
import { sql, desc, like, ilike } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "20");

    // If search query provided, filter by name
    if (search && search.trim()) {
      const searchResults = await db
        .select({
          id: tags.id,
          name: tags.name,
          count: sql<number>`count(${appTags.tagId})`.as("count"),
        })
        .from(tags)
        .leftJoin(appTags, sql`${tags.id} = ${appTags.tagId}`)
        .where(ilike(tags.name, `%${search.trim()}%`))
        .groupBy(tags.id, tags.name)
        .orderBy(desc(sql`count(${appTags.tagId})`), tags.name)
        .limit(limit);

      return NextResponse.json({ tags: searchResults });
    }

    // Default query without search
    const allTags = await db
      .select({
        id: tags.id,
        name: tags.name,
        count: sql<number>`count(${appTags.tagId})`.as("count"),
      })
      .from(tags)
      .leftJoin(appTags, sql`${tags.id} = ${appTags.tagId}`)
      .groupBy(tags.id, tags.name)
      .orderBy(desc(sql`count(${appTags.tagId})`), tags.name)
      .limit(limit);

    // If no tags exist, create default ones
    if (allTags.length === 0) {
      console.log("No tags found, creating default tags...");
      const defaultTags = [
        { name: "CLI Tool" },
        { name: "Productivity" },
        { name: "File Manager" },
        { name: "Network" },
        { name: "Development" },
        { name: "System Admin" },
        { name: "Text Editor" },
        { name: "Git" },
        { name: "Monitoring" },
        { name: "Database" },
        { name: "API" },
        { name: "Automation" },
        { name: "Security" },
        { name: "Documentation" },
        { name: "Testing" },
      ];

      await db.insert(tags).values(defaultTags);

      // Re-fetch with the new tags
      const newTags = await db
        .select({
          id: tags.id,
          name: tags.name,
          count: sql<number>`0`.as("count"),
        })
        .from(tags)
        .orderBy(tags.name)
        .limit(limit);

      console.log("Created", newTags.length, "default tags");
      return NextResponse.json({ tags: newTags });
    }

    return NextResponse.json({ tags: allTags });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Tag name is required" },
        { status: 400 }
      );
    }

    const tagName = name.trim();

    // Check if tag already exists (case insensitive)
    const existingTag = await db
      .select()
      .from(tags)
      .where(ilike(tags.name, tagName))
      .limit(1);

    if (existingTag.length > 0) {
      return NextResponse.json(
        { error: "Tag already exists" },
        { status: 409 }
      );
    }

    // Create new tag
    const [newTag] = await db
      .insert(tags)
      .values({ name: tagName })
      .returning();

    return NextResponse.json({ tag: newTag }, { status: 201 });
  } catch (error) {
    console.error("Error creating tag:", error);
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    );
  }
}
