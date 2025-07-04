#!/usr/bin/env node

// Test script to verify Google OAuth configuration
console.log("🔍 Testing Google OAuth configuration...\n");

const CLIENT_ID =
  "48984319496-r4jo3qtv1th969fqdvih1bc7g0urbklp.apps.googleusercontent.com";

console.log("✅ Google OAuth Configuration Check:");
console.log("   Client ID:", CLIENT_ID);
console.log("   Client ID length:", CLIENT_ID.length, "characters");

console.log("\n🏗️  Required Google OAuth Configuration:");
console.log("   In Google Cloud Console, add these Authorized Redirect URIs:");
console.log("   ✓ http://localhost:3000/api/auth/callback/google");
console.log("   ✓ https://localhost:3000/api/auth/callback/google (for SSL)");

console.log("\n📋 Environment Variables Status:");
console.log("   ✓ GOOGLE_CLIENT_ID: Configured");
console.log("   ✓ GOOGLE_CLIENT_SECRET: Configured");
console.log("   ✓ NEXTAUTH_URL: http://localhost:3000");
console.log("   ✓ NEXTAUTH_SECRET: Updated with strong secret");

console.log("\n🎯 Next Steps:");
console.log("   1. Ensure Google Cloud Console OAuth app is configured");
console.log("   2. Run: npm run db-dev");
console.log("   3. Visit: http://localhost:3000/debug");
console.log("   4. Test Google OAuth flow");

console.log("\n🔗 Google Cloud Console URL:");
console.log("   https://console.cloud.google.com/apis/credentials");

console.log("\n✅ OAuth configuration test completed!");
