CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"match_id" integer NOT NULL,
	"type" text NOT NULL,
	"description" text,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"warrior_id" integer NOT NULL,
	"defender_id" integer
);
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_warrior_id_warriors_id_fk" FOREIGN KEY ("warrior_id") REFERENCES "public"."warriors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_defender_id_warriors_id_fk" FOREIGN KEY ("defender_id") REFERENCES "public"."warriors"("id") ON DELETE no action ON UPDATE no action;