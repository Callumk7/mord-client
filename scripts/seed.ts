import { config } from "dotenv";
import { db } from "../src/db/index.ts";
import {
	campaigns,
	warbands,
	warriors,
	matches,
	matchParticipants,
	teams,
	teamMembers,
	placements,
	casualties,
	events,
} from "../src/db/schema.ts";
import { eq } from "drizzle-orm";

config({ path: ".env.local" });

// Warband factions for Mordheim
const factions = [
	"Reiklanders",
	"Marienburgers",
	"Middenheimers",
	"Witch Hunters",
	"Skaven",
	"Undead",
];

// Warrior names by faction
const warriorNames: Record<string, { heroes: string[]; henchmen: string[] }> = {
	Reiklanders: {
		heroes: ["Captain Heinrich", "Champion Klaus", "Youngblood Rolf"],
		henchmen: ["Swordsman", "Marksman", "Warrior"],
	},
	Marienburgers: {
		heroes: ["Captain Van Der Berg", "Champion Pieter", "Youngblood Jan"],
		henchmen: ["Swordsman", "Marksman", "Warrior"],
	},
	Middenheimers: {
		heroes: ["Captain Ulric", "Champion Wolf", "Youngblood Bear"],
		henchmen: ["Swordsman", "Marksman", "Warrior"],
	},
	"Witch Hunters": {
		heroes: ["Inquisitor Richter", "Champion Zealot", "Novice Hunter"],
		henchmen: ["Flagellant", "Warrior Priest", "Acolyte"],
	},
	Skaven: {
		heroes: ["Warlord Skritch", "Champion Gnaw", "Eshin Sorcerer"],
		henchmen: ["Clanrat", "Gutter Runner", "Rat Ogre"],
	},
	Undead: {
		heroes: ["Necromancer Vlad", "Vampire Count", "Wight King"],
		henchmen: ["Zombie", "Skeleton", "Ghoul"],
	},
};

// Equipment and skills pools
const equipmentPool = [
	"Sword",
	"Axe",
	"Mace",
	"Bow",
	"Crossbow",
	"Shield",
	"Light Armor",
	"Heavy Armor",
	"Dagger",
	"Spear",
	"Halberd",
];

const skillsPool = [
	"Strike to Injure",
	"Strike to Stun",
	"Step Aside",
	"Dodge",
	"Combat Master",
	"Hard to Kill",
	"Parry",
	"Quick Shot",
];

function randomElement<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)]!;
}

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date): Date {
	return new Date(
		start.getTime() + Math.random() * (end.getTime() - start.getTime()),
	);
}

async function seed() {
	console.log("🌱 Starting database seed...");

	try {
		// Clear existing data (in reverse order of dependencies)
		console.log("🧹 Clearing existing data...");
		await db.delete(casualties);
		await db.delete(events);
		await db.delete(placements);
		await db.delete(teamMembers);
		await db.delete(teams);
		await db.delete(matchParticipants);
		await db.delete(matches);
		await db.delete(warriors);
		await db.delete(warbands);
		await db.delete(campaigns);

		// Create campaign
		console.log("📅 Creating campaign...");
		const startDate = new Date("2024-01-15T09:00:00Z");
		const endDate = new Date("2024-01-17T18:00:00Z");

		const [campaign] = await db
			.insert(campaigns)
			.values({
				name: "Weekend of Shadows",
				description:
					"A brutal weekend campaign in the ruins of Mordheim. Only the strongest will survive.",
				startDate,
				endDate,
			})
			.returning();

		console.log(`✅ Created campaign: ${campaign.name}`);

		// Create warbands
		console.log("⚔️ Creating warbands...");
		const warbandData = [
			{ name: "The Crimson Guard", faction: "Reiklanders", rating: 125, treasury: 150, color: "#dc2626" },
			{ name: "Marienburg Traders", faction: "Marienburgers", rating: 118, treasury: 200, color: "#2563eb" },
			{ name: "Ulric's Chosen", faction: "Middenheimers", rating: 132, treasury: 100, color: "#059669" },
			{ name: "The Inquisition", faction: "Witch Hunters", rating: 140, treasury: 80, color: "#7c3aed" },
			{ name: "Clan Skritch", faction: "Skaven", rating: 110, treasury: 250, color: "#ca8a04" },
			{ name: "The Undying", faction: "Undead", rating: 145, treasury: 50, color: "#1f2937" },
		];

		const createdWarbands = await db
			.insert(warbands)
			.values(
				warbandData.map((w) => ({
					...w,
					campaignId: campaign.id,
				})),
			)
			.returning();

		console.log(`✅ Created ${createdWarbands.length} warbands`);

		// Create warriors for each warband
		console.log("👥 Creating warriors...");
		const allWarriors: Array<typeof warriors.$inferInsert> = [];

		for (const warband of createdWarbands) {
			const factionData = warriorNames[warband.faction] || warriorNames.Reiklanders;
			const heroCount = randomInt(1, 2);
			const henchmanCount = randomInt(2, 4);

			// Create heroes
			for (let i = 0; i < heroCount && i < factionData.heroes.length; i++) {
				allWarriors.push({
					name: factionData.heroes[i]!,
					campaignId: campaign.id,
					warbandId: warband.id,
					type: "hero",
					experience: randomInt(5, 25),
					kills: randomInt(0, 5),
					injuriesCaused: randomInt(2, 10),
					injuriesReceived: randomInt(0, 4),
					gamesPlayed: randomInt(2, 6),
					isAlive: Math.random() > 0.2, // 80% survival rate
					equipment: Array.from(
						{ length: randomInt(2, 4) },
						() => randomElement(equipmentPool),
					),
					skills: Array.from(
						{ length: randomInt(1, 3) },
						() => randomElement(skillsPool),
					),
				});
			}

			// Create henchmen
			for (let i = 0; i < henchmanCount; i++) {
				const baseName = randomElement(factionData.henchmen);
				allWarriors.push({
					name: `${baseName} ${i + 1}`,
					campaignId: campaign.id,
					warbandId: warband.id,
					type: "henchman",
					experience: randomInt(0, 8),
					kills: randomInt(0, 3),
					injuriesCaused: randomInt(0, 5),
					injuriesReceived: randomInt(0, 3),
					gamesPlayed: randomInt(1, 5),
					isAlive: Math.random() > 0.3, // 70% survival rate
					equipment: Array.from(
						{ length: randomInt(1, 3) },
						() => randomElement(equipmentPool),
					),
					skills: [],
				});
			}
		}

		const createdWarriors = await db
			.insert(warriors)
			.values(allWarriors)
			.returning();

		// Mark some warriors as dead
		const deadWarriors = createdWarriors.filter((w) => !w.isAlive);
		if (deadWarriors.length > 0) {
			for (const warrior of deadWarriors) {
				const deathDate = randomDate(startDate, endDate);
				await db
					.update(warriors)
					.set({
						deathDate,
						deathDescription: randomElement([
							"Cut down in battle",
							"Fell from a rooftop",
							"Crushed by falling debris",
							"Struck by a stray arrow",
							"Devoured by a monster",
						]),
					})
					.where(eq(warriors.id, warrior.id));
			}
		}

		console.log(`✅ Created ${createdWarriors.length} warriors (${deadWarriors.length} dead)`);

		// Create matches
		console.log("🎲 Creating matches...");
		const matchData: Array<typeof matches.$inferInsert> = [];

		// Create 5 1v1 matches
		for (let i = 1; i <= 5; i++) {
			const warband1 = randomElement(createdWarbands);
			const warband2 = randomElement(
				createdWarbands.filter((w) => w.id !== warband1.id),
			);
			const winner = Math.random() > 0.5 ? warband1 : warband2;
			const loser = winner.id === warband1.id ? warband2 : warband1;

			matchData.push({
				name: `Match ${i}`,
				date: randomDate(startDate, endDate),
				matchType: "1v1",
				resultType: "standard",
				status: "ended",
				scenarioId: randomInt(1, 9),
				campaignId: campaign.id,
				winnerId: winner.id,
				loserId: loser.id,
			});
		}

		// Create 2 2v2 matches
		for (let i = 1; i <= 2; i++) {
			const availableWarbands = [...createdWarbands];
			const team1Warbands = [
				availableWarbands.splice(randomInt(0, availableWarbands.length - 1), 1)[0]!,
				availableWarbands.splice(randomInt(0, availableWarbands.length - 1), 1)[0]!,
			];
			const team2Warbands = [
				availableWarbands.splice(randomInt(0, availableWarbands.length - 1), 1)[0]!,
				availableWarbands.splice(randomInt(0, availableWarbands.length - 1), 1)[0]!,
			];

			matchData.push({
				name: `Team Battle ${i}`,
				date: randomDate(startDate, endDate),
				matchType: "2v2",
				resultType: "team",
				status: "ended",
				scenarioId: randomInt(1, 9),
				campaignId: campaign.id,
			});
		}

		// Create 1 battle royale match
		matchData.push({
			name: "The Grand Melee",
			date: randomDate(startDate, endDate),
			matchType: "battle_royale",
			resultType: "placement",
			status: "ended",
			scenarioId: randomInt(1, 9),
			campaignId: campaign.id,
		});

		const createdMatches = await db
			.insert(matches)
			.values(matchData)
			.returning();

		console.log(`✅ Created ${createdMatches.length} matches`);

		// Create match participants and teams
		console.log("👥 Creating match participants and teams...");
		let matchIndex = 0;

		for (const match of createdMatches) {
			if (match.matchType === "1v1") {
				// Add both warbands as participants
				await db.insert(matchParticipants).values([
					{ matchId: match.id, warbandId: match.winnerId! },
					{ matchId: match.id, warbandId: match.loserId! },
				]);
			} else if (match.matchType === "2v2") {
				// Get the warbands for this 2v2 match
				const availableWarbands = [...createdWarbands];
				const team1Warbands = [
					availableWarbands.splice(randomInt(0, availableWarbands.length - 1), 1)[0]!,
					availableWarbands.splice(randomInt(0, availableWarbands.length - 1), 1)[0]!,
				];
				const team2Warbands = [
					availableWarbands.splice(randomInt(0, availableWarbands.length - 1), 1)[0]!,
					availableWarbands.splice(randomInt(0, availableWarbands.length - 1), 1)[0]!,
				];

				// Add all participants
				await db.insert(matchParticipants).values(
					[...team1Warbands, ...team2Warbands].map((w) => ({
						matchId: match.id,
						warbandId: w.id,
					})),
				);

				// Create teams
				const winningTeam = Math.random() > 0.5 ? team1Warbands : team2Warbands;
				const losingTeam = winningTeam === team1Warbands ? team2Warbands : team1Warbands;

				const [team1] = await db
					.insert(teams)
					.values({
						matchId: match.id,
						name: "Team 1",
						isWinner: winningTeam === team1Warbands,
					})
					.returning();

				const [team2] = await db
					.insert(teams)
					.values({
						matchId: match.id,
						name: "Team 2",
						isWinner: winningTeam === team2Warbands,
					})
					.returning();

				await db.insert(teamMembers).values([
					...team1Warbands.map((w) => ({ teamId: team1.id, warbandId: w.id })),
					...team2Warbands.map((w) => ({ teamId: team2.id, warbandId: w.id })),
				]);

				// Update match with winning team
				await db
					.update(matches)
					.set({ winningTeamId: winningTeam === team1Warbands ? team1.id : team2.id })
					.where(eq(matches.id, match.id));
			} else if (match.matchType === "battle_royale") {
				// Add all warbands as participants
				await db.insert(matchParticipants).values(
					createdWarbands.map((w) => ({
						matchId: match.id,
						warbandId: w.id,
					})),
				);

				// Create placements (random order)
				const shuffledWarbands = [...createdWarbands].sort(() => Math.random() - 0.5);
				await db.insert(placements).values(
					shuffledWarbands.map((w, index) => ({
						matchId: match.id,
						warbandId: w.id,
						position: index + 1,
					})),
				);
			}

			matchIndex++;
		}

		console.log("✅ Created match participants and teams");

		// Create casualties
		console.log("💀 Creating casualties...");
		const casualtyData: Array<typeof casualties.$inferInsert> = [];

		for (const match of createdMatches) {
			const matchParticipantsData = await db
				.select()
				.from(matchParticipants)
				.where(eq(matchParticipants.matchId, match.id));

			const participantWarbandIds = matchParticipantsData.map((mp) => mp.warbandId);
			const participantWarbands = createdWarbands.filter((w) =>
				participantWarbandIds.includes(w.id),
			);

			// Create 2-5 casualties per match
			const casualtyCount = randomInt(2, 5);
			for (let i = 0; i < casualtyCount; i++) {
				const victimWarband = randomElement(participantWarbands);
				const killerWarband = randomElement(
					participantWarbands.filter((w) => w.id !== victimWarband.id),
				);

				const victimWarriors = createdWarriors.filter(
					(w) => w.warbandId === victimWarband.id && w.isAlive,
				);
				const killerWarriors = createdWarriors.filter(
					(w) => w.warbandId === killerWarband.id && w.isAlive,
				);

				if (victimWarriors.length > 0 && killerWarriors.length > 0) {
					casualtyData.push({
						campaignId: campaign.id,
						matchId: match.id,
						victimWarriorId: randomElement(victimWarriors).id,
						victimWarbandId: victimWarband.id,
						killerWarriorId: randomElement(killerWarriors).id,
						killerWarbandId: killerWarband.id,
						type: randomElement(["killed", "injured", "stunned", "escaped"]),
						description: randomElement([
							"Struck down in melee",
							"Shot from a distance",
							"Knocked unconscious",
							"Fled the battlefield",
						]),
						timestamp: match.date,
					});
				}
			}
		}

		if (casualtyData.length > 0) {
			await db.insert(casualties).values(casualtyData);
			console.log(`✅ Created ${casualtyData.length} casualties`);
		}

		// Create events
		console.log("📝 Creating events...");
		const eventData: Array<typeof events.$inferInsert> = [];

		for (const match of createdMatches) {
			const matchParticipantsData = await db
				.select()
				.from(matchParticipants)
				.where(eq(matchParticipants.matchId, match.id));

			const participantWarbandIds = matchParticipantsData.map((mp) => mp.warbandId);
			const matchWarriors = createdWarriors.filter((w) =>
				participantWarbandIds.includes(w.warbandId),
			);

			// Create 3-8 events per match
			const eventCount = randomInt(3, 8);
			for (let i = 0; i < eventCount; i++) {
				const warrior = randomElement(matchWarriors);
				const defender = randomElement(
					matchWarriors.filter((w) => w.id !== warrior.id),
				);

				eventData.push({
					campaignId: campaign.id,
					matchId: match.id,
					type: randomElement(["knock_down", "moment"]),
					description: randomElement([
						"Delivered a crushing blow",
						"Performed an incredible dodge",
						"Shot a perfect arrow",
						"Rallied the troops",
						"Made a heroic stand",
						"Executed a perfect flanking maneuver",
					]),
					timestamp: match.date,
					warriorId: warrior.id,
					defenderId: defender.id,
				});
			}
		}

		if (eventData.length > 0) {
			await db.insert(events).values(eventData);
			console.log(`✅ Created ${eventData.length} events`);
		}

		console.log("🎉 Database seeding completed successfully!");
		console.log(`\n📊 Summary:`);
		console.log(`   Campaign: ${campaign.name}`);
		console.log(`   Warbands: ${createdWarbands.length}`);
		console.log(`   Warriors: ${createdWarriors.length}`);
		console.log(`   Matches: ${createdMatches.length}`);
		console.log(`   Casualties: ${casualtyData.length}`);
		console.log(`   Events: ${eventData.length}`);
	} catch (error) {
		console.error("❌ Error seeding database:", error);
		process.exit(1);
	}
}

seed()
	.then(() => {
		process.exit(0);
	})
	.catch((error) => {
		console.error("❌ Fatal error:", error);
		process.exit(1);
	});

