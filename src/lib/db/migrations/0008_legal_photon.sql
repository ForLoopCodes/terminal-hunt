ALTER TABLE "apps" DROP CONSTRAINT "apps_identifier_unique";--> statement-breakpoint
ALTER TABLE "apps" ALTER COLUMN "identifier" DROP NOT NULL;