CREATE TABLE "followers" (
	"follower_id" uuid NOT NULL,
	"following_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "followers_follower_id_following_id_pk" PRIMARY KEY("follower_id","following_id")
);
--> statement-breakpoint
ALTER TABLE "apps" ALTER COLUMN "identifier" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "followers" ADD CONSTRAINT "followers_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followers" ADD CONSTRAINT "followers_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_followers_follower_id" ON "followers" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX "idx_followers_following_id" ON "followers" USING btree ("following_id");--> statement-breakpoint
ALTER TABLE "apps" ADD CONSTRAINT "apps_identifier_unique" UNIQUE("identifier");