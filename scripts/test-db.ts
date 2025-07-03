import { Client } from "pg";

// Direct connection string (you can replace this with your actual connection string)
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.gertouvscpikxpnhpgdl:terminal-hunt@aws-0-us-east-2.pooler.supabase.com:5432/postgres";

async function testConnection() {
  const client = new Client({
    connectionString,
  });

  try {
    console.log("🔄 Connecting to database...");
    await client.connect();
    console.log("✅ Database connection successful!");

    // Check if uuid extension exists
    console.log("🔄 Checking UUID extension...");
    const result = await client.query(
      "SELECT * FROM pg_extension WHERE extname = 'uuid-ossp'"
    );
    if (result.rows.length === 0) {
      console.log("🔄 Installing uuid-ossp extension...");
      await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      console.log("✅ UUID extension installed");
    } else {
      console.log("✅ UUID extension already exists");
    }

    // List existing tables
    console.log("🔄 Checking existing tables...");
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log("📋 Existing tables:");
    if (tables.rows.length === 0) {
      console.log("   (No tables found - database is empty)");
    } else {
      tables.rows.forEach((row) => console.log(`   - ${row.table_name}`));
    }

    await client.end();
    console.log("✅ Database test completed successfully!");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

testConnection();
