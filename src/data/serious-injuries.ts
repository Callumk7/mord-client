/**
 * Mordheim Serious Injuries Chart
 * Roll 2D6 for tens and ones to get result on D66 table
 */

export type InjuryRoll = number | [number, number];

export type SubRollOutcome = {
	roll: InjuryRoll;
	effect: string;
};

export type SubRoll = {
	dice: string;
	description?: string;
	outcomes: SubRollOutcome[];
};

export type SeriousInjury = {
	roll: InjuryRoll;
	name: string;
	description: string;
	statEffect?: string;
	subRoll?: SubRoll;
};

export const seriousInjuries: SeriousInjury[] = [
	{
		roll: [11, 15],
		name: "Dead",
		description:
			"The warrior is dead and his body is abandoned in the dark alleys of Mordheim, never to be found again. All the weapons and equipment he carried are lost. Remove him from the warband's roster.",
	},
	{
		roll: [16, 21],
		name: "Multiple Injuries",
		description:
			"The warrior is not dead but has suffered a lot of wounds. Roll D6 times on this table. Re-roll any 'Dead', 'Captured' and further 'Multiple Injuries' results.",
	},
	{
		roll: 22,
		name: "Leg Wound",
		description: "The warrior's leg is broken.",
		statEffect: "-1 Movement",
	},
	{
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
	},
	{
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
	},
	{
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
	},
	{
		roll: 26,
		name: "Chest Wound",
		description:
			"The warrior has been badly wounded in the chest. He recovers but is weakened by the injury.",
		statEffect: "-1 Toughness",
	},
	{
		roll: 31,
		name: "Blinded in One Eye",
		description:
			"The warrior survives but loses the sight in one eye (randomly determine which). If the warrior is subsequently blinded in his remaining good eye he must retire from the warband.",
		statEffect: "-1 Ballistic Skill",
	},
	{
		roll: 32,
		name: "Old Battle Wound",
		description:
			"The warrior survives, but his wound will prevent him from fighting if you roll a 1 on a D6 at the start of any battle. Roll at the start of each battle from now on.",
	},
	{
		roll: 33,
		name: "Nervous Condition",
		description: "The warrior's nervous system has been damaged.",
		statEffect: "-1 Initiative",
	},
	{
		roll: 34,
		name: "Hand Injury",
		description: "The warrior's hand is badly injured.",
		statEffect: "-1 Weapon Skill",
	},
	{
		roll: 35,
		name: "Deep Wound",
		description:
			"The warrior has suffered a serious wound and must miss the next D3 games while he is recovering. He may do nothing at all while recovering.",
	},
	{
		roll: 36,
		name: "Robbed",
		description:
			"The warrior manages to escape, but all his weapons, armour and equipment are lost.",
	},
	{
		roll: [41, 55],
		name: "Full Recovery",
		description:
			"The warrior has been knocked unconscious, or suffers a light wound from which he makes a full recovery.",
	},
	{
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
	},
	{
		roll: 61,
		name: "Captured",
		description:
			"The warrior regains consciousness and finds himself held captive by the other warband. He may be ransomed at a price set by the captor or exchanged for one of their warband who is being held captive. Captives may be sold to slavers at a price of D6x5 gc. Undead may kill their captive and gain a new Zombie. The Possessed may sacrifice the prisoner. The leader of the warband will gain +1 Experience if they do so. Captives who are exchanged or ransomed retain all their weapons, armour and equipment; if captives are sold, killed or turned to Zombies, their weaponry, etc, is retained by their captors.",
	},
	{
		roll: [62, 63],
		name: "Hardened",
		description:
			"The warrior survives and becomes inured to the horrors of Mordheim. From now on he is immune to fear.",
	},
	{
		roll: 64,
		name: "Horrible Scars",
		description: "The warrior causes fear from now on.",
	},
	{
		roll: 65,
		name: "Sold to the Pits",
		description:
			"The warrior wakes up in the infamous fighting pits of Cutthroat's Haven and must fight against a Pit Fighter. See the Hired Swords section for full rules for Pit Fighters. Roll to see which side charges, and fight the battle as normal. If the warrior loses, roll to see whether he is dead or injured (ie, a D66 roll of 11-35). If he is not dead, he is thrown out of the fighting pits without his armour and weapons and may re-join his warband. If the warrior wins he gains 50 gc, +2 Experience and is free to rejoin his warband with all his weapons and equipment.",
	},
	{
		roll: 66,
		name: "Survives Against the Odds",
		description:
			"The warrior survives and rejoins his warband. He gains +1 Experience.",
	},
];

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
