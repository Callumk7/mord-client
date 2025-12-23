import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import z from "zod";
import { db } from "~/db";
import {
	matches,
	matchParticipants,
	matchWinners,
	warriors,
} from "~/db/schema";

// Query Key Factory
export const matchKeys = {
	all: ["matches"] as const,
	lists: () => [...matchKeys.all, "list"] as const,
	list: (campaignId: number) => [...matchKeys.lists(), { campaignId }] as const,
	warbands: (matchId: number) => [...matchKeys.lists(), { matchId }] as const,
	details: () => [...matchKeys.all, "detail"] as const,
	detail: (matchId: number) => [...matchKeys.details(), matchId] as const,
};

async function getCampaignMatches(campaignId: number) {
	const matchesData = await db.query.matches.findMany({
		where: eq(matches.campaignId, campaignId),
		orderBy: (matches, { asc }) => [asc(matches.date)],
		with: {
			participants: {
				with: {
					warband: true,
				},
			},
			winners: {
				with: {
					warband: true,
				},
			},
			events: {
				with: {
					warrior: true,
					defender: true,
				},
			},
		},
	});

	return matchesData;
}

export const getCampaignMatchesFn = createServerFn({ method: "GET" })
	.inputValidator((data: { campaignId: number }) => data)
	.handler(async ({ data }) => {
		const matchesData = await getCampaignMatches(data.campaignId);
		return matchesData;
	});

export const getCampaignMatchesOptions = (campaignId: number) =>
	queryOptions({
		queryKey: matchKeys.list(campaignId),
		queryFn: () => getCampaignMatchesFn({ data: { campaignId } }),
	});

async function getMatchDetails(matchId: number) {
	const matchWithParticipants = await db.query.matches.findFirst({
		where: eq(matches.id, matchId),
		with: {
			participants: {
				with: {
					warband: true,
				},
			},
			winners: {
				with: {
					warband: true,
				},
			},
			events: {
				with: {
					warrior: true,
					defender: true,
				},
			},
		},
	});

	return matchWithParticipants;
}

export const getMatchDetailsFn = createServerFn({ method: "GET" })
	.inputValidator((data: { matchId: number }) => data)
	.handler(async ({ data }) => {
		const match = await getMatchDetails(data.matchId);

		if (!match) {
			throw new Error("Match not found");
		}

		return match;
	});

export const getMatchDetailsOptions = (matchId: number) =>
	queryOptions({
		queryKey: matchKeys.detail(matchId),
		queryFn: () => getMatchDetailsFn({ data: { matchId } }),
	});

async function getMatchWarbands(matchId: number) {
	const result = await db.query.matchParticipants.findMany({
		where: eq(matchParticipants.matchId, matchId),
		with: {
			warband: { with: { warriors: { where: eq(warriors.isAlive, true) } } },
		},
	});

	return result.map((row) => row.warband);
}

export const getMatchWarbandsFn = createServerFn({ method: "GET" })
	.inputValidator((data: { matchId: number }) => data)
	.handler(async ({ data }) => {
		const result = await getMatchWarbands(data.matchId);

		return result;
	});

export const getMatchWarbandsOptions = (matchId: number) =>
	queryOptions({
		queryKey: matchKeys.warbands(matchId),
		queryFn: () => getMatchWarbandsFn({ data: { matchId } }),
	});

// Create Match
export const createMatchFormSchema = z.object({
	name: z.string().min(1, "Match name is required"),
	scenarioId: z.number(),
	matchType: z.enum(["1v1", "multiplayer"]),
});

export const createMatchFn = createServerFn({ method: "POST" })
	.inputValidator(createMatchFormSchema.extend({ campaignId: z.number() }))
	.handler(async ({ data }) => {
		const [newMatch] = await db
			.insert(matches)
			.values({
				name: data.name,
				date: new Date(),
				scenarioId: data.scenarioId,
				matchType: data.matchType,
				status: "scheduled",
				campaignId: data.campaignId,
			})
			.returning();

		return newMatch;
	});

const addParticipantsSchema = z.object({
	matchId: z.number(),
	warbandIds: z.array(z.number()).min(2, "At least 2 participants required"),
});

export const addParticipantsFn = createServerFn({ method: "POST" })
	.inputValidator(addParticipantsSchema)
	.handler(async ({ data }) => {
		const participants = data.warbandIds.map((warbandId) => ({
			matchId: data.matchId,
			warbandId,
		}));

		await db.insert(matchParticipants).values(participants);

		return { success: true };
	});

// Update Match
const updateMatchFormSchema = z.object({
	name: z.string().min(1, "Match name is required").optional(),
	status: z.enum(["active", "ended", "scheduled"]).optional(),
	scenarioId: z.number().optional(),
});

async function updateMatch(
	matchId: number,
	updateData: z.infer<typeof updateMatchFormSchema>,
) {
	const result = await db
		.update(matches)
		.set(updateData)
		.where(eq(matches.id, matchId))
		.returning();

	if (!result[0]) {
		throw new Error("Failed to update match");
	}

	return result[0];
}

export const updateMatchFn = createServerFn({ method: "POST" })
	.inputValidator(updateMatchFormSchema.extend({ matchId: z.number() }))
	.handler(async ({ data }) => {
		const { matchId, ...updateData } = data;
		const updatedMatch = await updateMatch(matchId, updateData);

		if (!updatedMatch) {
			throw new Error("Failed to update match");
		}

		return updatedMatch;
	});

// Set Match Winners
const setMatchWinnersSchema = z.object({
	matchId: z.number(),
	warbandIds: z.array(z.number()).min(1, "At least one winner required"),
});

export const setMatchWinnersFn = createServerFn({ method: "POST" })
	.inputValidator(setMatchWinnersSchema)
	.handler(async ({ data }) => {
		// First, delete existing winners for this match
		await db.delete(matchWinners).where(eq(matchWinners.matchId, data.matchId));

		// Then insert new winners
		const winners = data.warbandIds.map((warbandId) => ({
			matchId: data.matchId,
			warbandId,
		}));

		await db.insert(matchWinners).values(winners);
		await db
			.update(matches)
			.set({ status: "ended" })
			.where(eq(matches.id, data.matchId));

		return { success: true };
	});
