import type { BlackpowderWeapon } from "./types";

// Blackpowder Weapons Data
export const blackpowderWeapons: BlackpowderWeapon[] = [
	{
		name: "Blunderbuss",
		source: "Mordheim Rulebook",
		grade: "core",
		cost: "30 gc",
		availability: "Rare 9",
		description:
			"A blunderbuss is a primitive blackpowder weapon, which fires a hail of lead balls, rusty bolts, bent nails, and other assorted scrap metal. It is a powerful, if erratic, weapon and takes such a long time to load that most warriors discard it after the first shot.",
		range: "Special",
		strength: 3,
		specialRules: [
			{
				name: "Shot",
				description:
					'When your model fires the blunderbuss, draw a line 16" long and 1" wide in any direction from the firer (the line must be absolutely straight). Any and all models in its path are automatically hit by a Strength 3 hit.',
			},
			{
				name: "Fire Once",
				description:
					"It takes a very long time to load a blunderbuss so it may only be fired it once per battle.",
			},
		],
	},
	{
		name: "Chaos Dwarf Blunderbuss",
		source: "GW Troll Magazine",
		grade: "1c",
		cost: "40 gc",
		availability: "Rare 9",
		restrictions: "Chaos Dwarfs only",
		description:
			"Chaos Dwarfs are known in battle for using a large number of these infamous blunderbusses on their infantry troops. They employ this same tactic in combat on the streets of Mordheim.",
		range: '16"',
		strength: 3,
		specialRules: [
			{
				name: "Shot",
				description:
					'When your model fires the blunderbuss, draw a line 16" long and 1" wide in any direction from the firer (the line must be absolutely straight). Any and all models in its path are automatically hit by a Strength 3 hit.',
			},
			{
				name: "Prepare Shot",
				description:
					"A superior blunderbuss may be fired more than once per game; it takes a complete turn to reload, so you may only fire it every other turn.",
			},
		],
	},
	{
		name: "Double-barrelled Duelling Pistol",
		source: "Nemesis Crown Supplement",
		grade: "1b",
		cost: "45 + 2D6 gc (80 + 4D6 gc for a brace)",
		availability: "Rare 11 (Rare 12 for a brace)",
		restrictions: "Gunnery School of Nuln only",
		description:
			"A natural evolution from the double-barrelled pistol, but it has proven less popular than envisaged. It had been thought that nobles would invest in them as a showpiece and put a stop to pointless duels, as who would want to shoot a rival who could shoot, miss, and then shoot again, even if you got two shots at them as well. Perhaps the designer should have put a few more hours thinking into it.",
		range: '9"',
		strength: 4,
		specialRules: [
			{
				name: "Accuracy",
				description:
					"A duelling pistol is built for accuracy as a skilled duellist is able to hit a coin from twenty paces. All shots and close combat attacks from a duelling pistol have a +1 bonus to hit.",
			},
			{
				name: "Prepare shot",
				description:
					"A duelling pistol takes a complete turn to reload, so your model may only fire every other turn. If he has a brace of duelling pistols he may fire every turn.",
			},
			{
				name: "Save modifier",
				description:
					"Duelling pistols are even better at penetrating armour than their Strength 4 suggests. A warrior wounded by a duelling pistol must make his armour save with a -2 modifier.",
			},
			{
				name: "Hand-to-hand",
				description:
					"Pistols can be used in hand-to-hand combat as well as for shooting. A model armed with a pistol and another close combat weapon gains +1 Attack, which is resolved at Strength 4 with a -2 save modifier. This bonus attack can be used only once per combat. If you are firing a brace of pistols, your model can fight with 2 Attacks in the first turn of close combat. These attacks are resolved with a model's Weapon Skill like any normal close combat attack and likewise may be parried. Successful hits are resolved at Strength 4 and with a -2 save modifier, regardless of the firer's Strength.",
			},
			{
				name: "Double-barrelled",
				description:
					"A double-barrelled weapon is a tricky piece of engineering, but it's a wonderful piece for combat. When firing such a weapon, the bearer must declare whether he is firing one or both barrels. If firing a single barrel, treat the shot as you would a normal weapon. However when firing both barrels, the method changes slightly:\n\n- To hit: roll a single dice as you would normally. This allows for a narrow field of fire emanating from the weapon.\n- To wound: roll for each shot individually, as each shot can wound on it's own. Treat each shot that inflicts Critical Hits separately.\n- Reloading: After firing both barrels, place 2 tokens on the model. In your next shooting phase remove 1 token to represent one barrel having been reloaded. Token removal should be the last thing done in your shooting phase and you cannot shoot in the same phase as your reload.\n- Firing a Brace: If you fire both guns and barrels at the same time, place 4 tokens down, 2 each of different colours (one for each pistol in the brace). Remove one token of each colour every turn.",
			},
		],
	},
	{
		name: "Double-barrelled Handgun",
		source: "Nemesis Crown Supplement",
		grade: "1b",
		cost: "60 + 2D6 gc",
		availability: "Rare 10",
		restrictions: "Gunnery School of Nuln only",
		description:
			"Created from a request by a Nuln nobleman who had been impressed by a demonstration model, the gunsmiths slaved long and hard to replicate it until a final model was forged. By then the noble had forgotten about it and the Colleges were left with a job lot. These were given to the Gunnery School as a gift and sort of disappeared on route.",
		range: '24"',
		strength: 4,
		specialRules: [
			{
				name: "Prepare shot",
				description:
					"A handgun takes a complete turn to reload, so you may only fire it every other turn.",
			},
			{
				name: "Move or fire",
				description:
					"You may not move and fire a handgun in the same turn, other than to pivot on the spot to face your target or stand up.",
			},
			{
				name: "Save Modifier",
				description:
					"Handguns are even better at penetrating armour than their Strength 4 suggests. A warrior wounded by a handgun must take its armour save with a -2 modifier.",
			},
			{
				name: "Double-barrelled",
				description:
					"A double-barrelled weapon is a tricky piece of engineering, but it's a wonderful piece for combat. When firing such a weapon, the bearer must declare whether he is firing one or both barrels.\n\n- To hit: roll a single dice as you would normally. This allows for a narrow field of fire emanating from the weapon.\n- To wound: roll for each shot individually, as each shot can wound on it's own. Treat each shot that inflicts Critical Hits separately.\n- Reloading: After firing both barrels, place 2 tokens on the model. In your next shooting phase remove 1 token to represent one barrel having been reloaded. Token removal should be the last thing done in your shooting phase and you cannot shoot in the same phase as your reload.",
			},
		],
	},
	{
		name: "Double-barrelled Pistol",
		source: "Nemesis Crown Supplement",
		grade: "1b",
		cost: "25 + D6 gc (46 + 2D6 gc for a brace)",
		availability: "Rare 9 (Rare 10 for a brace)",
		restrictions: "Gunnery School of Nuln only",
		description:
			"Originally created by a forward thinking blacksmith in Ostland for a vampire hunter, the engineers in the College at Nuln picked up on the trick very quickly. The design was simple enough; it is merely a pistol with a pair of barrels and a two-part trigger, which is capable of firing one or both barrels at a time, giving it the ability to punch a hole in even the toughest armour.",
		range: '6"',
		strength: 4,
		specialRules: [
			{
				name: "Prepare Shot",
				description:
					"A pistol takes a complete turn to reload, so your model may only fire every other turn. If he has a brace of pistols he may fire every turn.",
			},
			{
				name: "Save Modifier",
				description:
					"Pistols are even better at penetrating armour than their Strength 4 suggests. A warrior wounded by a pistol must make his armour save with a -2 modifier.",
			},
			{
				name: "Hand-to-hand",
				description:
					"Pistols can be used in hand-to-hand combat as well as for shooting. A model armed with a pistol and another close combat weapon gains +1 Attack, which is resolved at Strength 4 with a -2 save modifier. This bonus attack can be used only once per combat. If you are firing a brace of pistols, your model can fight with 2 Attacks in the first turn of close combat. These attacks are resolved with a model's Weapon Skill like any normal close combat attack and likewise may be parried. Successful hits are resolved at Strength 4 and with a -2 save modifier, regardless of the firer's Strength.",
			},
			{
				name: "Double-barrelled",
				description:
					"A double-barrelled weapon is a tricky piece of engineering, but it's a wonderful piece for combat. When firing such a weapon, the bearer must declare whether he is firing one or both barrels.\n\nIf firing a single barrel, treat the shot as you would a normal weapon. However when firing both barrels, the method changes slightly:\n\n- To hit: roll a single dice as you would normally. This allows for a narrow field of fire emanating from the weapon.\n- To wound: roll for each shot individually, as each shot can wound on it's own. Treat each shot that inflicts Critical Hits separately.\n- Reloading: After firing both barrels, place 2 tokens on the model. In your next shooting phase remove 1 token to represent one barrel having been reloaded. Token removal should be the last thing done in your shooting phase and you cannot shoot in the same phase as your reload.\n- Firing a Brace: If you fire both guns and barrels at the same time, place 4 tokens down, 2 each of different colours (one for each pistol in the brace). Remove one token of each colour every turn.",
			},
		],
	},
	{
		name: "Duelling Pistol",
		source: "Mordheim Rulebook",
		grade: "core",
		cost: "30 gc (60 gc for a brace)",
		availability: "Rare 10",
		description:
			"A duelling pistol is a work of art, and a gunsmith labours long and hard to produce a single example. They are often carried by Imperial nobles to solve disputes over love and honour, and many a noble has died at dawn in a duel over some grievance.\n\nDuelling pistols are prohibitively expensive weapons and common warriors rarely have them. Even if they do manage to steal or buy one, the ammunition is prohibitively expensive.\n\nSome of the wealthiest warriors in Mordheim carry duelling pistols as status symbols, commanding great respect, admiration and envy.",
		range: '10"',
		strength: 4,
		specialRules: [
			{
				name: "Accuracy",
				description:
					"A duelling pistol is built for accuracy as a skilled duellist is able to hit a coin from twenty paces. All shots and close combat attacks from a duelling pistol have a +1 bonus to hit.",
			},
			{
				name: "Prepare shot",
				description:
					"A duelling pistol takes a complete turn to reload, so your model may only fire every other turn. If he has a brace of duelling pistols he may fire every turn.",
			},
			{
				name: "Save modifier",
				description:
					"Duelling pistols are even better at penetrating armour than their Strength 4 suggests. A warrior wounded by a duelling pistol must make his armour save with a -2 modifier.",
			},
			{
				name: "Hand-to-hand",
				description:
					"Duelling pistols can be used in hand-to-hand combat as well as for shooting. A model armed with a duelling pistol and another close combat weapon gains +1 Attack, which is resolved at Strength 4 with a -2 save modifier. This bonus attack can be used only once per combat. If you are firing a brace of duelling pistols, your model can fight with 2 Attacks in the first turn of close combat. These attacks are resolved with a model's Weapon Skill like any normal close combat attack and likewise may be parried. Successful hits are resolved at Strength 4 and with a -2 save modifier, regardless of the firer's Strength.",
			},
		],
	},
	{
		name: "Hand-held Mortar",
		source: "Nemesis Crown Supplement / Border Town Burning supplement",
		grade: "1b",
		cost: "80 + 2D6 gc",
		availability: "Rare 12",
		restrictions: "Gunnery School of Nuln and Maneaters only",
		description:
			"The explosive power of a mortar, in a small enough package to be carried by a single man, the Hand-Held Mortar enables a warrior to launch an explosive into the midst of the enemy, sowing death and disorder.",
		range: '24"',
		strength: 4,
		specialRules: [
			{
				name: "Prepare shot",
				description:
					"A Hand-held Mortar takes a complete turn to reload, so you may only fire it every other turn.",
			},
			{
				name: "Move or fire",
				description:
					"You may not move and fire a Hand-held Mortar in the same turn, other than to pivot on the spot to face your target or stand up.",
			},
			{
				name: "Save Modifier",
				description:
					"Hand-held Mortar are even better at penetrating armour than their Strength 4 suggests. A warrior wounded by a Hand-held Mortar must take its armour save with a -2 modifier.",
			},
			{
				name: "Scatter",
				description:
					'If the warrior misses his roll to hit, the shot will land 2D6" in a random direction (determined using a Warhammer directional die, using the "clockface method" of scattering, or whatever other method the players can agree to).',
			},
			{
				name: "Experimental",
				description:
					'The Hand-held Mortar is always Experimental: subject to the optional Blackpowder Weapons rules from the Mordheim rulebook, even if they are not normally used in your campaign. On any result other than "BOOM!", the weapon has jammed or run out of loaded barrels and must be reloaded.',
			},
			{
				name: "Explosive Radius",
				description:
					'After determining the final landing spot, the explosion created by the bomb will cover a small area. The target and any models within 1 ½" of him each take a single S4 hit from the blast.',
			},
		],
	},
	{
		name: "Handgun",
		source: "Mordheim Rulebook",
		grade: "core",
		cost: "35 gc",
		availability: "Rare 8",
		description:
			"A handgun is a simple firearm. The quality of construction varies ranging from the crude wooden 'hakbuts' of the artillery school of Nuln, to the more sophisticated Dwarf firearms that have levers and springs which hold the burning match, and triggers which release the firing mechanism and fire the gun. Handguns are not terribly reliable weapons: the gun barrel occasionally tends to explode violently or the powder fails to ignite. But the weapon has a great range and tremendous penetrating power, making a mockery of even the thickest armour. In Mordheim, handguns are rare and expensive, but a warband which can boast such a weapon will command respect from all its rivals.",
		range: '24"',
		strength: 4,
		specialRules: [
			{
				name: "Prepare shot",
				description:
					"A handgun takes a complete turn to reload, so you may only fire it every other turn.",
			},
			{
				name: "Move or fire",
				description:
					"You may not move and fire a handgun in the same turn, other than to pivot on the spot to face your target or stand up.",
			},
			{
				name: "Save Modifier",
				description:
					"Handguns are even better at penetrating armour than their Strength 4 suggests. A warrior wounded by a handgun must take its armour save with a -2 modifier.",
			},
		],
	},
	{
		name: "Hersten-Wenkler Pigeon Bombs",
		source: "Nemesis Crown Supplement",
		grade: "1b",
		cost: "30 + 2D6 gc",
		availability: "Rare 8",
		restrictions: "Gunnery School of Nuln only",
		description:
			"When the full potential of gunpowder was realized in the Empire, it became only a matter of time before some enterprising engineers combined explosives and small animals. After initial failures with attempts to use rats, bats, and dogs, promising results were realized with pigeons. While not completely accurate due to having something of a mind of their own, pigeons are able to get to even distant targets quickly, and are very hard to prevent from reaching their target once they have been launched. Once it gets there, pigeon's small metal harness will fall away, freeing the bomb to ravage a small area below, while the pigeon returns home.",
		range: "Unlimited",
		strength: 4,
		specialRules: [
			{
				name: "Move or fire",
				description:
					"You may not move and fire a Pigeon Bomb in the same turn, other than to pivot on the spot to face your target or stand up from knocked down.",
			},
			{
				name: "Explosive Radius",
				description:
					"If the Pigeon Bomb lands on target, use the Explosive Radius rule under the Hand-Held Mortar above to determine the area of effect.",
			},
			{
				name: "Temperamental",
				description:
					"When launching a pigeon bomb, do not use the BS of the warrior. Instead, roll a D6: on a 5-6, the a pigeon bomb hits its target; on a 2-4 the fuse wasn't cut properly and the pigeon explodes harmlessly in the air before reaching its target; on a result of 1, something has gone disastrously wrong and the pigeon explodes in the hero's hands… he and everyone within 1 ½\" takes a S4 hit.",
			},
			{
				name: "Pigeon Roost",
				description:
					"Once a Hero buys pigeon bombs, he has enough for the full game, and his supply gets replenished at the start of each new game.",
			},
		],
	},
	{
		name: "Hunting Rifle",
		source: "Mordheim Rulebook",
		grade: "core",
		cost: "200 gc",
		availability: "Rare 11",
		description:
			"Hochland is a province famed for its hunters, and the preferred weapon of its nobility when they go hunting is a long-ranged rifle. They are extremely rare and precious weapons, and only the most experienced weaponsmiths are capable of manufacturing them.",
		range: '48"',
		strength: 4,
		specialRules: [
			{
				name: "Move or fire",
				description:
					"You may not move and fire a Hochland long rifle in the same turn, other than to pivot on the spot to face your target or stand up from knocked down.",
			},
			{
				name: "Prepare shot",
				description:
					"A Hochland long rifle takes a complete turn to reload, so you may only fire it every other turn.",
			},
			{
				name: "Pick target",
				description:
					"A model armed with a Hochland long rifle can target any enemy model in sight, not just the closest one.",
			},
			{
				name: "Save modifier",
				description:
					"Hochland long rifles are even better at penetrating armour than their Strength 4 suggests. A warrior wounded by a long rifle must make his armour save with a -2 modifier.",
			},
		],
	},
	{
		name: "Ostlander Double-barrelled Hunting Rifle",
		source: "Town Cryer #11, revised in Mordheim Annual 2002",
		grade: "1a",
		cost: "300 gc",
		availability: "Rare 12",
		restrictions: "Ostlanders only",
		description:
			"Knowing Ostlanders' penchant for impressive weaponry (and ready willingness to spend excessive amounts of money) a weaponsmith from Hochland decided to weld two barrels together on a pistol and sell it for twice the price. The warband was so impressed with their new weapon that they asked him to do the same to their hunting rifle. Since then, the weaponsmith has been flooded with orders from some of the most powerful warbands in Mordheim.",
		range: '48"',
		strength: 4,
		specialRules: [
			{
				name: "Double-barrelled",
				description:
					"A double-barrelled gun (of any sort) is treated exactly like a normal version with one exception. Any enemy is hit by two blasts rather than one (ie, a pistol causes two S4 hits rather than one for each successful hit). However, each barrel takes a full turn to reload (although if you reload only one barrel you can fire it like a normal pistol/rifle). If you own a brace of double-barreled pistols you may fire them every other round (rather than every round like a normal brace).",
			},
		],
	},
	{
		name: "Ostlander Double-barrelled Pistol",
		source: "Town Cryer #11, revised in Mordheim Annual 2002",
		grade: "1a",
		cost: "30 gc (60 gc for a brace)",
		availability: "Rare 10",
		restrictions: "Ostlanders only",
		description:
			"Knowing Ostlanders' penchant for impressive weaponry (and ready willingness to spend excessive amounts of money) a weaponsmith from Hochland decided to weld two barrels together on a pistol and sell it for twice the price. The warband was so impressed with their new weapon that they asked him to do the same to their hunting rifle. Since then, the weaponsmith has been flooded with orders from some of the most powerful warbands in Mordheim.",
		range: '6"',
		strength: 4,
		specialRules: [
			{
				name: "Double-barrelled",
				description:
					"A double-barrelled gun (of any sort) is treated exactly like a normal version with one exception. Any enemy is hit by two blasts rather than one (ie, a pistol causes two S4 hits rather than one for each successful hit). However, each barrel takes a full turn to reload (although if you reload only one barrel you can fire it like a normal pistol/rifle). If you own a brace of double-barreled pistols you may fire them every other round (rather than every round like a normal brace).",
			},
		],
	},
	{
		name: "Pistol",
		source: "Mordheim Rulebook",
		grade: "core",
		cost: "15 gc (30 gc for a brace)",
		availability: "Rare 8",
		description:
			"A pistol is a small, simple blackpowder weapon fired by a spring mechanism. Most pistols are expensive, unreliable, and poorly constructed.",
		range: '6"',
		strength: 4,
		specialRules: [
			{
				name: "Prepare shot",
				description:
					"A pistol takes a whole turn to reload, so you may only fire every other turn. If you have a brace of pistols (ie, two) you may fire every turn.",
			},
			{
				name: "Save modifier",
				description:
					"Pistols are even better at penetrating armour than their Strength 4 suggests. A warrior wounded by a pistol must make his armour save with a -2 modifier.",
			},
			{
				name: "Hand-to-hand",
				description:
					"Pistols can be used in hand-to-hand combat as well as for shooting. A model armed with a pistol and another close combat weapon gains +1 Attack, which is resolved at Strength 4 with a -2 save modifier. This bonus attack can be used only once per combat. If you are firing a brace of pistols, your model can fight with 2 Attacks in the first turn of close combat. These attacks are resolved with a model's Weapon Skill like any normal close combat attack and likewise may be parried. Successful hits are resolved at Strength 4 and with a -2 save modifier, regardless of the firer's Strength.",
			},
		],
	},
	{
		name: "Repeater Handgun",
		source: "Nemesis Crown Supplement",
		grade: "1b",
		cost: "60 + 2D6 gc",
		availability: "Rare 11",
		restrictions: "Gunnery School of Nuln only",
		description:
			"The next step in the evolution of multi-barrelled weapons, a Repeater Handgun mounts a number of handgun barrels around a rotating cylinder, each one firing in turn. Prone to misfiring or other malfunction, Repeater Handguns are still highly sought after items, as they will launch a veritable storm of lead at the enemy if they don't break down.",
		range: '24"',
		strength: 4,
		specialRules: [
			{
				name: "Save Modifier",
				description:
					"Handguns are even better at penetrating armour than their Strength 4 suggests. A warrior wounded by a handgun must take its armour save with a -2 modifier.",
			},
			{
				name: "Move or Fire",
				description:
					"You may not move and fire a handgun in the same turn, other than to pivot on the spot to face your target or stand up.",
			},
			{
				name: "Fire Thrice",
				description:
					'The Repeater Handgun may fire up to three shots; if more than one shot is made the to hit roll is at -1. Resolve each shot individually, you may choose to shot later shots at a different target, but they must be within 3" of the previous target. Ordinary targeting restrictions apply to shots as per Mordheim rulebook.',
			},
			{
				name: "Experimental",
				description:
					'The Repeater Handgun is always Experimental: subject to the optional Blackpowder Weapons rules from the Mordheim rulebook, even if they are not normally used in your campaign. On any result other than "BOOM!", the weapon has jammed or run out of loaded barrels and must be reloaded.',
			},
			{
				name: "Slow Reload",
				description:
					"To reload a Repeater Handgun takes a Slow Reload long time and a bit of focus. The warrior must do nothing (no moving, no shooting, no fighting in close combat, etc.) for a complete turn in order to reload the weapon.",
			},
		],
	},
	{
		name: "Repeater Pistol",
		source: "Nemesis Crown Supplement",
		grade: "1b",
		cost: "30 + 2D6 gc",
		availability: "Rare 9",
		restrictions: "Gunnery School of Nuln only",
		description:
			"It wasn't long after the invention of the repeater handgun that the same principle was being used on pistols. Still prone to misfiring or other malfunction, they have found a place in gunnery bands armouries. Stories of calm instructors gunning down hordes of foes within feet of themselves are legendary and in all likelihood untrue. But it just could happen...",
		range: '6"',
		strength: 4,
		specialRules: [
			{
				name: "Save Modifier",
				description:
					"Pistols are even better at penetrating armour than their Strength 4 suggests. A warrior wounded by a handgun must take its armour save with a -2 modifier.",
			},
			{
				name: "Fire Thrice",
				description:
					'The Repeater Pistol may fire up to three shots; if more than one shot is made the to hit roll is at -1. Resolve each shot individually, you may choose to shot later shots at a different target, but they must be within 3" of the previous target. Ordinary targeting restrictions apply to shots as per Mordheim rulebook.',
			},
			{
				name: "Experimental",
				description:
					'The Repeater Pistol is always Experimental: subject to the optional Blackpowder Weapons rules from the Mordheim rulebook, even if they are not normally used in your campaign. On any result other than "BOOM!", the weapon has jammed or run out of loaded barrels and must be reloaded.',
			},
			{
				name: "Quick Reload",
				description:
					"The basic design of the pistol and number of barrels allows quick reloading, the pistol will always be able to fire at least one shot. After shooting more than one shot in a single turn the model must spend a complete shooting phase without shooting and without being in combat, before firing multiple shots (see Fire Thrice, above) may be taken again.",
			},
			{
				name: "Not a Club",
				description:
					"The Repeater Pistol may be used as a normal pistol in the first round of combat. After that it doesn't count as an additional hand weapon as it is far too delicate to risk in such a crude fashion. Its owner will not willingly discard it in a fight and so must fight on without the use of an additional hand weapon.",
			},
		],
	},
	{
		name: "Swivel Gun",
		source: "Town Cryer #9",
		grade: "1b",
		cost: "65 gc",
		availability: "Rare 8",
		restrictions: "Pirate Gunners only, max one per warband",
		description:
			"Pirate Gunners sometimes construct and carry into battle a smaller and lighter version of the real swivel cannons normally attached to pivoting mounts on the ship's railing or sides. Though smaller than regular cannons, swivel guns are larger than normal handguns, so big that they must be held up with the support of wooden support. They are cumbersome, and prone to failure due to imperfect castings or poorly mixed blackpowder, but most gunners agree that they make up for it in sheer power.",
		range: "Special (depends on ammunition)",
		strength: "Special (depends on ammunition)",
		specialRules: [
			{
				name: "Cumbersome",
				description:
					"The user is at –1 Initiative and –1 Movement throughout the battle. Also, Swivel Guns may never be fired twice per turn, or fired if the user moved, no matter what Skills the user may have.",
			},
			{
				name: "Blackpowder Rules",
				description:
					"The normally optional rules for Blackpowder weapons are always in effect for Swivel Guns, due to unpredictable nature of the local materials used in their construction.",
			},
			{
				name: "Special Ammunition",
				description:
					"Swivel Guns use nonstandard ammunition types, which must be bought for each game. Each type only lasts one game, so if it is used in a game it cannot be used again until another supply is bought. Before firing, the Gunner must declare which type is being used, if he has more than one type available in the game.",
			},
			{
				name: "Ball Shot",
				description:
					'A Swivel Gun firing these heavy lead balls can stop even a charging Ogre dead in his tracks! Maximum Range: 36"; Strength: 5; Special Rule: Armour Save -2, Concussion. Concussion: The impact of the heavy lead projectile is enough to rattle even the hardiest warrior. Treat any resulting Injury Rolls of 2-4 as a Stunned result.',
			},
			{
				name: "Chain Shot",
				description:
					"These lengths of chain and linked metal don't cause as much damage, but can entangle an enemy model and bring him to his knees. Maximum Range: 24\"; Strength: 4; Special Rule: Armour Save -1, All Wrapped Up! All Wrapped Up: Enemy hit by Chain Shot which are not wounded are Knocked Down on a roll of 4+, even if they normally can never be Knocked Down.",
			},
			{
				name: "Grape Shot",
				description:
					"Very small pellets, rocks, metal scrap, even rock salt are poured into the barrel from prepared canisters, producing a cloud of shrapnel when fired. Maximum Range: 24\"; Strength: 3; Special Rule: It's Everywhere! It's Everywhere: If a hit is scored, D6 other enemy models within 4\" of the target and also in Line of Sight will automatically take a single hit. If the original target was in the open, no hits can be applied to models in cover though (only if the original target was in cover can hits go to models in cover as well). The closest enemy model to the target must take the first hit, then the next closest, and so on. Models in Hiding will also count towards being close to the target, and can be hit as well. There is no Armour Save modifier from Grape Shot hits. Pirates know to duck out of the way when they hear a Swivel Gun going off, and thus are never hit by friendly Grape Shot.",
			},
		],
	},
	{
		name: "Warplock pistol",
		source: "Mordheim Rulebook",
		grade: "core",
		cost: "35 gc (70 gc for a brace)",
		availability: "Rare 11",
		restrictions: "Skaven only",
		description:
			"Warplock pistols are terrifying weapons, testimony to the mad genius of Clan Skryre engineers. Warplock pistols shoot ammunition made of magically treated warpstone and wounds caused by warplock pistols are horrible to behold and often cause infections.",
		range: '8"',
		strength: 5,
		specialRules: [
			{
				name: "Prepare shot",
				description:
					"A pistol takes a whole turn to reload, so you may only fire every other turn. If you have a brace of pistols (ie, two) you may fire every turn.",
			},
			{
				name: "Save modifier",
				description:
					"Warplock Pistols are even better at penetrating armour than their Strength 5 suggests. A warrior wounded by a pistol must make his armour save with a -3 modifier.",
			},
			{
				name: "Hand-to-hand",
				description:
					"Pistols can be used in hand-to-hand combat as well as for shooting. A model armed with a pistol and another close combat weapon gains +1 Attack, which is resolved at Strength 5 with a -3 save modifier. This bonus attack can be used only once per combat. If you are firing a brace of pistols, your model can fight with 2 Attacks in the first turn of close combat. These attacks are resolved with a model's Weapon Skill like any normal close combat attack and likewise may be parried. Successful hits are resolved at Strength 5 and with a -3 save modifier, regardless of the firer's Strength.",
			},
		],
	},
];
