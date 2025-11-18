import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/db";
import { scenarios } from "~/db/schema";

// Validation schema for creating a scenario
const createScenarioSchema = z.object({
	name: z.string().min(1, "Scenario name required"),
	playerCount: z.number().min(2).max(4),
	description: z.string().optional(),
	specialRules: z.string().optional(),
	campaignId: z.number(),
});

// Get all scenarios for a campaign
export const getScenarios = createServerFn({
	method: "GET",
})
	.validator((data: unknown) => {
		return z.object({ campaignId: z.number() }).parse(data);
	})
	.handler(async ({ data }) => {
		const result = await db
			.select()
			.from(scenarios)
			.where(eq(scenarios.campaignId, data.campaignId));
		return result;
	});

// Create a new scenario
export const createScenario = createServerFn({
	method: "POST",
})
	.validator((data: unknown) => {
		return createScenarioSchema.parse(data);
	})
	.handler(async ({ data }) => {
		// Parse special rules from newline-separated string to array
		const specialRulesArray = data.specialRules
			? data.specialRules
					.split("\n")
					.map((rule) => rule.trim())
					.filter((rule) => rule.length > 0)
			: null;

		const [newScenario] = await db
			.insert(scenarios)
			.values({
				name: data.name,
				playerCount: data.playerCount,
				description: data.description || null,
				specialRules: specialRulesArray,
				campaignId: data.campaignId,
			})
			.returning();

		return newScenario;
	});
