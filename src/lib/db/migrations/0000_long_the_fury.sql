CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"app_id" uuid NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"type" varchar(20) NOT NULL,
	"awarded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "app_tags" (
	"app_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "app_tags_app_id_tag_id_pk" PRIMARY KEY("app_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "apps" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"install_commands" text NOT NULL,
	"repo_url" varchar(255) NOT NULL,
	"view_count" bigint DEFAULT 0,
	"creator_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"app_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" varchar(50) NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_tag" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"bio" text,
	"social_links" jsonb,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_user_tag_unique" UNIQUE("user_tag"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "view_logs" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"app_id" uuid NOT NULL,
	"viewed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"app_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_user_app_vote" UNIQUE("user_id","app_id")
);
--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_tags" ADD CONSTRAINT "app_tags_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_tags" ADD CONSTRAINT "app_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apps" ADD CONSTRAINT "apps_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "view_logs" ADD CONSTRAINT "view_logs_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_achievements_app_id" ON "achievements" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "idx_achievements_type" ON "achievements" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_apps_creator_id" ON "apps" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "idx_apps_created_at" ON "apps" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_comments_user_id" ON "comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_comments_app_id" ON "comments" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "idx_users_user_tag" ON "users" USING btree ("user_tag");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_view_logs_app_id" ON "view_logs" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "idx_view_logs_viewed_at" ON "view_logs" USING btree ("viewed_at");--> statement-breakpoint
CREATE INDEX "idx_votes_user_id" ON "votes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_votes_app_id" ON "votes" USING btree ("app_id");