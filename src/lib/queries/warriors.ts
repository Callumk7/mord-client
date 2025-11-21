import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import z from "zod";
import { db } from "~/db";
import { warriors } from "~/db/schema";

export const getWarriorsByCampaignFn = createServerFn({ method: "GET" })
	.inputValidator(z.object({ campaignId: z.number() }))
	.handler(async ({ data }) => {
		return db
			.select()
			.from(warriors)
			.where(eq(warriors.campaignId, data.campaignId))
			.orderBy(warriors.name);
	});

export type WarriorsByCampaign = Awaited<
	ReturnType<typeof getWarriorsByCampaignFn>
>;
