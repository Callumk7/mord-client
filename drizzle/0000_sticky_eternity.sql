CREATE TABLE "campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "casualties" (
	"id" serial PRIMARY KEY NOT NULL,
	"match_id" integer NOT NULL,
	"victim_warrior_id" integer NOT NULL,
	"victim_warband_id" integer NOT NULL,
	"killer_warrior_id" integer NOT NULL,
	"killer_warband_id" integer NOT NULL,
	"type" text NOT NULL,
	"description" text,
	"timestamp" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "match_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"match_id" integer NOT NULL,
	"warband_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"match_number" integer NOT NULL,
	"date" timestamp NOT NULL,
	"match_type" text NOT NULL,
	"result_type" text NOT NULL,
	"scenario_id" integer NOT NULL,
	"winner_id" integer,
	"loser_id" integer,
	"winning_team_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "placements" (
	"id" serial PRIMARY KEY NOT NULL,
	"match_id" integer NOT NULL,
	"warband_id" integer NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"warband_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"match_id" integer NOT NULL,
	"name" text,
	"is_winner" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warbands" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"faction" text NOT NULL,
	"rating" integer NOT NULL,
	"treasury" integer NOT NULL,
	"campaign_id" integer,
	"color" text,
	"icon" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warriors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"warband_id" integer NOT NULL,
	"type" text NOT NULL,
	"experience" integer NOT NULL,
	"kills" integer NOT NULL,
	"injuries_caused" integer NOT NULL,
	"injuries_received" integer NOT NULL,
	"games_played" integer NOT NULL,
	"is_alive" boolean NOT NULL,
	"death_date" timestamp,
	"death_description" text,
	"equipment" jsonb,
	"skills" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "casualties" ADD CONSTRAINT "casualties_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_participants" ADD CONSTRAINT "match_participants_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_participants" ADD CONSTRAINT "match_participants_warband_id_warbands_id_fk" FOREIGN KEY ("warband_id") REFERENCES "public"."warbands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_winner_id_warbands_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."warbands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_loser_id_warbands_id_fk" FOREIGN KEY ("loser_id") REFERENCES "public"."warbands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "placements" ADD CONSTRAINT "placements_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "placements" ADD CONSTRAINT "placements_warband_id_warbands_id_fk" FOREIGN KEY ("warband_id") REFERENCES "public"."warbands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_warband_id_warbands_id_fk" FOREIGN KEY ("warband_id") REFERENCES "public"."warbands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warbands" ADD CONSTRAINT "warbands_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warriors" ADD CONSTRAINT "warriors_warband_id_warbands_id_fk" FOREIGN KEY ("warband_id") REFERENCES "public"."warbands"("id") ON DELETE no action ON UPDATE no action;