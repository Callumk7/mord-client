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
import { INJURY_TYPES } from "~/types/injuries";

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
	customNewsItems: many(customNewsItems),
}));

// Warbands Table
export const warbands = pgTable("warbands", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	faction: text("faction").notNull(),
	rating: integer("rating").notNull(),
	experience: integer("experience").notNull(),
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
	stateChanges: many(warbandStateChanges),
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
	gamesPlayed: integer("games_played").notNull(),
	isLeader: boolean("is_leader").notNull().default(false),
	isAlive: boolean("is_alive").notNull(),
	deathDate: timestamp("death_date"),
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
	status: text("status")
		.notNull()
		.$type<"active" | "ended" | "scheduled" | "resolved">(),
	campaignId: integer("campaign_id")
		.notNull()
		.references(() => campaigns.id),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Match = typeof matches.$inferSelect;
export type CampaignMatch = Match & {
	participants: (MatchParticipant & { warband: Warband })[];
	events: (Event & { warrior: Warrior; defender: Warrior | null })[];
};

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

// Warband State Changes Table
export const warbandStateChanges = pgTable("warband_state_changes", {
	id: serial("id").primaryKey(),
	warbandId: integer("warband_id")
		.notNull()
		.references(() => warbands.id),
	matchId: integer("match_id")
		.notNull()
		.references(() => matches.id),

	// Deltas (changes), not absolute values
	treasuryDelta: integer("treasury_delta").default(0).notNull(),
	experienceDelta: integer("experience_delta").default(0).notNull(),
	ratingDelta: integer("rating_delta").default(0).notNull(),

	// Snapshot of state AFTER this change (for verification)
	treasuryAfter: integer("treasury_after").notNull(),
	experienceAfter: integer("experience_after").notNull(),
	ratingAfter: integer("rating_after").notNull(),

	// Context
	changeType: text("change_type")
		.notNull()
		.$type<
			| "post_match_gold"
			| "post_match_experience"
			| "rating_update"
			| "manual_adjustment"
		>(),
	description: text("description"),

	timestamp: timestamp("timestamp").notNull().defaultNow(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type WarbandStateChange = typeof warbandStateChanges.$inferSelect;
export type NewWarbandStateChange = typeof warbandStateChanges.$inferInsert;

export const warbandStateChangesRelations = relations(
	warbandStateChanges,
	({ one }) => ({
		warband: one(warbands, {
			fields: [warbandStateChanges.warbandId],
			references: [warbands.id],
		}),
		match: one(matches, {
			fields: [warbandStateChanges.matchId],
			references: [matches.id],
		}),
	}),
);

export const injuryEnum = pgEnum("injury_type", INJURY_TYPES);

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

export const customNewsItems = pgTable("custom_news_items", {
	id: serial("id").primaryKey(),
	campaignId: integer("campaign_id")
		.notNull()
		.references(() => campaigns.id),
	content: text("content").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type CustomNewsItem = typeof customNewsItems.$inferSelect;
export type NewCustomNewsItem = typeof customNewsItems.$inferInsert;

export const customNewsItemsRelations = relations(customNewsItems, ({ one }) => ({
	campaign: one(campaigns, {
		fields: [customNewsItems.campaignId],
		references: [campaigns.id],
	}),
}));
