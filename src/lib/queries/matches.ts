import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import z from "zod";
import { db } from "~/db";
import {
	casualties,
	events,
	matches,
	matchParticipants,
	placements,
	teamMembers,
	teams,
	warbands,
	warriors,
} from "~/db/schema";

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

export const getMatchDetailsFn = createServerFn({ method: "GET" })
	.inputValidator(z.object({ matchId: z.number() }))
	.handler(async ({ data }) => {
		// Get the match
		const match = await db
			.select()
			.from(matches)
			.where(eq(matches.id, data.matchId))
			.limit(1);

		if (!match[0]) {
			throw new Error("Match not found");
		}

		// Get participants with warband details
		const participants = await db
			.select({
				id: matchParticipants.id,
				warbandId: matchParticipants.warbandId,
				warband: warbands,
			})
			.from(matchParticipants)
			.where(eq(matchParticipants.matchId, data.matchId))
			.leftJoin(warbands, eq(matchParticipants.warbandId, warbands.id));

		// Get teams if it's a team match
		const matchTeams = await db
			.select()
			.from(teams)
			.where(eq(teams.matchId, data.matchId));

		// For each team, get its members
		const teamsWithMembers = await Promise.all(
			matchTeams.map(async (team) => {
				const members = await db
					.select({
						id: teamMembers.id,
						warbandId: teamMembers.warbandId,
						warband: warbands,
					})
					.from(teamMembers)
					.where(eq(teamMembers.teamId, team.id))
					.leftJoin(warbands, eq(teamMembers.warbandId, warbands.id));

				return {
					...team,
					members: members.map((m) => ({
						id: m.id,
						warbandId: m.warbandId,
						warband: m.warband,
					})),
				};
			}),
		);

		// Get placements if it's a battle royale
		const matchPlacements = await db
			.select({
				id: placements.id,
				position: placements.position,
				warbandId: placements.warbandId,
				warband: warbands,
			})
			.from(placements)
			.where(eq(placements.matchId, data.matchId))
			.leftJoin(warbands, eq(placements.warbandId, warbands.id))
			.orderBy(placements.position);

		// Get casualties
		const matchCasualties = await db
			.select({
				id: casualties.id,
				type: casualties.type,
				description: casualties.description,
				timestamp: casualties.timestamp,
				victimWarriorId: casualties.victimWarriorId,
				victimWarbandId: casualties.victimWarbandId,
				killerWarriorId: casualties.killerWarriorId,
				killerWarbandId: casualties.killerWarbandId,
				victimWarrior: {
					id: warriors.id,
					name: warriors.name,
				},
				victimWarband: {
					id: warbands.id,
					name: warbands.name,
					color: warbands.color,
				},
			})
			.from(casualties)
			.where(eq(casualties.matchId, data.matchId))
			.leftJoin(warriors, eq(casualties.victimWarriorId, warriors.id))
			.leftJoin(warbands, eq(casualties.victimWarbandId, warbands.id))
			.orderBy(casualties.timestamp);

		// Get events (knock downs and memorable moments)
		const matchEvents = await db
			.select({
				id: events.id,
				type: events.type,
				description: events.description,
				timestamp: events.timestamp,
				warriorId: events.warriorId,
				defenderId: events.defenderId,
			})
			.from(events)
			.where(eq(events.matchId, data.matchId))
			.orderBy(events.timestamp);

		return {
			...match[0],
			participants: participants.map((p) => ({
				id: p.id,
				warbandId: p.warbandId,
				warband: p.warband,
			})),
			teams: teamsWithMembers,
			placements: matchPlacements.map((p) => ({
				id: p.id,
				position: p.position,
				warbandId: p.warbandId,
				warband: p.warband,
			})),
			casualties: matchCasualties,
			events: await Promise.all(
				matchEvents.map(async (event) => {
					const warrior = await db
						.select({
							id: warriors.id,
							name: warriors.name,
							warbandId: warriors.warbandId,
						})
						.from(warriors)
						.where(eq(warriors.id, event.warriorId))
						.limit(1);

					let defender = null;
					if (event.defenderId) {
						const defenderResult = await db
							.select({
								id: warriors.id,
								name: warriors.name,
								warbandId: warriors.warbandId,
							})
							.from(warriors)
							.where(eq(warriors.id, event.defenderId))
							.limit(1);
						defender = defenderResult[0] || null;
					}

					return {
						...event,
						warrior: warrior[0] || null,
						defender,
					};
				}),
			),
		};
	});

export type MatchDetails = Awaited<ReturnType<typeof getMatchDetailsFn>>;
