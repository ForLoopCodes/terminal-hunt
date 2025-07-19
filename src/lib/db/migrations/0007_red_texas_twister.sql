ALTER TABLE "apps" ADD COLUMN "ascii_art_alignment" varchar(10);--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "primary_install_command" varchar(255);--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "makefile" text;--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "identifier" varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE "apps" ADD CONSTRAINT "apps_identifier_unique" UNIQUE("identifier");