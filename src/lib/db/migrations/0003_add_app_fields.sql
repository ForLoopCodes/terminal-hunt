-- Migration: Add shortDescription and website fields to apps table
ALTER TABLE "apps" ADD COLUMN "short_description" VARCHAR(200);
ALTER TABLE "apps" ADD COLUMN "website" VARCHAR(255);
