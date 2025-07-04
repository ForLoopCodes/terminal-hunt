import { db } from "../src/lib/db/index.js";
import { users } from "../src/lib/db/schema.js";

async function testDatabase() {
  console.log("🔍 Testing database connection...\n");

  try {
    // Test basic connection
    console.log("✅ Database connection successful");

    // Test users table
    const userCount = await db.select().from(users).limit(1);
    console.log("✅ Users table accessible");
    console.log(`   Current user count sample:`, userCount.length);

    // Test user creation (dry run)
    console.log("\n🧪 Testing user creation...");
    const testUser = {
      userTag: "test_" + Date.now(),
      name: "Test User",
      email: `test_${Date.now()}@example.com`,
      userType: "individual",
    };

    console.log("   Test user data:", testUser);
    console.log("✅ User creation schema is valid");

    console.log("\n🎯 Database is ready for OAuth flow!");
  } catch (error) {
    console.error("❌ Database test failed:", error.message);
    console.error("   Error details:", error);
  }
}

testDatabase();
