import type { CloseCombatWeapon } from "./types";

export const closeCombatWeapons: CloseCombatWeapon[] = [
	{
		name: "Axe",
		source: "Mordheim Rulebook (core)",
		cost: 5,
		availability: "Common",
		description:
			"The axe is the traditional weapon of Empire woodsmen, and is also used as a weapon in poorer rural areas. Axes have a heavy blade and, if swung by a strong man, can cause a lot of damage. The blade of an axe can easily cut through armour, though it requires considerable strength from the wielder. Of all the warriors in the Old World, Dwarfs are the most adept at making axes. Their axes are invaluable to the warriors of the Old World and are some of the most sought after weapons.",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "Cutting Edge",
				description:
					"An axe has an extra save modifier of -1, so a model with Strength 4 using an axe has a -2 save modifier when he hits an opponent in hand-to-hand combat.",
			},
		],
	},
	{
		name: "Ball and Chain",
		source: "Town Cryer #6 (1a)",
		cost: 15,
		availability: "Common",
		restrictions: "Goblins only",
		description:
			"This is a huge iron ball with a chain attached, used by the dreaded Night Goblin Fanatics to deal out whirling death. Enormously heavy, it can only be used when combined with Mad Cap Mushrooms.",
		range: "Close Combat",
		strength: "As user +2",
		specialRules: [
			{
				name: "Incredible Force",
				description:
					"Because the Ball and Chain is so heavy, normal armour does very little to protect against it. No armour saves are allowed against wounds caused by a Ball and Chain. In addition, any hit from a Ball and Chain is very likely to take off someone's head (or at least break some ribs!). Therefore, any hit that successfully wounds will do 1D3 wounds instead of 1.",
			},
			{
				name: "Random",
				description:
					'The only way to wield a Ball and Chain is to swing it around in large circles, using your body as a counter-weight. Unfortunately this is not a very controllable fighting style, and as soon as he starts swinging his Ball and Chain, a warrior starts to lose control. The first turn he starts swinging the Ball and Chain, the model is moved 2D6" in a direction nominated by the controlling player. In his subsequent Movement phases, roll a D6 to determine what the model does.',
			},
			{
				name: "Cumbersome",
				description:
					"Because the Ball and Chain is so heavy, a model equipped with one may carry no other weapons or equipment. In addition, only a model under the influence of Mad Cap Mushrooms has the strength to wield a ball and chain.",
			},
			{
				name: "Unwieldy",
				description:
					"The great weight of the Ball and Chain can easily tear ligaments or pull a wielder's arms out of their sockets. While someone under the influence of Mad Cap Mushrooms will not notice such effects, when the drug wears off he will be in great pain. To represent this, at the end of the battle the controlling player must roll for Injury for each model that used a Ball and Chain, just as if the model had been taken out of action.",
			},
		],
	},
	{
		name: "Barbed Whip",
		source: "Border Town Burning (1c)",
		cost: 15,
		availability: "Rare 9",
		restrictions: "One Marauders of Chaos Hero only",
		description:
			"Originally used for taming the wild Chaos Hounds the barbed whips have proven effective in combat also.",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "Whipcrack",
				description:
					"When the wielder charges they gain +1A for that turn. This bonus attack is added after any other modifications. When the wielder is charged they gain +1A that they may only use against the charger. This additional attack will 'strike first'. If the wielder is simultaneously charged by two or more opponents they will still only receive a total of +1A.",
			},
			{
				name: "Cannot Be Parried",
				description:
					"A model attacked by a barbed whip may not parry with a sword or buckler.",
			},
			{
				name: "Enrage",
				description:
					'The Hero may use his whip to make the Warhounds charge wildly. As long as he is not involved in close combat all Warhounds of Chaos within 4" gain +1 attack.',
			},
		],
	},
	{
		name: "Beastlash",
		source: "Town Cryer #12 (1b)",
		cost: 10,
		availability: "Rare 8",
		restrictions: "Dark Elves Beastmaster only",
		description:
			"The Beastmaster make good use of their whips to goad their hounds and creatures into combat.",
		range: "Close Combat",
		strength: "As user -1",
		specialRules: [
			{
				name: "Beastbane",
				description:
					"The Beastmaster wielding a Beastlash causes Fear in animals, any animal charged or wishing to charge a Beastmaster with one of these weapons must first take a Fear test as mentioned in the psychology section of the Mordheim rules.",
			},
			{
				name: "Cannot Be Parried",
				description:
					"The Beastlash is a flexible weapon and the Beastmaster use it with great expertise. Attempts to parry its strikes are futile. A model attacked by a Beastlash may not make parries with swords or bucklers.",
			},
			{
				name: "Whipcrack",
				description:
					"When the wielder charges they gain +1A for that turn. This bonus attack is added after any other modifications. When the wielder is charged they gain +1A that they may only use against the charger. This additional attack will 'strike first'.",
			},
		],
	},
	{
		name: "Boat Hook",
		source: "Town Cryer #9 (1b)",
		cost: 8,
		availability: "Common",
		restrictions: "Pirates only",
		description:
			"These are normally used to pull in ropes or other objects from the water, but their long reach and wicked metal catches makes them also useful in combat.",
		range: "Close Combat",
		strength: "As user -1",
		specialRules: [
			{
				name: "Strike First",
				description:
					"Boat Hooks are used in Close Combat. They allow the user to Strike First in the first round of any close combat, no matter which model charged, but require both hands to use.",
			},
			{
				name: "Two Handed",
				description:
					"Models using a Boat Hook in combat cannot use any other weapons, or gain benefit from a shield or buckler, while in close combat.",
			},
		],
	},
	{
		name: "Boss Pole",
		source: "Nemesis Crown Supplement (1b)",
		cost: 20,
		availability: "Common",
		restrictions: "Forest and Night Goblins only",
		description:
			'Some influential Goblins carry badges of office, usually taking the form of long wooden poles with an icon or sharp blade on the end. This allows the hero and any Goblin henchmen within 6" to ignore animosity. Additionally, the Boss Pole acts as a spear in close combat.',
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "Strike First",
				description:
					"A warrior with a spear strikes first, even if charged. Note that this only applies in the first turn of hand-to-hand combat.",
			},
			{
				name: "Unwieldy",
				description:
					"A warrior with a spear may only use a shield or a buckler in his other hand. He may not use a second weapon.",
			},
			{
				name: "Cavalry Bonus",
				description:
					"If using the optional rules for mounted models, a mounted warrior armed with a spear receives a +1 Strength bonus when he charges. This bonus only applies for that turn.",
			},
			{
				name: "Ignore Animosity",
				description: 'Heroes and henchmen within 6" ignore Animosity.',
			},
		],
	},
	{
		name: "Brass Knuckles",
		source: "Ye Old Curiosity Shoppe, Town Cryer 7 (1b)",
		cost: 20,
		availability: "Rare 6",
		restrictions: "Always bought in pairs",
		description:
			"Brass knuckles are a weapon commonly used by streets thugs and robbers who are all too common an infestation in the mighty cities of the Empire. Easily secreted, they are used in pairs and while cumbersome to use in a straight fight, can cause crippling blows to an opponent with a single well landed punch.",
		range: "Close Combat",
		strength: "As user +1",
		specialRules: [
			{
				name: "Pair",
				description:
					"Brass knuckles are used in pairs and the warrior fighting with them gains an extra Attack. He may not use any other weapons or items in his hands while doing this however.",
			},
			{
				name: "Cumbersome",
				description:
					"Brass knuckles are difficult to use due to the fact that they offer little in the way of range and a warrior must get close up to his opponent before he can strike. For this reason a warrior using brass knuckles suffers a -2 to Initiative in close combat.",
			},
		],
	},
	{
		name: "Brazier Iron",
		source: "Ye Old Curiosity Shoppe, Mordheim Annual 2002 (1a)",
		cost: 35,
		availability: "Rare 7",
		restrictions: "Witch Hunters only",
		description:
			"The brazier Iron is a weapon commonly used by witch hunters. It consists of a long heft topped by an iron cup filled with burning hot coals. In combat, the weapon takes on an eldritch quality as the burning embers sear the air as it is swung, opponents sent reeling in flaming agony as they are set on fire.",
		range: "Close Combat",
		strength: "As user +1",
		specialRules: [
			{
				name: "Two handed",
				description:
					"A warrior armed with a brazier staff requires two hands to wield it effectively and so may not use a shield with it or another hand weapon or buckler in close combat.",
			},
			{
				name: "Fire",
				description:
					"The burning brazier of coals atop the staff is deadly, capable of setting an opponent ablaze with even the slightest glancing blow. Whenever you score a successful hit with the brazier staff roll a D6. If you roll a 5+ the victim is set on fire.",
			},
		],
	},
	{
		name: "Broadsword",
		source: "Bretonnian Chapel Guard (1c)",
		cost: 15,
		availability: "Common",
		restrictions: "Bretonnian Chapel Guard Knights only",
		description: "",
		range: "Close Combat",
		strength: "As user +1",
		specialRules: [
			{
				name: "Difficult to use",
				description:
					"A model with a Broadsword may not use a second weapon or buckler in his other hand because it requires all his skill to wield it. He may carry a shield or a kite shield as normal though.",
			},
			{
				name: "Strike last",
				description:
					"Broadswords are so heavy that the model using them always strikes last, even when charging. Just like a Double-Handed weapon, learning the skill 'Strongman' negates 'Strike Last'.",
			},
		],
	},
	{
		name: "Cat O' Nine Tails",
		source: "Town Cryer #9 (1b)",
		cost: 8,
		availability: "Common",
		restrictions: "Pirate Heroes only",
		description:
			"Order is often maintained aboard the ship with the threat of the lash. In battle the long barbed whip of the Cat is also seen, but this time dealing out punishment to the enemy!",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "Cannot be parried",
				description:
					"Like the Steel Whips of the Sisterhood, Cats cannot be parried by swords or bucklers.",
			},
			{
				name: "Weak",
				description:
					"Since they are made of rope and not steel, they give the enemy model a +1 to his armour save (6+ for no armour), like a hit from a fist or dagger.",
			},
			{
				name: "Whipcrack",
				description:
					"When the wielder charges they gain +1A for that turn. When the wielder is charged they gain +1A that they may only use against the charger. This additional attack will 'strike first'.",
			},
		],
	},
	{
		name: "Cathayan Longsword",
		source: "Border Town Burning Supplement (1c)",
		cost: 75,
		availability: "Rare 12",
		description:
			"Prized indeed are blades of Ithilmar forged by Elves. Even more masterful are the arms crafted by swordsmiths in Cathay. Known as a Jintachi blade among Estalian merchants, the Cathayan longsword is a deadly crown jewel in the hands of a skilled fighter.",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "Mastercrafted",
				description:
					"Attacks made with a Cathayan longsword give the bearer +1 Initiative and +1 Weapon Skill.",
			},
		],
	},
	{
		name: "Censer",
		source: "Town Cryer #29 (1b)",
		cost: 40,
		availability: "Rare 9",
		restrictions: "Skaven of Clan Pestilens only",
		description:
			"The censer is a hollow spiked metal ball attached to a long chain and is swung like a flail. A plague infested shard of warpstone burns inside the ball and emits pestilential fumes that nauseate the opponents and may turn the wielder of the censer into a difficult target to shoot at.",
		range: "Close Combat",
		strength: "As user +2",
		specialRules: [
			{
				name: "Heavy",
				description:
					"The +2 Strength bonus applies only to the first turn of hand to hand combat.",
			},
			{
				name: "Two-handed",
				description:
					"A censer requires two hands to be used and the wielder cannot use a shield, buckler or additional weapon in close combat.",
			},
			{
				name: "Fog of Death",
				description:
					"A model hit by the censer must take a Toughness test. If the result is higher than the Toughness of the model taking the test, he will suffer an automatic wound in addition to the censer hit. Models of undead and possessed are immune to the fog of death.",
			},
		],
	},
	{
		name: "Chain Sticks",
		source: "Border Town Burning (1c)",
		cost: 20,
		availability: "Rare 7",
		restrictions: "Battle Monks of Cathay only",
		description: "",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "Flurry",
				description:
					"A set of chain sticks allows its wielder to unleash a furious bludgeoning. A warrior armed with chain sticks gets +2 Attacks. This bonus only applies in the first turn of each hand-to-hard combat.",
			},
			{
				name: "Two-handed",
				description: "Requires two hands to wield",
			},
		],
	},
	{
		name: "Claw of the Old Ones",
		source: "Town Cryer #23 (1b)",
		cost: 30,
		availability: "Rare 12",
		restrictions: "Amazons (Mordheim) only",
		description:
			"This is a very ancient weapon made from a strange metal that is impervious to age and corrosion. The powers of this artefact can only be unleashed through a ritual known only to a handful of Amazons. The blade of this weapon glows white hot and can cut through armour as if it were paper.",
		range: "Close Combat",
		strength: "As user +1",
		specialRules: [
			{
				name: "No save",
				description:
					"The blade of the Claw can literally cut through anything. A warrior wounded by a Claw receives no armour save whatsoever.",
			},
		],
	},
	{
		name: "Cleaver",
		source: "Citadel Journal 36 (1b)",
		cost: 3,
		availability: "Common",
		restrictions: "Mootlanders only",
		description:
			"Cleavers are one of the best kitchen tools for fighting with, it's fairly light and can cut through things rather like an axe.",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "-1 Save",
				description: "Target gets -1 to armour save",
			},
		],
	},
	{
		name: "Club, Mace or Hammer",
		source: "Mordheim Rulebook (core)",
		cost: 3,
		availability: "Common",
		description:
			"Perhaps the simplest type of weapon, these brutal, bludgeoning instruments range from primitive wooden clubs to elaborately forged Dwarf hammers made from the finest steel. A blow from a mace can easily crush a skull or knock a man unconscious.",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "Concussion",
				description:
					"Hammers and other bludgeoning weapons are excellent to use for striking your enemy senseless. When using a hammer, club or mace, a roll of 2-4 is treated as stunned when rolling to see the extent of a model's injuries.",
			},
		],
	},
	{
		name: "Dagger",
		source: "Mordheim Rulebook (core)",
		cost: 2,
		availability: "Common",
		description:
			"Daggers and knives are extremely common, and men are allowed to carry them in enclaves where weapons are otherwise forbidden. Many a warrior in Mordheim has died with a dagger in his back.",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "+1 Enemy armour save",
				description:
					"Daggers are not the best weapons to use for penetrating an enemy model's armour. An enemy wounded by a dagger gains a +1 bonus to his armour save, and a 6+ armour save if he has none normally.",
			},
		],
	},
	{
		name: "Dark Elf Blade",
		source: "Town Cryer #12 (1b)",
		cost: 20,
		availability: "Rare 9",
		restrictions: "Dark Elves only",
		description:
			"Dark Elf Blades are forged in the city of Hag Graef, the Dark Crag. They are fashioned from Blacksteel, a rare form of steel found deep within the mountains around the city. Dark Elf Blades have wicked protrusions and serrated edges, which inflict serious damage on an opponent.",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "Critical Damage",
				description:
					"Dark Elf Blades inflict serious damage on their opponents. When rolling on the critical hit chart a Dark Elf Blade will add +1 to the result.",
			},
			{
				name: "Wicked Edge",
				description:
					"Dark Elf Blades are set with sharp protrusions and serrated edges which inflict serious damage on an opponent. A roll of 2-4 on the injury table is a Stunned result.",
			},
		],
	},
	{
		name: "Disease Dagger",
		source: "Town Cryer #29 (1b)",
		cost: 15,
		availability: "Rare 8",
		restrictions: "Skaven of Clan Pestilens only",
		description:
			"This dagger is permanently covered with a disgusting and moulderish layer of green ooze that may infect those that are hit with terrible diseases.",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "+1 Enemy Armour Save",
				description:
					"Daggers are not the best weapons to use for penetrating an enemy model's armour. An enemy wounded by a dagger gains a +1 bonus to his armour save, and a 6+ armour save if he has none normally.",
			},
			{
				name: "Infecting",
				description:
					"A natural 6 on an hit roll means that the model hit has been infected with the disease and that he must take a Toughness test. If the result is higher than the Toughness of the model taking the test, he will suffer an automatic wound in addition to the dagger hit. Models of undead and possessed are immune.",
			},
		],
	},
	{
		name: "Double-handed weapon",
		source: "Mordheim Rulebook (core)",
		cost: 15,
		availability: "Common",
		description:
			"A blow from a double-handed axe or sword can cut a foe in half and break armour apart. It takes a long time to learn how to use these weapons and even then only extremely strong men are able to wield them effectively.",
		range: "Close Combat",
		strength: "As user +2",
		specialRules: [
			{
				name: "Two-handed",
				description:
					"A model armed with a double-handed weapon may not use a shield, buckler or additional weapon in close combat. If the model is equipped with a shield he will still get a +1 bonus to his armour save against shooting.",
			},
			{
				name: "Strike last",
				description:
					"Double-handed weapons are so heavy that the model using them always strikes last, even when charging.",
			},
		],
	},
	{
		name: "Dragon Sword",
		source: "Border Town Burning Supplement (1c)",
		cost: 20,
		availability: "Rare 10",
		restrictions: "Battle Monks and Merchant Caravans only",
		description:
			"Dragon Swords are great-swords that are typically used by Cathayan soldiers and ronins, and occasionally lifted by monks.",
		range: "Close Combat",
		strength: "As user +1",
		specialRules: [
			{
				name: "Two-handed",
				description:
					"A model armed with a Dragon Sword may not use a shield, buckler or additional weapon in close combat. It gets an additional +1 armour save bonus against ranged attacks if it carries a shield.",
			},
			{
				name: "Parry",
				description:
					"Dragon Swords, despite their great size, can be used for parrying like a sword. A model may not parry attacks made with double or more its own Strength.",
			},
		],
	},
	{
		name: "Dwarf Axe",
		source: "Town Cryer #4 (1a)",
		cost: 15,
		availability: "Rare 8",
		restrictions: "Dwarfs only",
		description:
			"Dwarf axes are smaller-hafted weapons made of lighter (but stronger) materials than normal axes. Dwarf Warriors are specially trained in their use and are able to use them as deftly as a Human warrior might wield a sword.",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "Cutting Edge",
				description:
					"Dwarf axes have an extra save modifier of -1, so a model with Strength 4 using a Dwarf axe has a -2 save modifier when he hits an opponent with the axe in close combat.",
			},
			{
				name: "Parry",
				description:
					"Dwarf axes offer an excellent balance of defence and offense. A model armed with a Dwarf axe may parry blows. A model may not parry attacks made with double or more its own Strength.",
			},
		],
	},
	{
		name: "Fighting Claws",
		source: "Mordheim Rulebook (core)",
		cost: 35,
		availability: "Rare 7",
		restrictions: "Skaven only",
		description:
			"The martial arts practised by Clan Eshin employ many unusual weapons. The most famous of these are the Eshin Fighting Claws: sharp metal blades attached to the paws of a Skaven warrior. It takes a real expert to use them effectively, but an adept of Clan Eshin is a fearsome opponent when armed this way.",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "Pair",
				description:
					"Fighting Claws are traditionally used in pairs, one in each hand. A warrior armed with Fighting Claws gets an additional attack.",
			},
			{
				name: "Climb",
				description:
					"A Skaven equipped with Fighting Claws can add +1 to his Initiative when making Climbing tests.",
			},
			{
				name: "Parry",
				description:
					"A Skaven armed with Fighting Claws may parry blows and can re-roll a failed attempt once, in the same way as a model armed with a sword and buckler.",
			},
			{
				name: "Cumbersome",
				description:
					"A model armed with Fighting Claws may not use any other weapons in the entire battle.",
			},
		],
	},
	{
		name: "Fist",
		source: "Mordheim Rulebook (core)",
		cost: 0,
		availability: "Common",
		description:
			"The truly desperate, who don't even own a knife, have to fight with their bare hands. Warriors using their fists can only ever make 1 attack.",
		range: "Close Combat",
		strength: "As user -1",
		specialRules: [
			{
				name: "+1 Enemy armour save",
				description:
					"An enemy wounded by a fist gains a +1 bonus to his armour save, and a 6+ armour save if he normally has none.",
			},
		],
	},
	{
		name: "Flail",
		source: "Mordheim Rulebook (core)",
		cost: 15,
		availability: "Common",
		description:
			"The flail is a heavy weapon wielded with both hands. It normally consists of heavy weights, often spiked, attached to a pole or handle by means of heavy chains. Flails drain the user's stamina quickly, but are awesomely destructive in the hands of a skilled (or unhinged) warrior.",
		range: "Close Combat",
		strength: "As user +2",
		specialRules: [
			{
				name: "Heavy",
				description:
					"A flail is extremely tiring to use and thus the +2 Strength bonus applies only in the first turn of each hand-to-hand combat.",
			},
			{
				name: "Two-handed",
				description:
					"As a flail requires two hands to use, a model using a flail may not use a shield, buckler or additional weapon in close combat. If the model has a shield he still gets a +1 bonus to his armour save against shooting.",
			},
		],
	},
	{
		name: "Great Axe",
		source: "Border Town Burning (1c)",
		cost: 25,
		availability: "Rare 8",
		restrictions:
			"Marauders of Chaos Heroes with the Chosen of Chaos skill only",
		description:
			"These over-sized Battle Axes can be wielded only by the strongest of warriors.",
		range: "Close Combat",
		strength: "As user +2",
		specialRules: [
			{
				name: "Two-handed",
				description:
					"As a great axe requires two hands to use, a model using a great axe may not use a shield, buckler or additional weapon in close combat.",
			},
			{
				name: "Strike last",
				description:
					"Great Axes are so heavy that the model using them always strikes last, even when charging, unless it has the Strongman skill.",
			},
			{
				name: "Cutting Edge",
				description:
					"A Great Axe has an extra save modifier of -1, so a model with Strength 4 using a Chaos Battle Axe has a -4 save modifier in hand-to-hand combat.",
			},
		],
	},
	{
		name: "Gromril Weapon",
		source: "Mordheim Rulebook (core)",
		cost: 0,
		availability: "Rare 11",
		description:
			"Only a Dwarf Runesmith can forge a weapon from gromril, a rare meteoric iron. A blade fashioned from this metal will stay keen for a thousand years.",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "Gromril",
				description:
					"A gromril weapon has an extra -1 save modifier, and costs four times the price of a normal weapon of its kind.",
			},
		],
	},
	{
		name: "Halberd",
		source: "Mordheim Rulebook (core)",
		cost: 10,
		availability: "Common",
		description:
			"The halberd's heavy blade is mounted upon a sturdy shaft of oak or steel and has a point like a spear and a cutting edge like an axe. Since it can be used to chop as well as thrust, it is an adaptable weapon, but is difficult to use inside buildings.",
		range: "Close Combat",
		strength: "As user +1",
		specialRules: [
			{
				name: "Two-handed",
				description:
					"A model armed with a halberd may not use a shield, buckler or additional weapon in close combat. If the model has a shield he still gets a +1 bonus to his armour save against shooting.",
			},
		],
	},
	{
		name: "Hobgoblin Poisoned Daggers",
		source: "GW Troll Magazine (1c)",
		cost: 15,
		availability: "Rare 9",
		restrictions: "Hobgoblins only",
		description:
			'Hobgoblins, also called "slippery fellows", poison the blades of their daggers. Cunning and crafty, Hobgoblins are often employed by their masters as assassins, although they are rather cullable and unreliable troops.',
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "Pair",
				description:
					"Poisoned Daggers are traditionally used in pairs, one in each hand. A warrior armed with Poisoned Daggers gets an additional attack.",
			},
			{
				name: "Swift",
				description:
					"Hobgoblins armed with Poisoned Daggers count as having +1 Initiative when determining combat order.",
			},
			{
				name: "Poisoned",
				description:
					"The venom of Poisoned Daggers will enter the blood of the victim and ravage his organs and muscles. The weapons count as being permanently coated in Black Lotus.",
			},
			{
				name: "+1 Enemy Armour Save",
				description:
					"Poisoned Daggers count as daggers, and thus an enemy wounded by a dagger gains a +1 bonus to his armour save, and a 6+ armour save if he has none normally.",
			},
		],
	},
	{
		name: "Horseman's Hammer",
		source: "Empire in Flames Supplement, Town Crier 24 (1a)",
		cost: 12,
		availability: "Rare 10",
		description:
			"This is a great hammer similar to the ones used by Knights of the White Wolf. Far too bulky to use in one hand, a Horseman's Hammer is best suited to mounted combat, when the impetus of the horse may be used to add to the power of the weapon.",
		range: "Close Combat",
		strength: "As user +1",
		specialRules: [
			{
				name: "Two-handed",
				description:
					"A model armed with a Horseman's Hammer may not use a shield, buckler, or additional weapon in close combat. If the model is equipped with a shield he will still get a +1 bonus to his armour save against shooting.",
			},
			{
				name: "Cavalry Charge",
				description:
					"A model armed with a Horseman's Hammer may use the speed of his charge to increase the might of his attacks. A model on a steed with a Horseman's Hammer gains a further +1 Strength bonus when he charges. This bonus only applies for that turn.",
			},
		],
	},
	{
		name: "Iron Fist",
		source: "Border Town Burning supplement (1c)",
		cost: 15,
		availability: "Common",
		restrictions: "Maneaters only",
		description:
			"Ogres often shield their off-hand with some kind of spiked gauntlet. Such a heavy glove can be used to bat aside the strongest of attacks in a similar way to a giant buckler or to smash an enemy's face to a pulp.",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "Parry",
				description: "A model with an iron fist may parry enemy blows.",
			},
			{
				name: "Gloved",
				description:
					"A model armed with an iron fist may not hold another weapon in the same hand. This means a double-handed weapon cannot be used.",
			},
			{
				name: "Dual-role",
				description:
					"Iron fists operate like a buckler and a bladed hand weapon at the same time. This means that an iron fist allows the wearer to re-roll failed parry attempts if paired with a sword or another iron fist.",
			},
		],
	},
	{
		name: "Ithilmar Weapon",
		source: "Mordheim Rulebook (core)",
		cost: 0,
		availability: "Rare 9",
		description:
			"Elven blades are forged from priceless ithilmar, an extremely light but strong metal, found only in the fabled Elven kingdoms. A few of these weapons are occasionally found in the Old World and these are normally spoils of war, taken by the Norse raiders who pillage the coastal settlements of the Elves.",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "Ithilmar",
				description:
					"An ithilmar weapon gives its user +1 Initiative in hand-to-hand combat, and costs three times the price of a normal weapon of its kind.",
			},
		],
	},
	{
		name: "Katar",
		source: "Khemri setting, Town Cryer #18 (1b)",
		cost: 5,
		availability: "Rare 4",
		description:
			"This is an Arabian-style punch dagger. It has a handle perpendicular to the blade and is used in a punching thrusting manner.",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "-1 enemy armour save",
				description: "Target gets -1 to armour save",
			},
		],
	},
	{
		name: "Kitchen Knife",
		source: "Citadel Journal 36 (1b)",
		cost: 2,
		availability: "Common",
		restrictions: "Mootlanders only",
		description:
			"The common kitchen knife does not only have to be used for chopping vegetables, in the chubby but expert hands of a Master Chef it can make an awful mess of his enemies!",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "+1 Enemy armour save",
				description:
					"Daggers are not the best weapons to use for penetrating an enemy model's armour. An enemy wounded by a dagger gains a +1 bonus to his armour save, and a 6+ armour save if he has none normally.",
			},
		],
	},
	{
		name: "Ladle",
		source: "Citadel Journal 36 (1b)",
		cost: 2,
		availability: "Common",
		restrictions: "Mootlanders only",
		description:
			"A ladle isn't very good for killing your foes but if aimed correctly, a crack across the knuckles can seriously reduce even the best warrior's fighting ability.",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "No save except shields",
				description:
					"A Master Chef knows exactly where to aim his ladle, helmets and breast plates are of little use against a ladle whacked across the hands. The only saving throws allowed are from shields or skills.",
			},
			{
				name: "Knuckle Cracking",
				description:
					"If a Master Chef manages to hit an enemy in close combat and scores a '6' in doing so he has rapped his enemy across the knuckles and forced him to drop his weapon.",
			},
		],
	},
	{
		name: "Lance",
		source: "Mordheim Rulebook (core)",
		cost: 40,
		availability: "Rare 8",
		description:
			"Lances are long, heavy spears used by mounted shock troops to rip through armour and fling their foes to the ground. They are the chosen weapons of Knights Templar and other wealthy warriors. To use a lance requires great skill and strength, and only the richest warriors ride the heavy warhorses needed to wield these mighty weapons effectively.",
		range: "Close Combat",
		strength: "As user +2 when charging on horseback",
		specialRules: [
			{
				name: "Cavalry weapon",
				description:
					"A warrior must own a warhorse to use a lance, as it can only be used whilst he is on horseback.",
			},
			{
				name: "Cavalry bonus",
				description:
					"If using optional rules for mounted models, a warrior armed with a lance receives a +2 Strength bonus when he charges. This bonus only applies for that turn.",
			},
		],
	},
	{
		name: "Main Gauche",
		source: "Nemesis Crown Supplement (1b)",
		cost: 7,
		availability: "Rare 7",
		restrictions: "Hochland Bandits only",
		description:
			'A main gauche is a dagger with a large hand guard, often used in conjunction with a rapier or other sword. Popular among duellists and petty nobles, the main gauche is sometimes seen as a "foppish" weapon, but in reality it provides the wielder the ability to be strong both in attack and defense.',
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "Parry",
				description: "Can parry enemy blows",
			},
			{
				name: "+1 Enemy Armour Save",
				description: "Target gets +1 to armour save",
			},
		],
	},
	{
		name: "Man-catcher",
		source: "Border Town Burning supplement (1c)",
		cost: 25,
		availability: "Rare 10",
		restrictions: "Chaos Dwarfs only",
		description:
			"Semi-circular prongs mounted on pole-arms are popular among the Gaolers of Zharr-Naggrund. This non-lethal spring loaded device can ensnare the most violent of prisoners.",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "Capture",
				description:
					"A model taken out of action by a Mancatcher becomes captured. Do not roll for Serious Injuries. Large models cannot be captured this way, and neither can animals.",
			},
			{
				name: "Two-handed",
				description: "Requires two hands to wield",
			},
		],
	},
	{
		name: "Misericordia",
		source: "Lustrian Reavers (1c)",
		cost: 10,
		availability: "Common",
		restrictions: "Lustrian Reavers only",
		description:
			"These long daggers have been specifically designed to kill downed opponents through chinks in armour, and piercing vulnerable spots such as eyes and the throat.",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "+1 Enemy armour save",
				description:
					"Daggers are not the best weapons to use for penetrating an enemy model's armour. An enemy wounded by a dagger gains a +1 bonus to his armour save, and a 6+ armour save if he has none normally.",
			},
			{
				name: "Armour Piercing",
				description:
					"When attacking enemies that are Knocked-Down you get to roll 2D6 and pick the highest number on 'to wound' roll.",
			},
		],
	},
	{
		name: "Morning Star",
		source: "Mordheim Rulebook (core)",
		cost: 15,
		availability: "Common",
		description:
			"A morning star consists of a wooden or steel shaft with heavy chains that have spiked steel balls attached. It is very destructive and requires great skill to wield effectively.",
		range: "Close Combat",
		strength: "As user +1",
		specialRules: [
			{
				name: "Heavy",
				description:
					"The morning star is extremely tiring to use, so its +1 Strength bonus applies only in the first turn of each hand-to-hand combat.",
			},
			{
				name: "Difficult to use",
				description:
					"A model with a morning star may not use a second weapon or buckler in his other hand because it requires all his skill to wield it. He may carry a shield as normal though.",
			},
		],
	},
	{
		name: "Obsidian Weapon",
		source: "Border Town Burning (1c)",
		cost: 0,
		availability: "Rare 12",
		restrictions:
			"Marauders of Chaos, Norse, Beastmen, Chaos Dwarfs, Possessed and Carnival of Chaos only",
		description:
			"Obsidian is mined in the Dark Lands by the minions of Chaos. When expertly derived from its ore, the curious volcanic rock becomes ensorcelled by engineers manufacturing artefacts in the furnaces of Zharr-Naggrund.",
		range: "Close Combat",
		strength: "As User +1",
		specialRules: [
			{
				name: "Blemished",
				description:
					"Although not strictly tainted by Chaos, all artefacts of Obsidian are considered tinged with evil. Obsidian weapons may never be used by Dwarfs, Elves, Sisters of Sigmar, Witch Hunters or Priests.",
			},
			{
				name: "Heavy",
				description:
					"Obsidian weapons are so heavy that the warrior using them always strikes last, even when charging.",
			},
		],
	},
	{
		name: "Ogre Club",
		source: "Border Town Burning supplement (1c)",
		cost: 10,
		availability: "Common",
		restrictions: "Maneaters only",
		description:
			"Ogre clubs are crudely fashioned with bindings, spikes, and studs. An Ogre trusts his club and will eat it only in the direst of circumstances.",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "Concussion",
				description:
					"Ogre clubs are excellent to use for striking enemies senseless. When using an Ogre club, a roll of 2-4 is treated as stunned when rolling for Injuries.",
			},
			{
				name: "Crushing Attack",
				description:
					"Ogre clubs may be wielded with impressive strength imposing -1 to enemy armour saves. Crushing Attack only applies if the Ogre uses the club with both hands.",
			},
		],
	},
	{
		name: "Pike",
		source: "Border Town Burning (1c)",
		cost: 10,
		availability: "Rare 8",
		restrictions: "Merchant Caravans only",
		description:
			"A Pike is comparable to a spear, though its length exceeds the one of a common one. The Tileans use them in their civil wars, and with the silk road, they came to the outer border towns of Cathay.",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "Strike First",
				description:
					"A warrior with a pike strikes first in the first turn of a hand-to-hand combat. For that turn, he gains +1 Initiative representing the pike's long shaft.",
			},
			{
				name: "Two Handed",
				description:
					"A model armed with a pike may not use a shield, buckler, or additional weapon in close combat. However, it gets an additional +1 armor save bonus against ranged attacks if it carries a shield.",
			},
		],
	},
	{
		name: "Poison Daggers",
		source: "Mordheimer Information Centre (1c)",
		cost: 25,
		availability: "Common",
		restrictions: "Night Goblins only",
		description:
			"A pair of daggers which are coated in Death Cap mushroom juice. The coating is re-applied for free after every game.",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "Paired",
				description:
					"Poisoned Daggers are traditionally used in pairs, one in each hand. A warrior armed with Poisoned Daggers gets an additional attack.",
			},
			{
				name: "Poisoned",
				description:
					"These blades are coated in Death Cap Mushroom juice. The daggers are re-coated for free after every game, and they have the same effect as Black Lotus.",
			},
			{
				name: "+1 Enemy armour save",
				description: "Target gets +1 to armour save",
			},
		],
	},
	{
		name: "Quarter Staff",
		source: "Border Town Burning (1c)",
		cost: 15,
		availability: "Common",
		restrictions: "Battle Monks of Cathay only",
		description: "",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "Balanced",
				description:
					"A quarter staff is especially light and easy to wield. A model armed with a fighting staff gets +1 Initiative in close combat.",
			},
			{
				name: "Parry",
				description: "Can parry enemy blows",
			},
			{
				name: "Freestyle",
				description:
					"Although a staff does not always require two hands to use, it cannot be combined with another weapon, shield, buckler, etc. However, it can be combined with the Monks bare hand attacks.",
			},
		],
	},
	{
		name: "Rapier",
		source: "Ye Old Curiosity Shoppe, Mordheim Annual 2002 (1a)",
		cost: 15,
		availability: "Rare 5",
		restrictions:
			"Reiklanders, Marienburgers, Tileans, Hochland Bandits, and Merchant Caravans only",
		description:
			"The rapier is a long thing blade commonly used by dualists. It is a deadly, shard weapon capable of delivering a multitude of blows but lacks the power of a broadsword.",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "Parry",
				description:
					"Like all swords, you may use a rapier to parry in hand to hand combat.",
			},
			{
				name: "Barrage",
				description:
					"A warrior armed with a rapier rolls to hit and wound as normal. However, if you manage to hit your opponent but fail to wound, you may attack again just as if you had another attack but at –1 to hit.",
			},
			{
				name: "Armour Save",
				description:
					"Because a rapier is a very light sword that lacks the thick armour breaking blade of the broadsword, armour saves are made at +1.",
			},
		],
	},
	{
		name: "Serpent Staff",
		source: "Town Cryer 18 (1b)",
		cost: 30,
		availability: "Common",
		restrictions: "Tomb Guardians Liche Priest only",
		description:
			"The highest Liche Priests of their order carry staffs adorned with a serpent head as their badge of office.",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "Parry",
				description:
					"The staff is used with two hands and may be used to Parry. However, the Liche Priest may forgo all his normal attacks and parries in a round to use the power contained within the staff.",
			},
		],
	},
	{
		name: "Shortsword",
		source: "Bretonnian Chapel Guard (1c)",
		cost: 7,
		availability: "Common",
		restrictions: "Bretonnian Chapel Guard Knights only",
		description: "",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "Parry",
				description:
					"Shortswords offer an excellent balance of defence and offence. A model armed with a sword may parry blows.",
			},
			{
				name: "+1 Enemy armour save",
				description:
					"Shortswords are not the best weapons to use for penetrating an enemy model's armour. An enemy wounded by a short sword gains a +1 bonus to his armour save.",
			},
		],
	},
	{
		name: "Sigmarite Warhammer",
		source: "Mordheim Rulebook (core)",
		cost: 15,
		availability: "Common",
		restrictions: "Sisters of Sigmar only",
		description:
			"One of the traditional weapons of the Sisterhood, the warhammer echoes Ghal-Maraz, the great hammer of Sigmar himself.",
		range: "Close Combat",
		strength: "As user +1",
		specialRules: [
			{
				name: "Concussion",
				description:
					"Warhammers are excellent at striking people senseless. When using a warhammer in close combat a roll of 2-4 is treated as stunned when rolling on the Injury chart.",
			},
			{
				name: "Holy Weapon",
				description:
					"Each warhammer is blessed by the High Matriarch herself before it is handed to the Sisters. The warhammer has a +1 bonus on all to wound rolls against any Possessed or Undead models.",
			},
		],
	},
	{
		name: "Sons of Hashut Obsidian Weapon",
		source: "GW Troll Magazine (1c)",
		cost: 60,
		availability: "Rare 10",
		restrictions: "Chaos Dwarfs only",
		description:
			"Obsidian weapons are very rare because it takes a long time to forge the weapon without causing fissures in the stone; however, once forged, they are prepared to withstand heavy impacts during use.",
		range: "Close Combat",
		strength: "As user +1",
		specialRules: [
			{
				name: "Personal",
				description:
					"The weapon keeps the bonuses for weapons of this type; only swords, axes, and hammers can be made of obsidian.",
			},
			{
				name: "Heavy",
				description:
					"A warrior equipped with an obsidian weapon subtracts 1 from his Initiative attribute in melee combat.",
			},
		],
	},
	{
		name: "Spear",
		source: "Mordheim Rulebook (core)",
		cost: 10,
		availability: "Common",
		description:
			"Spears range from sharpened sticks used by Goblins to the impressive cavalry spears typical of the Elves.",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "Strike first",
				description:
					"A warrior with a spear 'strikes first' in the first turn of hand-to-hand combat.",
			},
			{
				name: "Unwieldy",
				description:
					"A warrior with a spear may only use a shield or a buckler in his other hand. He may not use a second weapon.",
			},
			{
				name: "Cavalry bonus",
				description:
					"If using the rules for mounted models, a mounted warrior armed with a spear receives a +1 Strength bonus when he charges. This bonus only applies for that turn.",
			},
		],
	},
	{
		name: "Spiked Gauntlet",
		source: "Mordheim Rulebook (core)",
		cost: 15,
		availability: "Common",
		restrictions: "Pit Fighters only",
		description:
			"The spiked gauntlet counts as an additional hand weapon and a buckler.",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "Parry",
				description: "Can parry enemy blows",
			},
		],
	},
	{
		name: "Starblade",
		source: "Town Cryer #15 (1b)",
		cost: 15,
		availability: "Rare 7",
		restrictions: "Amazons (Lustria) only",
		description:
			"Of the many strange weapons the Amazons possess the Starblade is built like an Amazonian dagger. It is usually painted exotic colours and contains magical properties that enhance the fighting prowess of the Amazons.",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "+1 Enemy armour save",
				description: "Enemy gets +1 to armour save",
			},
			{
				name: "Potential Parry",
				description:
					"A Starblade can parry the first successful hit of any combat on a 4+.",
			},
		],
	},
	{
		name: "Starsword",
		source: "Town Cryer #15 (1b)",
		cost: 30,
		availability: "Rare 10",
		restrictions: "Amazons (Lustria) only",
		description:
			"This is an ancient and legendary sword that can cut through armour as if it were a leaf.",
		range: "Close Combat",
		strength: "As user +1",
		specialRules: [
			{
				name: "Parry",
				description: "Can parry enemy blows",
			},
			{
				name: "Ignores Armour",
				description:
					"A Starsword ignores all armour saves except for ward and Dodge saves.",
			},
		],
	},
	{
		name: "Steel Whip",
		source: "Mordheim Rulebook (core)",
		cost: 10,
		availability: "Common",
		restrictions: "Sisters of Sigmar and Chaos Dwarfs only",
		description:
			"Another weapon unique to the Sisterhood is the steel whip, made from barbed steel chains.",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "Cannot be parried",
				description:
					"The steel whip is a flexible weapon and the Priestesses use it with great expertise. Attempts to parry its strikes are futile. A model attacked by a steel whip may not make parries with swords or bucklers.",
			},
			{
				name: "Whipcrack",
				description:
					"When the wielder charges they gain +1A for that turn. When the wielder is charged they gain +1A that they may only use against the charger. This additional attack will 'strike first'.",
			},
		],
	},
	{
		name: "Sword",
		source: "Mordheim Rulebook (core)",
		cost: 10,
		availability: "Common",
		description:
			"The sword is often referred to as the 'king of weapons'. The most common sword available, the broadsword of the Empire, is a masterpiece by the standards of any smith: four full feet of gleaming steel, double-edged and razor-sharp.",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "Parry",
				description:
					"Swords offer an excellent balance of defence and offence. A model armed with a sword may parry blows. A model may not parry attacks made with double or more its own Strength.",
			},
		],
	},
	{
		name: "Sword Breaker",
		source: "Ye Old Curiosity Shoppe, Mordheim Annual 2002 (1a)",
		cost: 30,
		availability: "Rare 8",
		description:
			"The sword breaker is a specialist weapon wrought by only the most talented swordsmiths. Next to the hilt are two prongs concealed within the blade that can be used to trap an opponent's blade, twisting and snapping it with a single, well timed movement.",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "Parry",
				description:
					"The sword breaker allows the wielder to parry the attacks of his opponents in close combat.",
			},
			{
				name: "Trap Blade",
				description:
					"Whenever you make a successful parry attempt roll a D6. If you score a 4+ you break the weapon your opponent was using. The weapon is now useless and they must use another one.",
			},
		],
	},
	{
		name: "Tenderiser",
		source: "Citadel Journal 36 (1b)",
		cost: 3,
		availability: "Common",
		restrictions: "Mootlanders only",
		description:
			"Although other warbands scoff at your rolling pins and tenderisers, they are fully capable of crushing a skull or knocking an opponent unconscious.",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "Stuns on 2-4",
				description: "Stuns on 2-4",
			},
		],
	},
	{
		name: "Trident",
		source: "Town Cryer #21 (1b)",
		cost: 15,
		availability: "Rare 7",
		restrictions: "Pit Fighters only",
		description:
			"The Trident as a Pit Fighter weapon originates in Tilea from the ancient days when gladiators would fight in the massive public arenas. This weapon is similar to a spear and has all of its advantages in length but it has three spear points, allowing an adept user to catch blades between them and turn them aside.",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "Parry",
				description: "Can parry enemy blows",
			},
			{
				name: "Strike first",
				description: "Strikes first when charged",
			},
		],
	},
	{
		name: "Weeping Blades",
		source: "Mordheim Rulebook (core)",
		cost: 50,
		availability: "Rare 9",
		restrictions: "Skaven only",
		description:
			"The adepts of Clan Eshin use weapons called Weeping Blades, murderous swords constructed with a small amount of warpstone in their structure. A Weeping Blade constantly sweats a deadly corrosive venom.",
		range: "Close Combat",
		strength: "As user",
		specialRules: [
			{
				name: "Pair",
				description:
					"Weeping Blades are traditionally used in pairs, one in each hand. A warrior armed with Weeping Blades gets an additional attack.",
			},
			{
				name: "Venomous",
				description:
					"The venom of Weeping Blades will enter the blood of the victim and ravage his organs and muscles. These weapons count as being permanently coated in black lotus.",
			},
			{
				name: "Parry",
				description: "Weeping Blades are swords and can be used for parrying.",
			},
		],
	},
];
