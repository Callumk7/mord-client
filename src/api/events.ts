import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import z from "zod";
import { db } from "~/db";
import { events } from "~/db/schema";

// Query Key Factory
export const eventKeys = {
	all: ["events"] as const,
	lists: () => [...eventKeys.all, "list"] as const,
	listByMatch: (matchId: number) =>
		[...eventKeys.lists(), { matchId }] as const,
	listByCampaign: (campaignId: number) =>
		[...eventKeys.lists(), { campaignId }] as const,
	details: () => [...eventKeys.all, "detail"] as const,
	detail: (eventId: number) => [...eventKeys.details(), eventId] as const,
};

// Get Campaign Events
export const getCampaignEventsFn = createServerFn({ method: "GET" })
	.inputValidator((data: { campaignId: number }) => data)
	.handler(async ({ data }) => {
		const campaignId = data.campaignId;
		return await db.query.events.findMany({
			where: eq(events.campaignId, campaignId),
			with: {
				warrior: true,
				defender: true,
				match: true,
			},
		});
	});

export const campaignEventsQueryOptions = (campaignId: number) =>
	queryOptions({
		queryKey: eventKeys.listByCampaign(campaignId),
		queryFn: () => getCampaignEventsFn({ data: { campaignId } }),
	});

const injuryTypeSchema = z.enum([
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

// Create Event
const createEventFormSchema = z.object({
	matchId: z.number(),
	type: z.enum(["knock_down", "moment"]),
	description: z.string().optional(),
	warriorId: z.number(),
	defenderId: z.number().optional(),
	resolved: z.boolean().optional().default(false),
	injuryType: injuryTypeSchema.optional(),
	death: z.boolean().optional().default(false),
	injury: z.boolean().optional().default(false),
});

export const createEventFn = createServerFn({ method: "POST" })
	.inputValidator(createEventFormSchema.extend({ campaignId: z.number() }))
	.handler(async ({ data }) => {
		const [newEvent] = await db
			.insert(events)
			.values({
				campaignId: data.campaignId,
				matchId: data.matchId,
				type: data.type,
				description: data.description,
				warriorId: data.warriorId,
				defenderId: data.defenderId,
				resolved: data.resolved ?? false,
				injuryType: data.injuryType,
				death: data.death ?? false,
				injury: data.injury ?? false,
			})
			.returning();

		return newEvent;
	});

// Update Event
export const updateEventFormSchema = z.object({
	resolved: z.boolean().optional(),
	injuryType: injuryTypeSchema.optional(),
	death: z.boolean().optional(),
	injury: z.boolean().optional(),
	description: z.string().optional(),
});

export const updateEventFn = createServerFn({ method: "POST" })
	.inputValidator(updateEventFormSchema.extend({ eventId: z.number() }))
	.handler(async ({ data }) => {
		const { eventId, ...updateData } = data;
		const [updatedEvent] = await db
			.update(events)
			.set(updateData)
			.where(eq(events.id, eventId))
			.returning();

		if (!updatedEvent) {
			throw new Error(`Failed to update event with id ${eventId}`);
		}

		return updatedEvent;
	});

export const updateEventMutation = mutationOptions({
	mutationFn: (
		data: z.infer<typeof updateEventFormSchema> & { eventId: number },
	) => updateEventFn({ data }),
});

async function getMatchEvents(matchId: number) {
	const result = await db.query.events.findMany({
		where: eq(events.matchId, matchId),
		with: {
			warrior: true,
			defender: true,
		},
	});

	return result;
}

export const getMatchEventsFn = createServerFn({ method: "GET" })
	.inputValidator((data: { matchId: number }) => data)
	.handler(async ({ data }) => {
		const matchId = data.matchId;
		return await getMatchEvents(matchId);
	});

export const getMatchEventsOptions = (matchId: number) =>
	queryOptions({
		queryKey: eventKeys.listByMatch(matchId),
		queryFn: () => getMatchEventsFn({ data: { matchId } }),
	});
