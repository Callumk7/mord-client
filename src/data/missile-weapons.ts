import type { MissileWeapon } from "./types";

const missileWeapons: Record<string, MissileWeapon> = {
	belayingPins: {
		name: "Belaying Pins",
		source: "Town Cryer #9 (1b)",
		cost: "3 gc",
		availability: "Common",
		warbandRestrictions: ["Pirates"],
		description:
			"A typical ship contains hundreds of these short lengths of carved wood. They are set up in racks in convenient places in the ship, around which the running rigging can be secured or belayed. These also make good weapons, and pirates quickly become proficient with hurling them as short range weapons.",
		range: '6"',
		strength: "As user -1",
		specialRules: [
			{
				name: "Awkward Thrown Weapon",
				description:
					"Models using Belaying Pins do not suffer any penalties for range, but still suffer a -1 to hit penalty if they use them after moving that turn.",
			},
			{
				name: "Weak",
				description:
					"They also do not hit very hard, so strike at User Strength -1 and give the target +1 to its armour save (or a 6+ if they have none), exactly as if the enemy had been hit by a bare fist.",
			},
		],
	},

	blowpipe: {
		name: "Blowpipe",
		source: "Mordheim Rulebook (core)",
		cost: "25 gc",
		availability: "Rare 7",
		warbandRestrictions: ["Skaven", "Lizardmen", "Forest Goblins"],
		description:
			"The blowpipe is a short hollow tube which can be used to shoot poisoned darts. While the darts by themselves are too small to cause significant damage, the poison used can cause searing agony and eventual death. The other advantage of a blowpipe is that it is silent, and a well-hidden shooter can fire the darts undetected.",
		range: '8"',
		strength: "1",
		specialRules: [
			{
				name: "Poison",
				description:
					"The needles fired by a blowpipe are coated in a venom very similar in its effects to the Black Lotus (if you roll a 6 on the To Hit roll, the victim is automatically wounded). A blowpipe cannot cause critical hits. This weapon has a positive armour save modifier, so a model that normally has a save of 5+ will get a save of 4+ against a blowpipe dart. Even models that normally do not have an armour save will get a 6+ save to take into account protection offered by clothes, fur or the like.",
			},
			{
				name: "Stealthy",
				description:
					"A model armed with a blowpipe can fire while hidden without revealing his position to the enemy. The target model can take an Initiative test in order to try to spot the firing model. If the test is successful, the model no longer counts as hidden.",
			},
		],
	},

	bolas: {
		name: "Bolas",
		source: "Town Cryer #11 (1b)",
		cost: "5 gc",
		availability: "Common",
		warbandRestrictions: ["Lizardmen", "Amazons (Lustria)"],
		description:
			"Bolas are a set of three bronze balls on strings tied together. They are thrown similar to a sling and are rotated around the head for speed. The bolas is a hunting weapon and doesn't harm the animal. It immobilises it and allows the hunter to either subdue it or put it out with his spear. The bolas has a range of 16\" and can only be used once per battle. They are automatically recovered after each battle.",
		range: '16"',
		strength: "Special",
		specialRules: [
			{
				name: "Dangerous",
				description:
					"If the to hit roll is a natural 1, the bolas brain the wielder with a Strength 3 hit.",
			},
			{
				name: "Entangle",
				description:
					"A model hit by bolas isn't hurt, but his legs are entangled and he is unable to move. The model also suffers a –2 Weapon Skill penalty in hand-to-hand combat, but may still shoot normally. The model may try to free himself in the Recovery phase. If the model rolls a 4+ on a D6 he is freed and may move and fight normally.",
			},
		],
	},

	bow: {
		name: "Bow",
		source: "Mordheim Rulebook (core)",
		cost: "10 gc",
		availability: "Common",
		description:
			"The bow is carried by most races and used extensively in warfare. It is a compact yet powerful weapon, that is cheap to make and easy to maintain.",
		range: '24"',
		strength: "3",
	},

	cathayanCandles: {
		name: "Cathayan Candles",
		source: "Border Town Burning Supplement (1c)",
		cost: "25 + D6 gc",
		availability: "Rare 9",
		description:
			"Cathayan Candles are explosive pots or sticks, made with black powder and other foreign ingredients. These volatile Bombas as peddled by Arabyan dealers, 'usually' detonate on impact, igniting objects and bodies with which they make contact.",
		range: '6"',
		strength: "6",
		specialRules: [
			{
				name: "Thrown Weapon",
				description:
					"A model using Cathayan candles does not suffer penalties for range or moving.",
			},
			{
				name: "Volatile",
				description:
					"On a roll of 1 to hit, Cathayan candles explode in the throwers hand. Roll to wound treating the throwing model as the target.",
			},
			{
				name: "Set on Fire",
				description:
					"If you hit with the Cathayan candles roll a D6. If you score a 5+ your opponent has been set on fire. They must roll a D6 in the Recovery phase and score a 4+ to put themselves out or they will suffer a Strength 4 hit and will be unable to do anything other than move for each turn they are on fire. Allies may also attempt to put the warrior out. They must be in base contact and need a 4+ to be successful.",
			},
		],
	},

	crossbow: {
		name: "Crossbow",
		source: "Mordheim Rulebook (core)",
		cost: "25 gc",
		availability: "Common",
		description:
			"A crossbow consists of a short, strong bowstave mounted on a wooden or steel stock. The crossbows of the Empire are made of steel and often include a winding mechanism to draw back the string. It takes a long time to prepare a crossbow, but a bolt fired from one has a tremendous range and can penetrate armour easily. Crossbows take much longer than other bows to make, so they are expensive and relatively rare weapons. Still, they are the preferred weapon of many in Mordheim because of their power and long range.",
		range: '30"',
		strength: "4",
		specialRules: [
			{
				name: "Move or Fire",
				description:
					"You may not move and fire a crossbow on the same turn, other than to pivot on the spot to face your target or to stand up.",
			},
		],
	},

	crossbowPistol: {
		name: "Crossbow Pistol",
		source: "Mordheim Rulebook (core)",
		cost: "35 gc",
		availability: "Rare 9",
		description:
			"Crossbow pistols are masterpieces made by expert weaponsmiths. They are miniature crossbows with all the power and accuracy of the real thing. As these weapons may be easily concealed, they are the favoured weapon of assassins.",
		range: '10"',
		strength: "4",
		specialRules: [
			{
				name: "Shoot In Hand-To-Hand Combat",
				description:
					"A model armed with a crossbow pistol may shoot it in the first round of a hand-to-hand combat and this shot is always resolved first, before any blows are struck. This shot has an extra -2 to hit penalty. Use model's Ballistic Skill to see whether it hits or not. This bonus attack is in addition to any close combat weapon attacks.",
			},
			{
				name: "Hand-To-Hand",
				description:
					"Pistols can be used in hand-to-hand combat as well as for shooting. A model armed with a pistol and another close combat weapon gains +1 Attack, which is resolved at Strength 4. This bonus attack can be used only once per combat. If you are firing a brace of pistols, your model can fight with 2 Attacks in the first turn of close combat. These attacks are resolved with a model's Weapon Skill like any normal close combat attack and likewise may be parried. Successful hits are resolved at Strength 4, regardless of the firer's Strength.",
			},
		],
	},

	elfBow: {
		name: "Elf Bow",
		source: "Mordheim Rulebook (core)",
		cost: "35 + 3D6 gc",
		availability: "Rare 12",
		description:
			"Elven bows are the finest missile weapons of their kind. Constructed from ithilmar or wood from the Elf forests, with strings woven from the hair of Elf maidens, Elven bows are far superior to any missile weapons made by other races. In the hands of an Elven archer, the Elf bow is a truly potent weapon, its long range and penetrating power making it far superior to any bow made by humans.",
		range: '36"',
		strength: "3",
		specialRules: [
			{
				name: "Save Modifier",
				description:
					"An Elf bow has a -1 save modifier on armour saves against it.",
			},
		],
	},

	fishHookShot: {
		name: "Fish-Hook Shot",
		source: "Border Town Burning (1c)",
		cost: "10 gc",
		availability: "Rare 7",
		warbandRestrictions: ["Battle Monks of Cathay"],
		description: "",
		range: '3"',
		strength: "3",
		specialRules: [
			{
				name: "Thrown Weapon",
				description:
					"Models using a fish-hook shot do not suffer penalties for range or moving as it is designed for short-range use anyway.",
			},
			{
				name: "Precise",
				description:
					"A model using a fish-hook shot is so well-trained in the use of this weapon that he may attack enemy models that are engaged in close combat. However, the hook shot is useless when the monk himself is engaged in close combat.",
			},
			{
				name: "Caused Fall",
				description:
					"The warrior may declare to try and cause an enemy model to fall instead of causing damage. The warrior must roll to hit as normal and then pass a Strength test. If the test is successful, the enemy model counts as knocked down. Apply a +1 modifier to the Strength test against large models. When a mount gets knocked down, the rider falls off (see 3-4 on the Whoa Boy! table).",
			},
		],
	},

	harpoonCrossbow: {
		name: "Harpoon Crossbow",
		source: "Border Town Burning supplement (1c)",
		cost: "50 gc",
		availability: "Rare 10",
		warbandRestrictions: ["Maneaters"],
		description:
			"Little more than a crude crossbow hybrid, scaled up for the sake of a titanic marksman.",
		range: '30"',
		strength: "5",
		specialRules: [
			{
				name: "Move or fire",
				description: "May not move and fire in the same turn.",
			},
			{
				name: "Prepare shot",
				description: "Requires a full turn to prepare before shooting.",
			},
		],
	},

	javelins: {
		name: "Javelins",
		source: "Town Cryer #23 (1b)",
		cost: "5 gc",
		availability: "Common",
		warbandRestrictions: [
			"Amazons (Mordheim)",
			"Norse Explorers",
			"Pit Fighters",
		],
		description:
			"Javelins are short throwing spears specially weighted to travel quite a distance. Although they have a much reduced range when compared to an arrow they can cause quite considerable damage when thrown by a person of great strength.",
		range: '8"',
		strength: "As user",
		specialRules: [
			{
				name: "Thrown weapon",
				description:
					"Javelins are thrown weapons and the warrior suffers no penalty for range or moving.",
			},
		],
	},

	longBow: {
		name: "Long Bow",
		source: "Mordheim Rulebook (core)",
		cost: "15 gc",
		availability: "Common",
		description:
			"A long bow is made of alternating layers of either yew or elm. A skilled archer can hit a chosen leaf on a tree from three hundred paces with this weapon. The long bow is favoured by experienced archers due to its great reach and accuracy.",
		range: '30"',
		strength: "3",
	},

	nekhekharanJavelins: {
		name: "Nehekharan Javelins",
		source: "Town Cryer 18 (1b)",
		cost: "10 gc",
		availability: "Common",
		warbandRestrictions: ["Tomb Guardians"],
		description:
			"These warriors throw javelins equipped with a becket; a string wound around the javelin. When it is thrown, the Javelin spins like a bullet increasing its accuracy.",
		range: '8"',
		strength: "As user",
		specialRules: [
			{
				name: "+1 to hit",
				description: "These javelins receive +1 to hit when thrown.",
			},
		],
	},

	repeaterCrossbow: {
		name: "Repeater Crossbow",
		source: "Mordheim Rulebook (core)",
		cost: "40 gc",
		availability: "Rare 8",
		description:
			"Repeater crossbows are extremely complex devices, expensive to acquire and difficult to make. While this makes them rare, they certainly have their uses: they can rain a deadly hail of bolts on enemies, and a warrior using one may move quite fast and still fire his weapon.",
		range: '24"',
		strength: "3",
		specialRules: [
			{
				name: "Fire twice",
				description:
					"A model armed with a repeater crossbow may choose to fire twice per turn with an extra -1 to hit penalty on both shots.",
			},
		],
	},

	shortBow: {
		name: "Short Bow",
		source: "Mordheim Rulebook (core)",
		cost: "5 gc",
		availability: "Common",
		description:
			"Short bows are small, short-ranged bows that are cheap and require little strength to use. Some cavalry carry a shortened bow which is easier to shoot from horseback than a larger bow. Halflings also use short bows, as they lack the strength and height required to use a long bow.",
		range: '16"',
		strength: "3",
	},

	sling: {
		name: "Sling",
		source: "Mordheim Rulebook (core)",
		cost: "2 gc",
		availability: "Common",
		description:
			"Slings are rarely used, mainly because they are no more powerful than bows and have a shorter range. A sling is little more than a looped strip of cloth or leather into which a stone is placed. The sling is whirled about the slinger's head and the sling stone is then released towards the target. While this weapon is looked down upon by most archers, a skilled slinger can slay a man from a considerable distance, and the ammunition is easy to find: rocks are everywhere and free!",
		range: '18"',
		strength: "3",
		specialRules: [
			{
				name: "Fire twice at half range",
				description:
					'A slinger may fire twice in the shooting phase if he does not move in the movement phase. He cannot shoot over half range (9") though, if he fires twice. If the model fires twice then each shot is at -1 to hit.',
			},
		],
	},

	sunGauntlet: {
		name: "Sun Gauntlet",
		source: "Town Cryer #23 (1b)",
		cost: "40 gc",
		availability: "Rare 12",
		warbandRestrictions: ["Amazons (Mordheim)"],
		description:
			"This, as with all strange arcane Amazon items, is made from an unknown multicoloured metal that is impervious to damage or corrosion. It is covered in strange runes and a bright gemstone is set into the hilt. In many ways this weapon resembles a blackpowder pistol. It can be held in one hand and when pointed at an enemy unleashes a blinding beam of energy like the Sunstaff.",
		range: '12"',
		strength: "4",
		specialRules: [
			{
				name: "Accurate",
				description:
					"The Sun Gauntlet does not suffer the usual -1 modifier to hit for long range.",
			},
			{
				name: "No Save",
				description:
					"The beam from a Sun Gauntlet can literally cut through anything. A warrior wounded by a Sun Gauntlet receives no armour save whatsoever.",
			},
			{
				name: "Hand-To-Hand",
				description:
					"The Sun Gauntlet can be used with another close combat weapon in hand-to-hand combat with Strength 4 and no armour save. Because it does not require prepared shot, this bonus attack may be used in each turn of combat.",
			},
		],
	},

	sunstaff: {
		name: "Sunstaff",
		source: "Town Cryer #23 (1b)",
		cost: "50 gc",
		availability: "Rare 12",
		warbandRestrictions: ["Amazons (Mordheim)"],
		description:
			"The Sunstaff is a long tubular stick that is made from a strange multicoloured metal with one end hollow like a tube. Strange runes are carved along its length and a large gemstone is set into the pommel. Despite being extremely ancient (Elf Loremasters of the White Tower of Hoeth claim to have found a similar device that they surmise is more than 20,000 years old – older than the Elven race itself!), the wielder of the Sunstaff can discharge a beam of energy akin to the rays of the sun.",
		range: '24"',
		strength: "4",
		specialRules: [
			{
				name: "Accurate",
				description:
					"The Sunstaff does not suffer the usual -1 modifier to hit for long range.",
			},
			{
				name: "No Save",
				description:
					"The beam from a Sunstaff can literally cut through anything. A warrior wounded by a Sunstaff receives no armour save whatsoever.",
			},
		],
	},

	sunstaffLustria: {
		name: "Sunstaff (Lustria)",
		source: "Town Cryer #15 (1b)",
		cost: "35 gc",
		availability: "Rare 10",
		warbandRestrictions: ["Amazons (Lustria)"],
		description:
			"The Sunstaff is a long staff made from a strange multicoloured metal with one end hollow like a tube. Strange runes are carves along its length and a large gemstone is set into the pommel.",
		range: '12" / Close Combat',
		strength: "As user",
		specialRules: [
			{
				name: "Sunbolt",
				description:
					'The wielder of the sunstaff can discharge a beam of energy in the shooting phase that is akin to rays of the sun. The Sunbolt has a range of 12" and hits at Strength 4. Aside from ward and dodge saves a Sunbolt ignores armour saves and penalties for long range.',
			},
		],
	},

	throwingKnivesStars: {
		name: "Throwing Knives/Stars",
		source: "Mordheim Rulebook (core)",
		cost: "15 gc",
		availability: "Rare 5",
		description:
			"Throwing stars are used mainly by the assassins of the sinister House of Shadows, or by street thugs who specialise in ambushing the unwary. A perfectly balanced knife thrown from behind has ended the life of many a noble and merchant in Mordheim. Throwing knives are not suitable for close combat, as their balance makes them unwieldy in close quarters.",
		range: '6"',
		strength: "As user",
		specialRules: [
			{
				name: "Thrown Weapon",
				description:
					"Models using throwing stars or knives do not suffer penalties for range or moving as these weapons are perfectly balanced for throwing. They cannot be used in close combat.",
			},
		],
	},

	tufenk: {
		name: "Tufenk",
		source: "Khemri setting, Town Cryer #17 (1b)",
		cost: "15 gc",
		availability: "Rare 10",
		description:
			"This is a blowpipe that projects alchemical fire about eight feet causing burning damage.",
		range: '8"',
		strength: "2",
		specialRules: [
			{
				name: "Fire",
				description:
					"If you hit roll a D6, on a 4+ your opponent is set on fire. They must roll a D6 each Recovery phase, on a 4+ they extinguish the fire or they immediately suffer a S4 hit and may only move. Friendly models may help in extinguishing the model that is ablaze. They must be in base-to-base contact and need to roll a 4+ on a D6. Against dry targets like Mummies they are Strength 3 and on a 2+ on 1D6 the Mummy catches fire.",
			},
			{
				name: "Prepare Shot",
				description:
					"The Tufenk takes a complete turn to reload, so your model may only fire every other turn.",
			},
		],
	},
};

export { missileWeapons };
