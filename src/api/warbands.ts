import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { and, count, eq, sql } from "drizzle-orm";
import z from "zod";
import { db } from "~/db";
import { events, warbands, warriors } from "~/db/schema";

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
		[...warbandKeys.details(), warbandId] as const,
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
			experience: z.number().min(0, "Experience amount is required"),
		}),
	)
	.handler(async ({ data }) => {
		const { warbandId, experience } = data;
		const [updatedWarband] = await db
			.update(warbands)
			.set({
				experience: sql`${warbands.experience} + ${experience}`,
				updatedAt: new Date(),
			})
			.where(eq(warbands.id, warbandId))
			.returning();

		return updatedWarband;
	});

export const increaseExpereienceMutation = mutationOptions({
	mutationFn: (data: { warbandId: number; experience: number }) =>
		addExperienceToWarbandFn({ data }),
});

export const addGoldToWarbandFn = createServerFn({ method: "POST" })
	.inputValidator((data: { warbandId: number; gold: number }) => data)
	.handler(async ({ data }) => {
		const { warbandId, gold } = data;
		const [updatedWarband] = await db
			.update(warbands)
			.set({ treasury: sql`${warbands.treasury} + ${gold}` })
			.where(eq(warbands.id, warbandId))
			.returning();

		return updatedWarband;
	});

export const addGoldToWarbandMutation = mutationOptions({
	mutationFn: (data: { warbandId: number; gold: number }) =>
		addGoldToWarbandFn({ data }),
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
