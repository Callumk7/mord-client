import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import z from "zod";
import { db } from "~/db";
import { events, warriors } from "~/db/schema";
import { getInjuryOutcome, injuryTypeSchema } from "~/types/injuries";

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

export const resolveEventFn = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			eventId: z.number(),
			injuryType: injuryTypeSchema,
		}),
	)
	.handler(async ({ data }) => {
		const { eventId, injuryType } = data;

		// Get injury outcome to determine if it's a death, injury, or other
		const outcome = getInjuryOutcome(injuryType);
		if (!outcome) {
			throw new Error(`Invalid injury type: ${injuryType}`);
		}

		// Fetch the event to get warrior and defender IDs
		const event = await db.query.events.findFirst({
			where: eq(events.id, eventId),
		});

		if (!event) {
			throw new Error(`Event with id ${eventId} not found`);
		}

		// Use transaction to ensure atomicity
		return await db.transaction(async (tx) => {
			// Determine if this is a death or injury based on outcome
			const isDeath = outcome === "dead";
			const isInjury = outcome === "injured";

			// Update the event with injury type and mark as resolved
			const [updatedEvent] = await tx
				.update(events)
				.set({
					injuryType,
					resolved: true,
					death: isDeath,
					injury: isInjury,
				})
				.where(eq(events.id, eventId))
				.returning();

			if (!updatedEvent) {
				throw new Error(`Failed to update event with id ${eventId}`);
			}

			// If death outcome and defender exists, mark defender as dead
			if (isDeath && event.defenderId) {
				await tx
					.update(warriors)
					.set({
						isAlive: false,
						deathDate: new Date(),
					})
					.where(eq(warriors.id, event.defenderId));
			}

			return updatedEvent;
		});
	});

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
