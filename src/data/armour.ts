import type { Armor, Availability } from "./types";

export const armorItems: Armor[] = [
	{
		name: "Barding",
		source: "Blazing Saddles (1a)",
		cost: 80,
		availability: "Rare 8",
		save: "+1 to existing save",
		restrictions: ["Warhorses only"],
		specialRules: [
			{
				name: "Movement Penalty",
				description:
					"Armour, called barding, may be purchased for a warhorse. It adds a further +1 bonus to the model's armour save, but subtracts one from its Movement.",
			},
			{
				name: "Durability",
				description:
					"A normal horse may not wear barding. A barded warhorse is only killed on a serious injury roll of '1' if the model goes out of action.",
			},
		],
	},
	{
		name: "Bretonnian Barding",
		source: "Town Cryer #8 (1a)",
		cost: 30,
		availability: "Rare 11",
		save: "+1 to existing save",
		description:
			"Barding is armour for a horse in the same way that light armour is armour for a human. It covers the mount's hide, and in some cases, its head.",
		restrictions: ["Bretonnian Warhorses only"],
		specialRules: [
			{
				name: "Durability",
				description:
					"A model mounted on a barded horse receives an extra +1 to their armour save (+2 instead of the usual +1 for being mounted). In addition, a mount wearing barding will only be killed on a D6 roll of a 1 if the model is taken out of action (instead of a 1 or 2). Barding may only ever be bought for a warhorse.",
			},
		],
	},
	{
		name: "Buckler",
		source: "Mordheim Rulebook (core)",
		cost: 5,
		availability: "Common",
		save: "6+",
		description:
			"Bucklers are small, round shields designed for parrying or deflecting blows. They are usually made of steel for they need to be tremendously durable to survive the brutal blows of hand-to-hand combat. Using a buckler requires great skill, but a nimble warrior can protect himself from blows which would otherwise cripple him.",
		specialRules: [
			{
				name: "Parry",
				description:
					"A model equipped with a buckler may parry the first blow in each round of hand-to-hand combat. When his opponent scores a hit, a model with a buckler may roll 1D6. If the score is greater than the highest to hit score of his opponent, the model has parried the blow, and that attack is discarded. A model may not parry attacks made with double or more its own Strength – they are simply too powerful to be stopped.",
			},
		],
	},
	{
		name: "Chaos Armour",
		source: "Border Town Burning supplement (1c)",
		cost: 185,
		availability: "Rare 13",
		save: "4+",
		description:
			"Chaos Armour is a suit of strangely-worked and unnatural metal. It is the mark of a Dark God's favour. While most suits of Chaos Armour are received as Gifts from an Infernal Patron, they can be acquired, though only from Chaos Dwarfs in an exclusive exchange for many captives or perhaps some impossible deed to further their interests.",
		restrictions: [
			"Marauders of Chaos",
			"Norse",
			"Beastmen",
			"Chaos Dwarfs",
			"Possessed",
			"Carnival of Chaos only",
		],
		specialRules: [
			{
				name: "Rarity",
				description:
					"When searching for Chaos armour a warrior gains +1 on his Rarity roll for each model he took out of action in the previous battle.",
			},
			{
				name: "Cost",
				description:
					"The cost for found Chaos armour is decreased by 1 gold crown for each Experience point the Hero has.",
			},
			{
				name: "Gift of Chaos",
				description:
					"Chaos armour is a gift from the Dark Gods to the worthy warrior. A Hero who has successfully purchased a suit of Chaos armour will never give it away to another warband member but put it on himself immediately. Chaos armour becomes fused to the body of its wearer. It can never be removed.",
			},
			{
				name: "Spellcasters",
				description:
					"Chaos armour does not hinder its wearer from casting spells or rituals. It can be worn by spellcasters but they cannot combine it with a shield or buckler without appropriate skills.",
			},
			{
				name: "Movement Penalty",
				description:
					"There is no Movement penalty for combining Chaos Armour with a Shield.",
			},
		],
	},
	{
		name: "Cooking Pot Helmet",
		source: "Citadel Journal 36 (1b)",
		cost: 10,
		availability: "Common",
		save: "6+",
		description:
			"Any Master Chef worth his salt will remove his silly white hat and put on an even sillier looking cooking pot for protection when a fight is brewing. It may look incredibly stupid, but often results in an intact Halfling head after the battle.",
		restrictions: ["Mootlanders only"],
		specialRules: [
			{
				name: "Avoid Stun",
				description:
					"A Master Chef equipped with a cooking pot helmet has a special save of 5+ against being stunned. This save is never modified.",
			},
		],
	},
	{
		name: "Gromril Armour",
		source: "Mordheim Rulebook (core)",
		cost: 150,
		availability: "Rare 11",
		save: "4+",
		description:
			"Gromril is the rarest and strongest metal known of in the Old World. Only a very few Dwarf smiths know the secret of forging gromril, and a suit of armour made from it fetches a huge price.",
		specialRules: [
			{
				name: "Movement Penalty",
				description:
					"Gromril armour gives the wearer a 4+ basic save, and does not slow him down if he is also armed with a shield.",
			},
		],
	},
	{
		name: "Heavy Armour",
		source: "Mordheim Rulebook (core)",
		cost: 50,
		availability: "Common",
		save: "5+",
		description:
			"Typical heavy armour is made from metal links and is called chain mail. Forging chain mail is a laborious and time consuming process, as the blacksmith must put together hundreds, sometimes thousands, of metal links. This makes chain mail expensive, but this type of armour provides excellent protection for anyone who can afford it. There are other types of heavy armour as well, of which the best known are the steel breastplates and greaves worn by the foot knights of the Templar orders.",
		specialRules: [
			{
				name: "Movement Penalty",
				description:
					"A warrior that is armed with both heavy armour and a shield suffers a -1 Movement penalty",
			},
		],
	},
	{
		name: "Helmet",
		source: "Mordheim Rulebook (core)",
		cost: 10,
		availability: "Common",
		save: "6+",
		description:
			"From the shining steel helmets of Bretonnian knights to the leather caps of the Skaven, all sensible warriors try to protect the most vulnerable part of their body – their head. Even the most vain fighters still use a helmet, as it can be festooned with plumes, horns and other decorations. Helmets come in varying shapes and sizes, but their basic function remains the same.",
		specialRules: [
			{
				name: "Avoid Stun",
				description:
					"A model that is equipped with a helmet has a special 4+ save on a D6 against being stunned. If the save is made, treat the stunned result as knocked down instead. This save is not modified by the opponent's Strength.",
			},
		],
	},
	{
		name: "Ithilmar Armour",
		source: "Mordheim Rulebook (core)",
		cost: 90,
		availability: "Rare 11",
		save: "5+",
		description:
			"Ithilmar is a silvery metal which is as light as silk and stronger than steel. Elves are experts at fashioning weapons and armour from ithilmar, and the Elven kingdom of Caledor is the only place in the world where this metal can be found.",
		specialRules: [
			{
				name: "Movement Penalty",
				description:
					"Ithilmar armour gives the wearer a 5+ basic save, and does not slow him down if he is also armed with a shield.",
			},
		],
	},
	{
		name: "Kite Shield",
		source: "Bretonnian Chapel Guard (1c)",
		cost: 10,
		availability: "Common",
		save: "5+ on foot, 6+ mounted",
		restrictions: ["Bretonnian Chapel Guard Knights only"],
		specialRules: [
			{
				name: "Save",
				description:
					"A model with a kite shield has a basic save of 5+ on a D6 while on foot, and 6+ while mounted (or, if the model is already wearing armour, as +2 on foot, and +1 save while mounted). This cannot bring a save over 1+.",
			},
		],
	},
	{
		name: "Lamellar Armour",
		source: "Border Town Burning supplement (1c)",
		cost: 120,
		availability: "Rare 9",
		save: "4+",
		description:
			"The blacksmiths forge these heavy armours for in Cathay those noble knights protect the farmsteads. Especially among the Palace Guard of the Cathayan Emperor the plate armour is very common. The armour covers not only its wearer's torso but also the upper arm and thigh.",
		specialRules: [
			{
				name: "Movement Penalty",
				description:
					"A warrior that is armed with both a lamellar armour and a shield suffers a –1 Movement penalty.",
			},
		],
	},
	{
		name: "Light Armour",
		source: "Mordheim Rulebook (core)",
		cost: 20,
		availability: "Common",
		save: "6+",
		description:
			"Light Armour encompasses a wide variety of materials from hardened leather tunics to chain shirts forged from steel. It does not offer complete protection against arrows or swords, but it is better than having nothing at all. Light armour does not inhibit movement.",
		specialRules: [
			{
				name: "Movement Penalty",
				description: "No penalty when worn with a shield.",
			},
		],
	},
	{
		name: "Mechanical Suit",
		source: "Border Town Burning supplement (1c)",
		cost: 225,
		availability: "Rare 14",
		save: "4+",
		description:
			"The Curse of Stone comes to all Chaos Dwarf Sorcerers, gradually transforming them to rock from the feet up. Engineers have crafted machines which can transport their Priests as they begin to pay the price for working dark rituals.",
		restrictions: ["Chaos Dwarfs only"],
		specialRules: [
			{
				name: "Rarity",
				description:
					"When searching for Chaos armour a warrior gains +1 on his Rarity roll for each model he took out of action in the previous battle.",
			},
			{
				name: "Cost",
				description:
					"The cost for found Chaos armour is decreased by 1 gold crown for each Experience point the Hero has.",
			},
			{
				name: "Gift of Chaos",
				description:
					"Chaos armour is a gift from the Dark Gods to the worthy warrior. A Hero who has successfully purchased a suit of Chaos armour will never give it away to another warband member but put it on himself immediately. Chaos armour becomes fused to the body of its wearer. It can never be removed.",
			},
			{
				name: "Spellcasters",
				description:
					"Chaos armour does not hinder its wearer from casting spells or rituals. It can be worn by spellcasters but they cannot combine it with a shield or buckler without appropriate skills.",
			},
			{
				name: "Suited and Booted",
				description:
					"A Sorcerer equipped with a Mechanical suit receives +3 to Movement.",
			},
			{
				name: "Movement Penalty",
				description:
					"There is no Movement penalty for combining Chaos Armour with a Shield.",
			},
		],
	},
	{
		name: "Pavise",
		source: "Ye Old Curiosity Shoppe, Mordheim Annual 2002 (1a)",
		cost: 25,
		availability: "Rare 8",
		save: "6+",
		description:
			"A pavise is a huge shield commonly used by regiments of warriors in battle to defend themselves from the arrows of their enemies. It is a weighty item and little use in a long protracted combat but excellent against shooting.",
		specialRules: [
			{
				name: "Cover",
				description:
					"A warrior using a pavise counts as if he is in cover against missile attacks (-1 to hit). In close combat, The pavise counts as a shield (+1 armour save) but only if the warrior was charged to his front.",
			},
			{
				name: "Combined Save",
				description:
					"As explained in the Armour section, shields combine with armour to give +1 to the save.",
			},
			{
				name: "Movement Penalty",
				description:
					"Because the Pavise is so heavy and cumbersome, the bearer moves at half pace.",
			},
		],
	},
	{
		name: "Shield",
		source: "Mordheim Rulebook (core)",
		cost: 5,
		availability: "Common",
		save: "6+",
		description:
			"There are two types of shield common to the warriors of Mordheim: the first is made of wood, occasionally reinforced with metal plates. This basic type of shield, although strong, does tend to splinter, but this can sometimes save the user's life as his enemy's weapon can get trapped allowing him to strike back whilst his enemy struggles to free his weapon. Metal shields are heavy and cumbersome, but last much longer and can take a battering. A typical Empire shield is either round or triangular, and carries the emblem of the province or city of its owner.",
		specialRules: [
			{
				name: "Combined Save",
				description:
					"As explained in the Armour section, shields combine with armour to give +1 to the save.",
			},
			{
				name: "Movement Penalty",
				description: "There is no movement penalty.",
			},
		],
	},
	{
		name: "Toughened Leathers",
		source: "Opulent Goods, Mordheim Annual 2002 (1a)",
		cost: 5,
		availability: "Common",
		save: "6+",
		description:
			"Expert leatherworkers are able to turn leather coats into armour (after a fashion) and those with limited funds often favor these jackets and coats as armour is very expensive. Covered with crusted salt, alcohol and other less savory materials, toughened leather is hard to penetrate and offers some protection in combat.",
		specialRules: [
			{
				name: "Compatibility",
				description:
					"Toughened leathers cannot be combined with the effects of any other armour except a helmet or buckler (so not a shield).",
			},
			{
				name: "Sellback",
				description:
					"Toughened leathers cannot be sold back at the Trading Posts; the stench alone is enough to drive away even the most desperate of buyers!",
			},
			{
				name: "Spell Casting",
				description:
					"Even though Toughened Leathers are purchased as miscellaneous equipment and need not be listed on a Hero's starting armour list to be taken, they are still armour and prevent spell casting.",
			},
		],
	},
];

// Helper type for accessing armor by name
export type ArmorName = (typeof armorItems)[number]["name"];

// Helper function to get armor by name
export function getArmorByName(name: ArmorName): Armor | undefined {
	return armorItems.find((armor) => armor.name === name);
}

// Helper function to filter armor by availability
export function getArmorByAvailability(availability: Availability): Armor[] {
	return armorItems.filter((armor) => armor.availability === availability);
}

// Helper function to get common armor
export function getCommonArmor(): Armor[] {
	return armorItems.filter((armor) => armor.availability === "Common");
}

// Helper function to get armor by max cost
export function getArmorByMaxCost(maxCost: number): Armor[] {
	return armorItems.filter((armor) => armor.cost <= maxCost);
}
