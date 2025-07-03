import { db } from "../src/lib/db";
import { tags } from "../src/lib/db/schema";

async function seedData() {
  console.log("Seeding initial data...");

  // Add default tags
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

  try {
    // Check if tags already exist
    const existingTags = await db.select().from(tags);

    if (existingTags.length === 0) {
      await db.insert(tags).values(defaultTags);
      console.log("✅ Default tags seeded successfully");
    } else {
      console.log("ℹ️ Tags already exist, skipping seeding");
    }
  } catch (error) {
    console.error("❌ Error seeding data:", error);
  }
}

seedData().catch(console.error);
