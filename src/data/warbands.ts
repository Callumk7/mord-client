import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/db";
import { warbands } from "~/db/schema";

// Validation schema for creating a warband
const createWarbandSchema = z.object({
	name: z.string().min(1, "Warband name required"),
	faction: z.string().min(1, "Faction required"),
	playerName: z.string().optional(),
	campaignId: z.number(),
});

// Get all warbands for a campaign
export const getWarbands = createServerFn({
	method: "GET",
})
	.validator((data: unknown) => {
		return z.object({ campaignId: z.number() }).parse(data);
	})
	.handler(async ({ data }) => {
		const result = await db
			.select()
			.from(warbands)
			.where(eq(warbands.campaignId, data.campaignId));
		return result;
	});

// Create a new warband
export const createWarband = createServerFn({
	method: "POST",
})
	.validator((data: unknown) => {
		return createWarbandSchema.parse(data);
	})
	.handler(async ({ data }) => {
		const [newWarband] = await db
			.insert(warbands)
			.values({
				name: data.name,
				faction: data.faction,
				campaignId: data.campaignId,
				rating: 500, // Default starting rating
				treasury: 0, // Default starting treasury
				notes: data.playerName ? `Player: ${data.playerName}` : null,
			})
			.returning();

		return newWarband;
	});
