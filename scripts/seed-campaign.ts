import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { db } from "../src/db/index.ts";
import { campaigns, warbands, warriors } from "../src/db/schema.ts";
import { calculateRating } from "../src/lib/ratings.ts";

config({ path: ".env.local" });

// Name generation lists
const campaignAdjectives = [
	"Bloody",
	"Dark",
	"Eternal",
	"Forbidden",
	"Grim",
	"Haunted",
	"Cursed",
	"Lost",
	"Ancient",
	"Shadowed",
	"Burning",
	"Frozen",
	"Shattered",
	"Wretched",
	"Doomed",
];

const campaignNouns = [
	"Shadows",
	"Ruins",
	"Souls",
	"Legends",
	"Champions",
	"Battles",
	"Nights",
	"Days",
	"Stones",
	"Scrolls",
	"Blades",
	"Banners",
	"Ashes",
	"Echoes",
	"Vengeance",
];

const campaignFormats = [
	(noun: string) => `Weekend of ${noun}`,
	(adj: string, noun: string) => `The ${adj} ${noun}`,
	(adj: string) => `${adj} Weekend`,
	(adj: string, noun: string) => `Campaign of the ${adj} ${noun}`,
	(noun: string) => `${noun} of Mordheim`,
];

const warbandAdjectives = [
	"Crimson",
	"Emerald",
	"Golden",
	"Silver",
	"Iron",
	"Blood",
	"Shadow",
	"Storm",
	"Flame",
	"Frost",
	"Death",
	"Black",
	"White",
	"Grim",
	"Holy",
	"Dark",
];

const warbandNouns = [
	"Guard",
	"Blades",
	"Fists",
	"Talons",
	"Claws",
	"Fangs",
	"Reavers",
	"Hunters",
	"Raiders",
	"Wardens",
	"Legion",
	"Company",
	"Brotherhood",
	"Order",
	"Chosen",
	"Sons",
	"Daughters",
];

const warbandFormats = [
	(adj: string, noun: string) => `The ${adj} ${noun}`,
	(adj: string, noun: string) => `${adj} ${noun}`,
	(_adj: string, noun: string, faction: string) => `${faction} ${noun}`,
];

// Faction-specific data
const factionData: Record<
	string,
	{
		heroTitles: string[];
		heroNames: string[];
		henchmanTypes: string[];
	}
> = {
	Reiklanders: {
		heroTitles: ["Captain", "Champion", "Youngblood", "Sergeant", "Marksman"],
		heroNames: [
			"Heinrich",
			"Klaus",
			"Rolf",
			"Otto",
			"Gustav",
			"Wilhelm",
			"Friedrich",
			"Magnus",
		],
		henchmanTypes: ["Swordsman", "Marksman", "Warrior", "Militiaman"],
	},
	Marienburgers: {
		heroTitles: ["Captain", "Champion", "Youngblood", "Merchant", "Navigator"],
		heroNames: [
			"Van Der Berg",
			"Pieter",
			"Jan",
			"Hendrik",
			"Cornelius",
			"Johan",
			"Dirk",
		],
		henchmanTypes: ["Swordsman", "Marksman", "Warrior", "Sailor"],
	},
	Middenheimers: {
		heroTitles: ["Captain", "Champion", "Youngblood", "Wolf Priest", "Berserker"],
		heroNames: [
			"Ulric",
			"Wolf",
			"Bear",
			"Bjorn",
			"Erik",
			"Ragnar",
			"Haakon",
			"Sigurd",
		],
		henchmanTypes: ["Swordsman", "Marksman", "Warrior", "Berserker"],
	},
	"Witch Hunters": {
		heroTitles: [
			"Inquisitor",
			"Witch Hunter Captain",
			"Champion",
			"Zealot",
			"Priest",
		],
		heroNames: [
			"Richter",
			"Matthias",
			"Luthor",
			"Gotrek",
			"Alaric",
			"Balthasar",
		],
		henchmanTypes: ["Flagellant", "Warrior Priest", "Zealot", "Acolyte"],
	},
	Skaven: {
		heroTitles: [
			"Warlord",
			"Assassin Adept",
			"Eshin Sorcerer",
			"Champion",
			"Black Skaven",
		],
		heroNames: [
			"Skritch",
			"Gnaw",
			"Snikch",
			"Queek",
			"Kratch",
			"Snitch",
			"Veek",
		],
		henchmanTypes: ["Clanrat", "Gutter Runner", "Verminkin", "Night Runner"],
	},
	Undead: {
		heroTitles: [
			"Necromancer",
			"Vampire",
			"Wight King",
			"Wraith",
			"Lich",
			"Grave Guard",
		],
		heroNames: [
			"Vlad",
			"Mannfred",
			"Krell",
			"Nagash",
			"Dieter",
			"Heinricht",
			"Rudolph",
		],
		henchmanTypes: ["Zombie", "Skeleton", "Ghoul", "Wraith"],
	},
	Orcs: {
		heroTitles: [
			"Big Boss",
			"Black Orc",
			"Orc Shaman",
			"Goblin Shaman",
			"Troll Slayer",
		],
		heroNames: [
			"Grom",
			"Uzgob",
			"Grimgor",
			"Skarsnik",
			"Gorbad",
			"Wurrzag",
			"Azhag",
		],
		henchmanTypes: ["Orc Boy", "Goblin", "Squig", "Troll"],
	},
	"Cult of the Possessed": {
		heroTitles: [
			"Magister",
			"Possessed",
			"Dark Soul",
			"Mutant Leader",
			"Brethren",
		],
		heroNames: [
			"Tchar",
			"Nurgh",
			"Slan",
			"Khorg",
			"Malus",
			"Vask",
			"Draven",
		],
		henchmanTypes: ["Brethren", "Mutant", "Beastman", "Darksouls"],
	},
	Sisters: {
		heroTitles: [
			"Matriarch",
			"Augur",
			"Sister Superior",
			"High Priestess",
			"Purifier",
		],
		heroNames: [
			"Sigrid",
			"Helga",
			"Brunhilde",
			"Astrid",
			"Freya",
			"Hildegard",
			"Greta",
		],
		henchmanTypes: ["Sister", "Novice", "Zealot", "Flagellant"],
	},
};

const factionList = [
	"Reiklanders",
	"Marienburgers",
	"Middenheimers",
	"Witch Hunters",
	"Skaven",
	"Undead",
	"Orcs",
	"Cult of the Possessed",
	"Sisters",
];

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

function generateCampaignName(): string {
	const adj = randomElement(campaignAdjectives);
	const noun = randomElement(campaignNouns);
	const format = randomElement(campaignFormats);
	return format(adj, noun);
}

function generateWarbandName(faction: string): string {
	const adj = randomElement(warbandAdjectives);
	const noun = randomElement(warbandNouns);
	const format = randomElement(warbandFormats);
	return format(adj, noun, faction);
}

function generateHeroName(faction: string): string {
	const data = factionData[faction] || factionData.Reiklanders;
	const title = randomElement(data.heroTitles);
	const name = randomElement(data.heroNames);
	return `${title} ${name}`;
}

function generateHenchmanName(faction: string, index: number): string {
	const data = factionData[faction] || factionData.Reiklanders;
	const type = randomElement(data.henchmanTypes);
	return `${type} ${index + 1}`;
}

async function seed() {
	console.log("🌱 Starting database seed...");

	try {
		// Create campaign
		console.log("📅 Creating campaign...");
		const startDate = new Date("2024-01-15T09:00:00Z");
		const endDate = new Date("2024-01-17T18:00:00Z");

		const campaignName = generateCampaignName();
		const [campaign] = await db
			.insert(campaigns)
			.values({
				name: campaignName,
				description:
					"A brutal weekend campaign in the ruins of Mordheim. Only the strongest will survive.",
				startDate,
				endDate,
			})
			.returning();

		console.log(`✅ Created campaign: ${campaign.name}`);

		// Create warbands
		console.log("⚔  Creating warbands...");
		const colors = [
			"#dc2626",
			"#2563eb",
			"#059669",
			"#7c3aed",
			"#ca8a04",
			"#1f2937",
			"#16a34a",
			"#9333ea",
			"#db2777",
		];

		const warbandData = factionList.map((faction, index) => ({
			name: generateWarbandName(faction),
			faction,
			rating: 0,
			experience: randomInt(30, 50),
			treasury: randomInt(1, 20),
			color: colors[index % colors.length]!,
		}));

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
			const heroCount = randomInt(2, 3);
			const henchmanCount = randomInt(3, 5);

			// Create heroes
			for (let i = 0; i < heroCount; i++) {
				allWarriors.push({
					name: generateHeroName(warband.faction),
					campaignId: campaign.id,
					warbandId: warband.id,
					type: "hero",
					gamesPlayed: 0,
					isLeader: i === 0, // First hero is the leader
					isAlive: true,
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
				allWarriors.push({
					name: generateHenchmanName(warband.faction, i),
					campaignId: campaign.id,
					warbandId: warband.id,
					type: "henchman",
					gamesPlayed: 0,
					isLeader: false,
					isAlive: true,
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

		// Update warband ratings based on warrior count and experience
		console.log("📊 Calculating warband ratings...");
		for (const warband of createdWarbands) {
			const warbandWarriors = createdWarriors.filter(
				(w) => w.warbandId === warband.id,
			);
			const warriorCount = warbandWarriors.length;
			const rating = calculateRating(warriorCount, warband.experience);

			await db
				.update(warbands)
				.set({ rating })
				.where(eq(warbands.id, warband.id));
		}

		console.log("✅ Updated warband ratings");

		console.log("🎉 Database seeding completed successfully!");
		console.log(`\n📊 Summary:`);
		console.log(`   Campaign: ${campaign.name}`);
		console.log(`   Warbands: ${createdWarbands.length}`);
		console.log(`   Warriors: ${createdWarriors.length}`);
		console.log(`   Matches: 0 (not created)`);
		console.log(`   Events: 0 (not created)`);
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
