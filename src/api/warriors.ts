import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import z from "zod";
import { db } from "~/db";
import { warriors } from "~/db/schema";

// Query Key Factory
export const warriorKeys = {
	all: ["warriors"] as const,
	lists: () => [...warriorKeys.all, "list"] as const,
	listByCampaign: (campaignId: number) =>
		[...warriorKeys.lists(), { campaignId }] as const,
	listByWarband: (warbandId: number) =>
		[...warriorKeys.lists(), { warbandId }] as const,
	details: () => [...warriorKeys.all, "detail"] as const,
	detail: (warriorId: number) => [...warriorKeys.details(), warriorId] as const,
};

// Get Warrior By Id
async function getWarriorById(warriorId: number) {
	const warrior = await db.query.warriors.findFirst({
		where: eq(warriors.id, warriorId),
		with: {
			warband: true,
		},
	});

	if (!warrior) {
		throw new Error(`Warrior with id ${warriorId} not found`);
	}

	return warrior;
}

export const getWarriorByIdFn = createServerFn({ method: "GET" })
	.inputValidator((data: { warriorId: number }) => data)
	.handler(async ({ data }) => {
		return await getWarriorById(data.warriorId);
	});

export const getWarriorByIdOptions = (warriorId: number) =>
	queryOptions({
		queryKey: warriorKeys.detail(warriorId),
		queryFn: () => getWarriorByIdFn({ data: { warriorId } }),
	});

// Get Warriors by Campaign
async function getWarriorsByCampaign(campaignId: number) {
	const result = await db.query.warriors.findMany({
		where: eq(warriors.campaignId, campaignId),
		with: {
			warband: true,
		},
		orderBy: (warriors, { asc }) => [
			asc(warriors.warbandId),
			asc(warriors.name),
		],
	});

	return result;
}

export const getWarriorsByCampaignFn = createServerFn({ method: "GET" })
	.inputValidator((data: { campaignId: number }) => data)
	.handler(async ({ data }) => {
		return await getWarriorsByCampaign(data.campaignId);
	});

export const getWarriorsByCampaignOptions = (campaignId: number) =>
	queryOptions({
		queryKey: warriorKeys.listByCampaign(campaignId),
		queryFn: () => getWarriorsByCampaignFn({ data: { campaignId } }),
	});

// Update Warrior
export const updateWarriorFormSchema = z.object({
	experience: z.number().optional(),
	kills: z.number().optional(),
	injuriesCaused: z.number().optional(),
	injuriesReceived: z.number().optional(),
	gamesPlayed: z.number().optional(),
	isAlive: z.boolean().optional(),
	deathDate: z.date().optional(),
	deathDescription: z.string().optional(),
	equipment: z.array(z.string()).optional(),
	skills: z.array(z.string()).optional(),
});

async function updateWarrior(
	warriorId: number,
	updateData: z.infer<typeof updateWarriorFormSchema>,
) {
	const [updatedWarrior] = await db
		.update(warriors)
		.set(updateData)
		.where(eq(warriors.id, warriorId))
		.returning();

	if (!updatedWarrior) {
		throw new Error(`Failed to update warrior with id ${warriorId}`);
	}

	return updatedWarrior;
}

export const updateWarriorFn = createServerFn({ method: "POST" })
	.inputValidator(updateWarriorFormSchema.extend({ warriorId: z.number() }))
	.handler(async ({ data }) => {
		const { warriorId, ...updateData } = data;
		return await updateWarrior(warriorId, updateData);
	});

export const updateWarriorMutation = mutationOptions({
	mutationFn: (
		data: z.infer<typeof updateWarriorFormSchema> & { warriorId: number },
	) => updateWarriorFn({ data }),
});

// Add Experience to Warrior
export const addExperienceFormSchema = z.object({
	warriorId: z.number(),
	additionalExperience: z.number().min(0, "Experience must be positive"),
});

async function addExperienceToWarrior(warriorId: number, amount: number) {
	const warrior = await getWarriorById(warriorId);
	const newExperience = warrior.experience + amount;

	const [updatedWarrior] = await db
		.update(warriors)
		.set({ experience: newExperience })
		.where(eq(warriors.id, warriorId))
		.returning();

	if (!updatedWarrior) {
		throw new Error(`Failed to add experience to warrior with id ${warriorId}`);
	}

	return updatedWarrior;
}

export const addExperienceToWarriorFn = createServerFn({ method: "POST" })
	.inputValidator(addExperienceFormSchema)
	.handler(async ({ data }) => {
		return await addExperienceToWarrior(
			data.warriorId,
			data.additionalExperience,
		);
	});

export const addExperienceToWarriorMutation = mutationOptions({
	mutationFn: (data: z.infer<typeof addExperienceFormSchema>) =>
		addExperienceToWarriorFn({ data }),
});
