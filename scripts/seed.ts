import { config } from "dotenv";
import { db } from "../src/db/index.ts";
import {
	campaigns,
	warbands,
	warriors,
	matches,
	matchParticipants,
	matchWinners,
	events,
} from "../src/db/schema.ts";
import {
	INJURY_TYPES,
	getInjuryOutcome,
	type InjuryType,
} from "../src/types/injuries.ts";
import { eq } from "drizzle-orm";

config({ path: ".env.local" });

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
		await db.delete(events);
		await db.delete(matchWinners);
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
		console.log("⚔ Creating warbands...");
		const warbandData = [
			{ name: "The Crimson Guard", faction: "Reiklanders", rating: 125, experience: 0, treasury: 150, color: "#dc2626" },
			{ name: "Marienburg Traders", faction: "Marienburgers", rating: 118, experience: 0, treasury: 200, color: "#2563eb" },
			{ name: "Ulric's Chosen", faction: "Middenheimers", rating: 132, experience: 0, treasury: 100, color: "#059669" },
			{ name: "The Inquisition", faction: "Witch Hunters", rating: 140, experience: 0, treasury: 80, color: "#7c3aed" },
			{ name: "Clan Skritch", faction: "Skaven", rating: 110, experience: 0, treasury: 250, color: "#ca8a04" },
			{ name: "The Undying", faction: "Undead", rating: 145, experience: 0, treasury: 50, color: "#1f2937" },
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
					gamesPlayed: randomInt(2, 6),
					isLeader: i === 0, // First hero is the leader
					isAlive: true, // All warriors start alive, deaths set by events
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
					gamesPlayed: randomInt(1, 5),
					isLeader: false,
					isAlive: true, // All warriors start alive, deaths set by events
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

		console.log(`✅ Created ${createdWarriors.length} warriors`);

		// Create matches
		console.log("🎲 Creating matches...");
		const matchData: Array<typeof matches.$inferInsert> = [];

		// Create 10 1v1 matches
		for (let i = 1; i <= 10; i++) {
			matchData.push({
				name: `Match ${i}`,
				date: randomDate(startDate, endDate),
				matchType: "1v1",
				status: "ended",
				scenarioId: randomInt(1, 9),
				campaignId: campaign.id,
			});
		}

		// Create 6 multiplayer matches (2-4 players each)
		for (let i = 1; i <= 6; i++) {
			matchData.push({
				name: `Multiplayer Battle ${i}`,
				date: randomDate(startDate, endDate),
				matchType: "multiplayer",
				status: "ended",
				scenarioId: randomInt(1, 9),
				campaignId: campaign.id,
			});
		}

		const createdMatches = await db
			.insert(matches)
			.values(matchData)
			.returning();

		console.log(`✅ Created ${createdMatches.length} matches`);

		// Create match participants and winners
		console.log("👥 Creating match participants and winners...");

		for (const match of createdMatches) {
			if (match.matchType === "1v1") {
				// Pick 2 random warbands
				const warband1 = randomElement(createdWarbands);
				const warband2 = randomElement(
					createdWarbands.filter((w) => w.id !== warband1.id),
				);

				// Add both warbands as participants
				await db.insert(matchParticipants).values([
					{ matchId: match.id, warbandId: warband1.id },
					{ matchId: match.id, warbandId: warband2.id },
				]);

				// Randomly pick winner
				const winner = Math.random() > 0.5 ? warband1 : warband2;
				await db.insert(matchWinners).values({
					matchId: match.id,
					warbandId: winner.id,
				});
			} else if (match.matchType === "multiplayer") {
				// Pick 2-4 random warbands for this match
				const participantCount = randomInt(2, 4);
				const availableWarbands = [...createdWarbands];
				const selectedWarbands = [];

				for (let i = 0; i < participantCount; i++) {
					const index = randomInt(0, availableWarbands.length - 1);
					selectedWarbands.push(availableWarbands.splice(index, 1)[0]!);
				}

				// Add all participants
				await db.insert(matchParticipants).values(
					selectedWarbands.map((w) => ({
						matchId: match.id,
						warbandId: w.id,
					})),
				);

				// Pick 1-2 winners randomly
				const winnerCount = Math.random() > 0.7 ? 2 : 1; // 30% chance of 2 winners (draw/team)
				const shuffledWarbands = [...selectedWarbands].sort(() => Math.random() - 0.5);
				const winners = shuffledWarbands.slice(0, winnerCount);

				await db.insert(matchWinners).values(
					winners.map((w) => ({
						matchId: match.id,
						warbandId: w.id,
					})),
				);
			}
		}

		console.log("✅ Created match participants and winners");

		// Create events
		console.log("📝 Creating events...");
		const eventData: Array<typeof events.$inferInsert> = [];
		let guaranteedDeathCount = 0;
		const targetDeaths = 2; // Guarantee 1-2 deaths

		for (const match of createdMatches) {
			const matchParticipantsData = await db
				.select()
				.from(matchParticipants)
				.where(eq(matchParticipants.matchId, match.id));

			const participantWarbandIds = matchParticipantsData.map((mp) => mp.warbandId);
			const matchWarriors = createdWarriors.filter((w) =>
				participantWarbandIds.includes(w.warbandId),
			);

			// Create 5-12 events per match with more knock downs
			const eventCount = randomInt(5, 12);
			for (let i = 0; i < eventCount; i++) {
				const warrior = randomElement(matchWarriors);
				const defender = randomElement(
					matchWarriors.filter((w) => w.id !== warrior.id),
				);

				// 70% chance of knock down, 30% chance of moment (increased from 50/50)
				const eventType = Math.random() < 0.7 ? "knock_down" : "moment";
				const isKnockDown = eventType === "knock_down";
				
				// Force some deaths to ensure we have test data
				const shouldForceDeathEvent = 
					guaranteedDeathCount < targetDeaths && 
					isKnockDown && 
					i === 0; // First event of the match

				// Determine if this knock down results in an injury
				const shouldHaveInjury = shouldForceDeathEvent || (isKnockDown && Math.random() > 0.6); // 40% chance of injury on knock down
				
				// Select an injury type if there is an injury
				let selectedInjuryType: InjuryType | undefined = undefined;
				if (shouldHaveInjury) {
					if (shouldForceDeathEvent) {
						// Force a death injury
						selectedInjuryType = "dead";
						guaranteedDeathCount++;
					} else {
						// Randomly select an injury type (80% injured outcome, 10% dead, 10% other)
						const rand = Math.random();
						if (rand < 0.1) {
							selectedInjuryType = "dead";
							guaranteedDeathCount++;
						} else if (rand < 0.9) {
							// Select from injured outcomes
							const injuredTypes = INJURY_TYPES.filter(
								(t) => getInjuryOutcome(t) === "injured",
							);
							selectedInjuryType = randomElement(injuredTypes);
						} else {
							// Select from other outcomes
							const otherTypes = INJURY_TYPES.filter(
								(t) => getInjuryOutcome(t) === "other" && t !== "dead",
							);
							selectedInjuryType = randomElement(otherTypes);
						}
					}
				}

				// Determine death and injury flags based on the injury type's outcome
				const injuryOutcome = selectedInjuryType
					? getInjuryOutcome(selectedInjuryType)
					: undefined;
				const hasDeath = injuryOutcome === "dead";
				const hasInjury = injuryOutcome === "injured";

				eventData.push({
					campaignId: campaign.id,
					matchId: match.id,
					type: eventType,
					description: hasDeath
						? randomElement([
								"Delivered a fatal blow",
								"Struck down their opponent",
								"Landed a mortal strike",
						  ])
						: randomElement([
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
					resolved: true, // All events are resolved since all matches are ended
					injury: hasInjury,
					death: hasDeath,
					injuryType: selectedInjuryType,
				});
			}
		}

		const createdEvents = eventData.length > 0
			? await db.insert(events).values(eventData).returning()
			: [];

		console.log(`✅ Created ${createdEvents.length} events`);

		// Update warriors based on resolved death events
		console.log("💀 Processing death events...");
		const deathEvents = createdEvents.filter(
			(event) => event.resolved && event.death && event.defenderId,
		);

		let deathCount = 0;
		for (const deathEvent of deathEvents) {
			const match = createdMatches.find((m) => m.id === deathEvent.matchId);
			if (match && deathEvent.defenderId) {
				await db
					.update(warriors)
					.set({
						isAlive: false,
						deathDate: match.date,
					})
					.where(eq(warriors.id, deathEvent.defenderId));
				deathCount++;
			}
		}

		console.log(`✅ Processed ${deathCount} warrior deaths`);

		console.log("🎉 Database seeding completed successfully!");
		console.log(`\n📊 Summary:`);
		console.log(`   Campaign: ${campaign.name}`);
		console.log(`   Warbands: ${createdWarbands.length}`);
		console.log(`   Warriors: ${createdWarriors.length} (${deathCount} dead)`);
		console.log(`   Matches: ${createdMatches.length}`);
		console.log(`   Events: ${createdEvents.length}`);
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

