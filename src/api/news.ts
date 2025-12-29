import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import z from "zod";
import { db } from "~/db";
import { customNewsItems } from "~/db/schema";

export const customNewsKeys = {
	all: ["customNews"] as const,
	lists: () => [...customNewsKeys.all, "list"] as const,
	listByCampaign: (campaignId: number) =>
		[...customNewsKeys.lists(), { campaignId }] as const,
};

export const getCampaignCustomNewsFn = createServerFn({ method: "GET" })
	.inputValidator(z.object({ campaignId: z.number() }))
	.handler(async ({ data }) => {
		return await db.query.customNewsItems.findMany({
			where: eq(customNewsItems.campaignId, data.campaignId),
			orderBy: [desc(customNewsItems.createdAt)],
		});
	});

export const getCampaignCustomNewsOptions = (campaignId: number) =>
	queryOptions({
		queryKey: customNewsKeys.listByCampaign(campaignId),
		queryFn: () => getCampaignCustomNewsFn({ data: { campaignId } }),
	});

const contentSchema = z
	.string()
	.trim()
	.min(1, "News item is required")
	.max(200, "Keep it under 200 characters");

export const createCustomNewsFormSchema = z.object({
	campaignId: z.number(),
	content: contentSchema,
});

export const createCustomNewsFn = createServerFn({ method: "POST" })
	.inputValidator(createCustomNewsFormSchema)
	.handler(async ({ data }) => {
		const [created] = await db
			.insert(customNewsItems)
			.values({
				campaignId: data.campaignId,
				content: data.content,
			})
			.returning();

		return created;
	});

export const updateCustomNewsFn = createServerFn({ method: "POST" })
	.inputValidator(z.object({ id: z.number(), content: contentSchema }))
	.handler(async ({ data }) => {
		const [updated] = await db
			.update(customNewsItems)
			.set({
				content: data.content,
				updatedAt: new Date(),
			})
			.where(eq(customNewsItems.id, data.id))
			.returning();

		if (!updated) {
			throw new Error(`Failed to update custom news item ${data.id}`);
		}

		return updated;
	});

export const deleteCustomNewsFn = createServerFn({ method: "POST" })
	.inputValidator(z.object({ id: z.number() }))
	.handler(async ({ data }) => {
		const [deleted] = await db
			.delete(customNewsItems)
			.where(eq(customNewsItems.id, data.id))
			.returning();

		if (!deleted) {
			throw new Error(`Failed to delete custom news item ${data.id}`);
		}

		return deleted;
	});

export const createCustomNewsMutation = mutationOptions({
	mutationFn: (data: { campaignId: number; content: string }) =>
		createCustomNewsFn({ data }),
});

export const updateCustomNewsMutation = mutationOptions({
	mutationFn: (data: { id: number; content: string }) =>
		updateCustomNewsFn({ data }),
});

export const deleteCustomNewsMutation = mutationOptions({
	mutationFn: (id: number) => deleteCustomNewsFn({ data: { id } }),
});
