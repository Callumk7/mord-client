import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	jsonb,
	pgEnum,
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
export type WarbandWithWarriors = Warband & {
	warriors: Warrior[];
};

export const warbandsRelations = relations(warbands, ({ one, many }) => ({
	campaign: one(campaigns, {
		fields: [warbands.campaignId],
		references: [campaigns.id],
	}),
	warriors: many(warriors),
	matchParticipants: many(matchParticipants),
	wins: many(matchWinners),
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
	isLeader: boolean("is_leader").notNull().default(false),
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
	matchType: text("match_type").notNull().$type<"1v1" | "multiplayer">(),
	status: text("status")
		.notNull()
		.$type<"active" | "ended" | "scheduled" | "resolved">(),
	scenarioId: integer("scenario_id").notNull(),
	campaignId: integer("campaign_id")
		.notNull()
		.references(() => campaigns.id),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Match = typeof matches.$inferSelect;

export const matchesRelations = relations(matches, ({ one, many }) => ({
	winners: many(matchWinners),
	participants: many(matchParticipants),
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

export const matchWinners = pgTable("match_winners", {
	id: serial("id").primaryKey(),
	matchId: integer("match_id")
		.notNull()
		.references(() => matches.id),
	warbandId: integer("warband_id")
		.notNull()
		.references(() => warbands.id),
});

export type MatchWinner = typeof matchWinners.$inferSelect;

export const matchWinnersRelations = relations(matchWinners, ({ one }) => ({
	match: one(matches, {
		fields: [matchWinners.matchId],
		references: [matches.id],
	}),
	warband: one(warbands, {
		fields: [matchWinners.warbandId],
		references: [warbands.id],
	}),
}));

export const injuryEnum = pgEnum("injury_type", [
	"dead",
	"multiple",
	"leg_wound",
	"arm_wound",
	"madness",
	"smashed_leg",
	"chest_wound",
	"blinded_in_one_eye",
	"old_battle_wound",
	"nervous",
	"hand_injury",
	"deep_wound",
	"robbed",
	"full_recovery",
	"bitter_emnity",
	"captured",
	"hardened",
	"horrible_scars",
	"sold_to_pits",
	"survive_against_odds",
]);

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
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	resolved: boolean("resolved").notNull().default(false),
	injuryType: injuryEnum("injury_type"),
	death: boolean("death").notNull().default(false),
	injury: boolean("injury").notNull().default(false),
});

export type Event = typeof events.$inferSelect;
export type EventWithParticipants = Event & {
	warrior: Warrior;
	defender: Warrior | null;
};

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
