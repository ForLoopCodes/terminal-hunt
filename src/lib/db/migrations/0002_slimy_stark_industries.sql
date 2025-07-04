CREATE TABLE "collection_apps" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"collection_id" uuid NOT NULL,
	"app_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0,
	"added_at" timestamp DEFAULT now(),
	"notes" text,
	CONSTRAINT "unique_collection_app" UNIQUE("collection_id","app_id")
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT false,
	"color" varchar(20) DEFAULT '#3b82f6',
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_user_collection_name" UNIQUE("user_id","name")
);
--> statement-breakpoint
ALTER TABLE "collection_apps" ADD CONSTRAINT "collection_apps_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_apps" ADD CONSTRAINT "collection_apps_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_collection_apps_collection_id" ON "collection_apps" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "idx_collection_apps_app_id" ON "collection_apps" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "idx_collections_user_id" ON "collections" USING btree ("user_id");