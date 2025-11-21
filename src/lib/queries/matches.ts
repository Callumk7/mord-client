import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import z from "zod";
import { db } from "~/db";
import { matches, matchParticipants, warbands } from "~/db/schema";

export const getMatchesFn = createServerFn({ method: "GET" })
	.inputValidator(z.object({ campaignId: z.number() }))
	.handler(async ({ data }) => {
		const matchesData = await db
			.select()
			.from(matches)
			.where(eq(matches.campaignId, data.campaignId))
			.orderBy(matches.date);

		// For each match, fetch its participants
		const matchesWithParticipants = await Promise.all(
			matchesData.map(async (match) => {
				const participants = await db
					.select({
						id: matchParticipants.id,
						warbandId: matchParticipants.warbandId,
						warband: warbands,
					})
					.from(matchParticipants)
					.where(eq(matchParticipants.matchId, match.id))
					.leftJoin(warbands, eq(matchParticipants.warbandId, warbands.id));

				return {
					...match,
					participants: participants.map((p) => ({
						id: p.id,
						warbandId: p.warbandId,
						warband: p.warband,
					})),
				};
			}),
		);

		return matchesWithParticipants;
	});

export type MatchWithParticipants = Awaited<
	ReturnType<typeof getMatchesFn>
>[number];
