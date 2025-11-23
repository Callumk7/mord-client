import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/db";
import { warriors } from "~/db/schema";

export const getWarriorsByWarbandFn = createServerFn({ method: "GET" })
	.inputValidator(z.object({ warbandId: z.number() }))
	.handler(async ({ data }) => {
		const result = await db
			.select()
			.from(warriors)
			.where(eq(warriors.warbandId, data.warbandId))
			.orderBy(warriors.createdAt);

		return result;
	});
