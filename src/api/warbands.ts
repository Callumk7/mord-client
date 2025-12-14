import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { and, count, eq, sql } from "drizzle-orm";
import z from "zod";
import { db } from "~/db";
import { events, warbandStateChanges, warbands, warriors } from "~/db/schema";
import { calculateRating } from "~/lib/ratings";

// Query Key Factory
export const warbandKeys = {
	all: ["warbands"] as const,
	lists: () => [...warbandKeys.all, "list"] as const,
	list: (campaignId: number) =>
		[...warbandKeys.lists(), { campaignId }] as const,
	listWithWarriors: (campaignId: number) =>
		[...warbandKeys.lists(), "withWarriors", { campaignId }] as const,
	details: () => [...warbandKeys.all, "detail"] as const,
	detail: (warbandId: number) => [...warbandKeys.details(), warbandId] as const,
	warriors: (warbandId: number) =>
		[...warbandKeys.all, "warriors", warbandId] as const,
};

// Get Campaign Warbands
export const getCampaignWarbandsFn = createServerFn({ method: "GET" })
	.inputValidator((data: { campaignId: number }) => data)
	.handler(async ({ data }) => {
		const campaignId = data.campaignId;
		return await db.query.warbands.findMany({
			where: eq(warbands.campaignId, campaignId),
		});
	});

export const campaignWarbandsQueryOptions = (campaignId: number) =>
	queryOptions({
		queryKey: warbandKeys.list(campaignId),
		queryFn: () => getCampaignWarbandsFn({ data: { campaignId } }),
	});

async function getCampaignWarbandsWithWarriors(campaignId: number) {
	const result = await db.query.warbands.findMany({
		where: eq(warbands.campaignId, campaignId),
		with: {
			warriors: true,
		},
	});

	return result;
}

export const getCampaignWarbandsWithWarriorsFn = createServerFn({
	method: "GET",
})
	.inputValidator((data: { campaignId: number }) => data)
	.handler(async ({ data }) => {
		const warbands = await getCampaignWarbandsWithWarriors(data.campaignId);
		return warbands;
	});

export const getCampaignWarbandsWithWarriorsOptions = (campaignId: number) =>
	queryOptions({
		queryKey: warbandKeys.listWithWarriors(campaignId),
		queryFn: () => getCampaignWarbandsWithWarriorsFn({ data: { campaignId } }),
	});

// Get Warband By Id
export const getWarbandByIdFn = createServerFn({ method: "GET" })
	.inputValidator((data: { warbandId: number }) => data)
	.handler(async ({ data }) => {
		const warband = await db.query.warbands.findFirst({
			where: eq(warbands.id, data.warbandId),
		});
		if (!warband) {
			throw new Error(`Warband with id ${data.warbandId} not found`);
		}
		return warband;
	});

export const getWarbandOptions = (warbandId: number) =>
	queryOptions({
		queryKey: warbandKeys.detail(warbandId),
		queryFn: () => getWarbandByIdFn({ data: { warbandId } }),
	});

// Delete Warband
export const deleteWarbandFn = createServerFn({ method: "POST" })
	.inputValidator((data: { warbandId: number }) => data)
	.handler(async ({ data }) => {
		const warbandId = data.warbandId;
		try {
			await db.delete(warbands).where(eq(warbands.id, warbandId));
		} catch {
			throw new Error(`Failed to delete warband with id ${warbandId}`);
		}
	});

export const deleteWarbandMutation = mutationOptions({
	mutationFn: (warbandId: number) => deleteWarbandFn({ data: { warbandId } }),
});

// Create Warband
const createWarbandFormSchema = z.object({
	name: z.string().min(1, "Warband name is required"),
	faction: z.string().min(1, "Warband faction is required"),
});

export const createWarbandFn = createServerFn({ method: "POST" })
	.inputValidator(createWarbandFormSchema.extend({ campaignId: z.number() }))
	.handler(async ({ data }) => {
		const [newWarband] = await db
			.insert(warbands)
			.values({
				name: data.name,
				faction: data.faction,
				rating: 0,
				treasury: 0,
				experience: 0,
				campaignId: data.campaignId,
			})
			.returning();

		return newWarband;
	});

const updateWarbandSchema = z.object({
	name: z.string().min(1, "Warband name is required").optional(),
	faction: z.string().min(1, "Warband faction is required").optional(),
	rating: z.number().min(0, "Warband rating is required").optional(),
	treasury: z.number().min(0, "Warband treasury is required").optional(),
	experience: z.number().min(0, "Warband experience is required").optional(),
});
async function updateWarband(
	warbandId: number,
	updateData: z.infer<typeof updateWarbandSchema>,
) {
	const [updatedWarband] = await db
		.update(warbands)
		.set(updateData)
		.where(eq(warbands.id, warbandId))
		.returning();

	if (!updatedWarband) {
		throw new Error(`Failed to update warband with id ${warbandId}`);
	}

	return updatedWarband;
}

export const updateWarbandFn = createServerFn({ method: "POST" })
	.inputValidator(updateWarbandSchema.extend({ warbandId: z.number() }))
	.handler(async ({ data }) => {
		const { warbandId, ...updateData } = data;
		return await updateWarband(warbandId, updateData);
	});

export const addExperienceToWarbandFn = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			warbandId: z.number(),
			matchId: z.number(),
			experience: z.number().min(0, "Experience amount is required"),
			description: z.string().optional(),
		}),
	)
	.handler(async ({ data }) => {
		const { warbandId, matchId, experience, description } = data;

		// Get current warband state
		const [currentWarband] = await db
			.select()
			.from(warbands)
			.where(eq(warbands.id, warbandId));

		if (!currentWarband) {
			throw new Error("Warband not found");
		}

		const oldRating = currentWarband.rating;

		// Update warband experience
		const [updatedWarband] = await db
			.update(warbands)
			.set({
				experience: sql`${warbands.experience} + ${experience}`,
				updatedAt: new Date(),
			})
			.where(eq(warbands.id, warbandId))
			.returning();

		// Calculate new rating
		const warriorCountResult = await db
			.select({ count: count() })
			.from(warriors)
			.where(
				and(eq(warriors.warbandId, warbandId), eq(warriors.isAlive, true)),
			);

		const warriorCount = Number(warriorCountResult[0]?.count || 0);
		const newRating = calculateRating(warriorCount, updatedWarband.experience);
		const ratingDelta = newRating - oldRating;

		// Update rating if it changed
		let finalWarband = updatedWarband;
		if (ratingDelta !== 0) {
			[finalWarband] = await db
				.update(warbands)
				.set({ rating: newRating })
				.where(eq(warbands.id, warbandId))
				.returning();
		}

		// Record state change
		await db.insert(warbandStateChanges).values({
			warbandId,
			matchId,
			treasuryDelta: 0,
			experienceDelta: experience,
			ratingDelta: ratingDelta,
			treasuryAfter: finalWarband.treasury,
			experienceAfter: finalWarband.experience,
			ratingAfter: newRating,
			changeType: "post_match_experience",
			description: description || "Experience gained from match",
			timestamp: new Date(),
		});

		return { ...finalWarband, rating: newRating };
	});

export const increaseExpereienceMutation = mutationOptions({
	mutationFn: (data: {
		warbandId: number;
		matchId: number;
		experience: number;
		description?: string;
	}) => addExperienceToWarbandFn({ data }),
});

export const addGoldToWarbandFn = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			warbandId: z.number(),
			matchId: z.number(),
			gold: z.number(),
			description: z.string().optional(),
		}),
	)
	.handler(async ({ data }) => {
		const { warbandId, matchId, gold, description } = data;
		const [updatedWarband] = await db
			.update(warbands)
			.set({
				treasury: sql`${warbands.treasury} + ${gold}`,
				updatedAt: new Date(),
			})
			.where(eq(warbands.id, warbandId))
			.returning();

		// Record the state change event
		await db.insert(warbandStateChanges).values({
			warbandId,
			matchId,
			treasuryDelta: gold,
			experienceDelta: 0,
			ratingDelta: 0,
			treasuryAfter: updatedWarband.treasury,
			experienceAfter: updatedWarband.experience,
			ratingAfter: updatedWarband.rating,
			changeType: "post_match_gold",
			description: description || "Gold gained from match",
			timestamp: new Date(),
		});

		return updatedWarband;
	});

export const addGoldToWarbandMutation = mutationOptions({
	mutationFn: (data: {
		warbandId: number;
		matchId: number;
		gold: number;
		description?: string;
	}) => addGoldToWarbandFn({ data }),
});

// Get Warriors for Warband
async function getWarriorsByWarband(warbandId: number) {
	const result = await db
		.select({
			warrior: warriors,
			kills: count(events.id),
		})
		.from(warriors)
		.leftJoin(
			events,
			and(eq(events.warriorId, warriors.id), eq(events.death, true)),
		)
		.where(eq(warriors.warbandId, warbandId))
		.groupBy(warriors.id)
		.orderBy(warriors.createdAt);

	return result.map((row) => ({
		...row.warrior,
		kills: Number(row.kills),
	}));
}

export const getWarriorsByWarbandFn = createServerFn({ method: "GET" })
	.inputValidator(z.object({ warbandId: z.number() }))
	.handler(async ({ data }) => {
		const result = await getWarriorsByWarband(data.warbandId);

		return result;
	});

export const getWarriorsByWarbandOptions = (warbandId: number) =>
	queryOptions({
		queryKey: warbandKeys.warriors(warbandId),
		queryFn: () => getWarriorsByWarbandFn({ data: { warbandId } }),
	});
