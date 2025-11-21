import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	jsonb,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

// Campaigns Table
export const campaigns = pgTable("campaigns", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	startDate: timestamp("start_date").notNull(),
	endDate: timestamp("end_date").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Campaign = typeof campaigns.$inferSelect;

export const campaignsRelations = relations(campaigns, ({ many }) => ({
	warbands: many(warbands),
	warriors: many(warriors),
	matches: many(matches),
	events: many(events),
	casualties: many(casualties),
}));

// Warbands Table
export const warbands = pgTable("warbands", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	faction: text("faction").notNull(),
	rating: integer("rating").notNull(),
	treasury: integer("treasury").notNull(),
	campaignId: integer("campaign_id")
		.notNull()
		.references(() => campaigns.id),
	color: text("color"),
	icon: text("icon"),
	notes: text("notes"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Warband = typeof warbands.$inferSelect;

export const warbandsRelations = relations(warbands, ({ one, many }) => ({
	campaign: one(campaigns, {
		fields: [warbands.campaignId],
		references: [campaigns.id],
	}),
	warriors: many(warriors),
	matchParticipants: many(matchParticipants),
	teamMembers: many(teamMembers),
	placements: many(placements),
}));

// Warriors Table
export const warriors = pgTable("warriors", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	campaignId: integer("campaign_id")
		.notNull()
		.references(() => campaigns.id),
	warbandId: integer("warband_id")
		.notNull()
		.references(() => warbands.id),
	type: text("type").notNull().$type<"hero" | "henchman">(),
	experience: integer("experience").notNull(),
	kills: integer("kills").notNull(),
	injuriesCaused: integer("injuries_caused").notNull(),
	injuriesReceived: integer("injuries_received").notNull(),
	gamesPlayed: integer("games_played").notNull(),
	isAlive: boolean("is_alive").notNull(),
	deathDate: timestamp("death_date"),
	deathDescription: text("death_description"),
	equipment: jsonb("equipment").$type<string[]>(),
	skills: jsonb("skills").$type<string[]>(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Warrior = typeof warriors.$inferSelect;

export const warriorsRelations = relations(warriors, ({ one, many }) => ({
	campaign: one(campaigns, {
		fields: [warriors.campaignId],
		references: [campaigns.id],
	}),
	warband: one(warbands, {
		fields: [warriors.warbandId],
		references: [warbands.id],
	}),
	eventsAsWarrior: many(events, {
		relationName: "eventWarrior",
	}),
	eventsAsDefender: many(events, {
		relationName: "eventDefender",
	}),
}));

// Matches Table
export const matches = pgTable("matches", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	date: timestamp("date").notNull(),
	matchType: text("match_type")
		.notNull()
		.$type<"1v1" | "2v2" | "2v1" | "3v3" | "battle_royale">(),
	resultType: text("result_type")
		.notNull()
		.$type<"standard" | "team" | "placement">(),
	status: text("status").notNull().$type<"active" | "ended" | "scheduled">(),
	scenarioId: integer("scenario_id").notNull(),
	campaignId: integer("campaign_id")
		.notNull()
		.references(() => campaigns.id),
	winnerId: integer("winner_id").references(() => warbands.id),
	loserId: integer("loser_id").references(() => warbands.id),
	winningTeamId: integer("winning_team_id"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Match = typeof matches.$inferSelect;

export const matchesRelations = relations(matches, ({ one, many }) => ({
	winner: one(warbands, {
		fields: [matches.winnerId],
		references: [warbands.id],
		relationName: "matchWinner",
	}),
	loser: one(warbands, {
		fields: [matches.loserId],
		references: [warbands.id],
		relationName: "matchLoser",
	}),
	winningTeam: one(teams, {
		fields: [matches.winningTeamId],
		references: [teams.id],
	}),
	participants: many(matchParticipants),
	teams: many(teams),
	placements: many(placements),
	casualties: many(casualties),
	events: many(events),
	campaign: one(campaigns, {
		fields: [matches.campaignId],
		references: [campaigns.id],
	}),
}));

// Match Participants Table
export const matchParticipants = pgTable("match_participants", {
	id: serial("id").primaryKey(),
	matchId: integer("match_id")
		.notNull()
		.references(() => matches.id),
	warbandId: integer("warband_id")
		.notNull()
		.references(() => warbands.id),
});

export type MatchParticipant = typeof matchParticipants.$inferSelect;

export const matchParticipantsRelations = relations(
	matchParticipants,
	({ one }) => ({
		match: one(matches, {
			fields: [matchParticipants.matchId],
			references: [matches.id],
		}),
		warband: one(warbands, {
			fields: [matchParticipants.warbandId],
			references: [warbands.id],
		}),
	}),
);

export const events = pgTable("events", {
	id: serial("id").primaryKey(),
	campaignId: integer("campaign_id")
		.notNull()
		.references(() => campaigns.id),
	matchId: integer("match_id")
		.notNull()
		.references(() => matches.id),
	type: text("type").notNull().$type<"knock_down" | "moment">(),
	description: text("description"),
	timestamp: timestamp("timestamp").notNull().defaultNow(),
	warriorId: integer("warrior_id")
		.notNull()
		.references(() => warriors.id),
	defenderId: integer("defender_id").references(() => warriors.id),
});

export type Event = typeof events.$inferSelect;

export const eventsRelations = relations(events, ({ one }) => ({
	campaign: one(campaigns, {
		fields: [events.campaignId],
		references: [campaigns.id],
	}),
	match: one(matches, {
		fields: [events.matchId],
		references: [matches.id],
	}),
	warrior: one(warriors, {
		fields: [events.warriorId],
		references: [warriors.id],
		relationName: "eventWarrior",
	}),
	defender: one(warriors, {
		fields: [events.defenderId],
		references: [warriors.id],
		relationName: "eventDefender",
	}),
}));

// Teams Table
export const teams = pgTable("teams", {
	id: serial("id").primaryKey(),
	matchId: integer("match_id")
		.notNull()
		.references(() => matches.id),
	name: text("name"),
	isWinner: boolean("is_winner").notNull(),
});

export type Team = typeof teams.$inferSelect;

export const teamsRelations = relations(teams, ({ one, many }) => ({
	match: one(matches, {
		fields: [teams.matchId],
		references: [matches.id],
	}),
	members: many(teamMembers),
}));

// Team Members Table
export const teamMembers = pgTable("team_members", {
	id: serial("id").primaryKey(),
	teamId: integer("team_id")
		.notNull()
		.references(() => teams.id),
	warbandId: integer("warband_id")
		.notNull()
		.references(() => warbands.id),
});

export type TeamMember = typeof teamMembers.$inferSelect;

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
	team: one(teams, {
		fields: [teamMembers.teamId],
		references: [teams.id],
	}),
	warband: one(warbands, {
		fields: [teamMembers.warbandId],
		references: [warbands.id],
	}),
}));

// Placements Table
export const placements = pgTable("placements", {
	id: serial("id").primaryKey(),
	matchId: integer("match_id")
		.notNull()
		.references(() => matches.id),
	warbandId: integer("warband_id")
		.notNull()
		.references(() => warbands.id),
	position: integer("position").notNull(),
});

export type Placement = typeof placements.$inferSelect;

export const placementsRelations = relations(placements, ({ one }) => ({
	match: one(matches, {
		fields: [placements.matchId],
		references: [matches.id],
	}),
	warband: one(warbands, {
		fields: [placements.warbandId],
		references: [warbands.id],
	}),
}));

// Casualties Table
export const casualties = pgTable("casualties", {
	id: serial("id").primaryKey(),
	campaignId: integer("campaign_id")
		.notNull()
		.references(() => campaigns.id),
	matchId: integer("match_id")
		.notNull()
		.references(() => matches.id),
	victimWarriorId: integer("victim_warrior_id").notNull(),
	victimWarbandId: integer("victim_warband_id").notNull(),
	killerWarriorId: integer("killer_warrior_id").notNull(),
	killerWarbandId: integer("killer_warband_id").notNull(),
	type: text("type")
		.notNull()
		.$type<"killed" | "injured" | "stunned" | "escaped">(),
	description: text("description"),
	timestamp: timestamp("timestamp").notNull(),
});

export type Casualty = typeof casualties.$inferSelect;

export const casualtiesRelations = relations(casualties, ({ one }) => ({
	campaign: one(campaigns, {
		fields: [casualties.campaignId],
		references: [campaigns.id],
	}),
	match: one(matches, {
		fields: [casualties.matchId],
		references: [matches.id],
	}),
}));
