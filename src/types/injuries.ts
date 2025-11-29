import z from "zod";

/**
 * Mordheim Serious Injuries Chart
 * Roll 2D6 for tens and ones to get result on D66 table
 */

/**
 * Injury type enum values - single source of truth
 * These values must match the database enum in schema.ts
 */
export const INJURY_TYPES = [
	"dead",
	"multiple",
	"leg_wound",
	"arm_wound",
	"madness",
	"smashed_leg",
	"chest_wound",
	"blinded_in_one_eye",
	"old_battle_wound",
	"nervous",
	"hand_injury",
	"deep_wound",
	"robbed",
	"full_recovery",
	"bitter_emnity",
	"captured",
	"hardened",
	"horrible_scars",
	"sold_to_pits",
	"survive_against_odds",
] as const;

/**
 * TypeScript type for injury types
 */
export type InjuryType = (typeof INJURY_TYPES)[number];

/**
 * Zod schema for injury types
 */
export const injuryTypeSchema = z.enum(INJURY_TYPES);

/**
 * Injury roll type - can be a single number or a range [min, max]
 */
export type InjuryRoll = number | [number, number];

/**
 * Sub-roll outcome for injuries that require additional dice rolls
 */
export type SubRollOutcome = {
	roll: InjuryRoll;
	effect: string;
};

/**
 * Sub-roll definition for injuries with additional dice mechanics
 */
export type SubRoll = {
	dice: string;
	description?: string;
	outcomes: SubRollOutcome[];
};

/**
 * Complete serious injury definition
 */
export type SeriousInjury = {
	enumValue: InjuryType;
	roll: InjuryRoll;
	name: string;
	description: string;
	statEffect?: string;
	subRoll?: SubRoll;
	outcome: "dead" | "injured" | "other";
};

/**
 * Comprehensive injury information type (includes enum value)
 */
export type InjuryInfo = {
	enumValue: InjuryType;
	name: string;
	description: string;
	roll: InjuryRoll;
	outcome: "dead" | "injured" | "other";
	statEffect?: string;
};

/**
 * All serious injuries data
 */
export const seriousInjuries: SeriousInjury[] = [
	{
		enumValue: "dead",
		roll: [11, 15],
		name: "Dead",
		description:
			"The warrior is dead and his body is abandoned in the dark alleys of Mordheim, never to be found again. All the weapons and equipment he carried are lost. Remove him from the warband's roster.",
		outcome: "dead",
	},
	{
		enumValue: "multiple",
		roll: [16, 21],
		name: "Multiple Injuries",
		description:
			"The warrior is not dead but has suffered a lot of wounds. Roll D6 times on this table. Re-roll any 'Dead', 'Captured' and further 'Multiple Injuries' results.",
		outcome: "other",
	},
	{
		enumValue: "leg_wound",
		roll: 22,
		name: "Leg Wound",
		description: "The warrior's leg is broken.",
		statEffect: "-1 Movement",
		outcome: "injured",
	},
	{
		enumValue: "arm_wound",
		roll: 23,
		name: "Arm Wound",
		description:
			"The warrior has suffered an arm wound. Roll to determine severity.",
		subRoll: {
			dice: "D6",
			outcomes: [
				{
					roll: 1,
					effect:
						"Severe arm wound. The arm must be amputated. The warrior may only use a single one-handed weapon from now on.",
				},
				{
					roll: [2, 6],
					effect: "Light wound. The warrior must miss the next game.",
				},
			],
		},
		outcome: "injured",
	},
	{
		enumValue: "madness",
		roll: 24,
		name: "Madness",
		description:
			"The warrior's mind has been affected by his experiences in Mordheim.",
		subRoll: {
			dice: "D6",
			outcomes: [
				{
					roll: [1, 3],
					effect:
						"The warrior suffers from stupidity (see Psychology section for details).",
				},
				{
					roll: [4, 6],
					effect:
						"The warrior suffers from frenzy (see Psychology section for details).",
				},
			],
		},
		outcome: "injured",
	},
	{
		enumValue: "smashed_leg",
		roll: 25,
		name: "Smashed Leg",
		description: "The warrior's leg has been badly smashed.",
		subRoll: {
			dice: "D6",
			outcomes: [
				{
					roll: 1,
					effect: "The warrior may not run any more but he may still charge.",
				},
				{
					roll: [2, 6],
					effect: "The warrior misses the next game.",
				},
			],
		},
		outcome: "injured",
	},
	{
		enumValue: "chest_wound",
		roll: 26,
		name: "Chest Wound",
		description:
			"The warrior has been badly wounded in the chest. He recovers but is weakened by the injury.",
		statEffect: "-1 Toughness",
		outcome: "injured",
	},
	{
		enumValue: "blinded_in_one_eye",
		roll: 31,
		name: "Blinded in One Eye",
		description:
			"The warrior survives but loses the sight in one eye (randomly determine which). If the warrior is subsequently blinded in his remaining good eye he must retire from the warband.",
		statEffect: "-1 Ballistic Skill",
		outcome: "injured",
	},
	{
		enumValue: "old_battle_wound",
		roll: 32,
		name: "Old Battle Wound",
		description:
			"The warrior survives, but his wound will prevent him from fighting if you roll a 1 on a D6 at the start of any battle. Roll at the start of each battle from now on.",
		outcome: "injured",
	},
	{
		enumValue: "nervous",
		roll: 33,
		name: "Nervous Condition",
		description: "The warrior's nervous system has been damaged.",
		statEffect: "-1 Initiative",
		outcome: "injured",
	},
	{
		enumValue: "hand_injury",
		roll: 34,
		name: "Hand Injury",
		description: "The warrior's hand is badly injured.",
		statEffect: "-1 Weapon Skill",
		outcome: "injured",
	},
	{
		enumValue: "deep_wound",
		roll: 35,
		name: "Deep Wound",
		description:
			"The warrior has suffered a serious wound and must miss the next D3 games while he is recovering. He may do nothing at all while recovering.",
		outcome: "injured",
	},
	{
		enumValue: "robbed",
		roll: 36,
		name: "Robbed",
		description:
			"The warrior manages to escape, but all his weapons, armour and equipment are lost.",
		outcome: "other",
	},
	{
		enumValue: "full_recovery",
		roll: [41, 55],
		name: "Full Recovery",
		description:
			"The warrior has been knocked unconscious, or suffers a light wound from which he makes a full recovery.",
		outcome: "other",
	},
	{
		enumValue: "bitter_emnity",
		roll: 56,
		name: "Bitter Enmity",
		description:
			"The warrior makes a full physical recovery, but is psychologically scarred by his experience. From now on the warrior hates the following:",
		subRoll: {
			dice: "D6",
			outcomes: [
				{
					roll: [1, 3],
					effect:
						"The individual who caused the injury. If it was a Henchman, he hates the enemy leader instead.",
				},
				{
					roll: 4,
					effect: "The leader of the warband that caused the injury.",
				},
				{
					roll: 5,
					effect:
						"The entire warband of the warrior responsible for the injury.",
				},
				{
					roll: 6,
					effect: "All warbands of that type.",
				},
			],
		},
		outcome: "injured",
	},
	{
		enumValue: "captured",
		roll: 61,
		name: "Captured",
		description:
			"The warrior regains consciousness and finds himself held captive by the other warband. He may be ransomed at a price set by the captor or exchanged for one of their warband who is being held captive. Captives may be sold to slavers at a price of D6x5 gc. Undead may kill their captive and gain a new Zombie. The Possessed may sacrifice the prisoner. The leader of the warband will gain +1 Experience if they do so. Captives who are exchanged or ransomed retain all their weapons, armour and equipment; if captives are sold, killed or turned to Zombies, their weaponry, etc, is retained by their captors.",
		outcome: "other",
	},
	{
		enumValue: "hardened",
		roll: [62, 63],
		name: "Hardened",
		description:
			"The warrior survives and becomes inured to the horrors of Mordheim. From now on he is immune to fear.",
		outcome: "other",
	},
	{
		enumValue: "horrible_scars",
		roll: 64,
		name: "Horrible Scars",
		description: "The warrior causes fear from now on.",
		outcome: "injured",
	},
	{
		enumValue: "sold_to_pits",
		roll: 65,
		name: "Sold to the Pits",
		description:
			"The warrior wakes up in the infamous fighting pits of Cutthroat's Haven and must fight against a Pit Fighter. See the Hired Swords section for full rules for Pit Fighters. Roll to see which side charges, and fight the battle as normal. If the warrior loses, roll to see whether he is dead or injured (ie, a D66 roll of 11-35). If he is not dead, he is thrown out of the fighting pits without his armour and weapons and may re-join his warband. If the warrior wins he gains 50 gc, +2 Experience and is free to rejoin his warband with all his weapons and equipment.",
		outcome: "other",
	},
	{
		enumValue: "survive_against_odds",
		roll: 66,
		name: "Survives Against the Odds",
		description:
			"The warrior survives and rejoins his warband. He gains +1 Experience.",
		outcome: "other",
	},
];

/**
 * Map for O(1) lookup of injuries by enum value
 */
const injuriesByEnum = new Map<InjuryType, SeriousInjury>(
	seriousInjuries.map((injury) => [injury.enumValue, injury]),
);

/**
 * Convert an injury name to the enum value
 * @param name - The injury name (e.g., "Dead", "Leg Wound")
 * @returns The snake_case enum value or undefined if not found
 */
export function injuryNameToEnum(name: string): InjuryType | undefined {
	const enumValue = name.toLowerCase().replace(/\s+/g, "_").replace(/'/g, "");

	return INJURY_TYPES.includes(enumValue as InjuryType)
		? (enumValue as InjuryType)
		: undefined;
}

/**
 * Convert an enum value to a display name
 * @param enumValue - The snake_case enum value
 * @returns The formatted display name
 */
export function injuryEnumToDisplayName(enumValue: InjuryType): string {
	const injury = injuriesByEnum.get(enumValue);
	return (
		injury?.name ??
		enumValue
			.split("_")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ")
	);
}

/**
 * Get injury description by enum value
 * @param enumValue - The snake_case enum value
 * @returns The injury description or undefined if not found
 */
export function getInjuryDescription(
	enumValue: InjuryType,
): string | undefined {
	return injuriesByEnum.get(enumValue)?.description;
}

/**
 * Get injury roll by enum value
 * @param enumValue - The snake_case enum value
 * @returns The injury roll (number or range) or undefined if not found
 */
export function getInjuryRoll(enumValue: InjuryType): InjuryRoll | undefined {
	return injuriesByEnum.get(enumValue)?.roll;
}

/**
 * Get injury outcome by enum value
 * @param enumValue - The snake_case enum value
 * @returns The injury outcome ("dead", "injured", or "other") or undefined if not found
 */
export function getInjuryOutcome(
	enumValue: InjuryType,
): "dead" | "injured" | "other" | undefined {
	return injuriesByEnum.get(enumValue)?.outcome;
}

/**
 * Get comprehensive injury information by enum value
 * @param enumValue - The snake_case enum value
 * @returns Complete injury information or undefined if not found
 */
export function getInjuryInfo(enumValue: InjuryType): InjuryInfo | undefined {
	const injury = injuriesByEnum.get(enumValue);
	if (!injury) return undefined;

	return {
		enumValue,
		name: injury.name,
		description: injury.description,
		roll: injury.roll,
		outcome: injury.outcome,
		statEffect: injury.statEffect,
	};
}

/**
 * Get injury options for select components
 * Maps serious injuries data to select options with enum values
 */
export function getInjuryOptions() {
	return seriousInjuries.map((injury) => ({
		value: injury.enumValue,
		label: injury.name,
		description: injury.description,
	}));
}

/**
 * Get all injury types as select options (for forms that need "None" option)
 */
export function getInjuryTypeSelectOptions(includeNone = false) {
	const options = INJURY_TYPES.map((value) => ({
		value,
		label: injuryEnumToDisplayName(value),
	}));

	if (includeNone) {
		return [{ value: "", label: "None" }, ...options];
	}

	return options;
}

/**
 * Helper function to check if a roll matches an injury entry
 * @param roll - The D66 roll (11-66)
 * @param injuryRoll - The injury roll value (single number or range)
 * @returns true if the roll matches
 */
export function matchesRoll(roll: number, injuryRoll: InjuryRoll): boolean {
	if (typeof injuryRoll === "number") {
		return roll === injuryRoll;
	}
	return roll >= injuryRoll[0] && roll <= injuryRoll[1];
}

/**
 * Get the injury result for a given D66 roll
 * @param roll - The D66 roll (11-66)
 * @returns The matching serious injury, or undefined if not found
 */
export function getInjuryByRoll(roll: number): SeriousInjury | undefined {
	return seriousInjuries.find((injury) => matchesRoll(roll, injury.roll));
}
