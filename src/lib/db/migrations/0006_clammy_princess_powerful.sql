CREATE TABLE "admins" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(20) DEFAULT 'admin',
	"permissions" jsonb,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "admins_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"reporter_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"app_id" uuid,
	"comment_id" uuid,
	"user_id" uuid,
	"status" varchar(20) DEFAULT 'pending',
	"admin_notes" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "suspended" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_admins_user_id" ON "admins" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_reports_reporter_id" ON "reports" USING btree ("reporter_id");--> statement-breakpoint
CREATE INDEX "idx_reports_app_id" ON "reports" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "idx_reports_comment_id" ON "reports" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "idx_reports_user_id" ON "reports" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_reports_status" ON "reports" USING btree ("status");