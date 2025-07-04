ALTER TABLE "achievements" ALTER COLUMN "type" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "criteria" jsonb;--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "icon_url" varchar(255);--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "badge_color" varchar(20) DEFAULT '#3b82f6';--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "is_public" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "is_featured" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "status" varchar(20) DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "license_type" varchar(50);--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "stars" bigint DEFAULT 0;--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "last_updated" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "user_type" varchar(20) DEFAULT 'individual' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "company_name" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "website" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "github_username" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "twitter_handle" varchar(100);--> statement-breakpoint
CREATE INDEX "idx_achievements_awarded_at" ON "achievements" USING btree ("awarded_at");