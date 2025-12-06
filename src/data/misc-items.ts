import type { MiscellaneousItem, PoisonOrDrug, Vehicle } from "./types";

// Main Equipment Object
const miscellaneousEquipment = {
	regularItems: [
		{
			name: "Amulet of the Moon",
			cost: "50 gc",
			availability: "Rare 12 (Amazons only, Rare 11 for Amazons (Lustria))",
			description:
				"This ancient amulet creates a shimmering aura around the Amazon that makes it harder for enemies to see them.",
			specialRules:
				"Any missile fire directed at a model equipped with the amulet suffers a penalty of -1 to hit. The amulet also confers a special save of 5+ against missile fire.",
		},
		{
			name: "Asp Arrows",
			cost: "10 gc",
			availability: "Common? (Tomb Guardians Tomb lord only)",
			description:
				"Made from the mummified remains of poisonous snakes, these are guided through the air by ancient magic.",
			specialRules: "+1 to hit",
		},
		{
			name: "Banner",
			cost: "10 gc",
			availability: "Rare 5",
			description:
				"Many more established warbands carry a banner or flag, not only to announce their presence but to also act as a rallying point for the warband during a battle.",
			specialRules:
				"A banner requires one hand to use and can be carried by any Hero in the warband. Friendly warriors within 12\" of the banner bearer may re-roll any failed 'All Alone' test; but remember, you can't re-roll a failed re-roll.",
		},
		{
			name: "Bear-Claw Necklace",
			cost: "75 +3D6 gc",
			availability: "Rare 9 (Kislevite Heroes only)",
			description:
				"Bears are widely regarded as sacred in Kislev, and a necklace made of their claws (or sometimes their teeth) is considered magical and reputed to have magical powers.",
			specialRules:
				"A warrior wearing a bearclaw necklace receives some of the strength and wild ferocity of the bear it came from. A warrior wearing a bear-claw necklace becomes subject to Frenzy.",
		},
		{
			name: "Blessed Stag Hide",
			cost: "40 gc",
			availability: "Rare 10 (Horned Hunters only)",
			description:
				"The animal skin is worn as a drape and is a symbol of honour once blessed by the hierarchs of Taal.",
			specialRules:
				"A blessed hide bestows unchallenged grace to the wearer allowing the re-roll of a failed Initiative test once per turn.",
		},
		{
			name: "Blessed Water",
			cost: "10 + 3D6 gc",
			availability:
				"Rare 6 (Common for Warrior-Priests and Sisters of Sigmar; May not be bought by Undead)",
			description:
				"The priests of Ulric, Sigmar, Mórr and Manann hold great power over evil. Pure water from a clear fountain, blessed by one of these priests, is said to burn things of darkness and evil.",
			specialRules:
				"A vial of blessed water contains enough liquid for just one use, and has a thrown range of twice the thrower's Strength in inches. Roll to hit using the model's BS. No modifiers for range or moving apply. Blessed water causes 1 wound on Undead, Daemon or Possessed models automatically. There is no armour save. Undead or Possessed models may not use blessed water.",
		},
		{
			name: "Book of the Dead",
			cost: "200 + D6 x 25 gc",
			availability: "Rare 12 (Vampires and Necromancers only)",
			description:
				"This is a book that contain transcripts from the famous books of Nagash, the Great Necromancer.",
			specialRules:
				"A Vampire can learn Necromantic magic with the Arcane Lore skill and this book and a Necromancer will gain a new spell permanently.",
		},
		{
			name: "Bota Bag",
			cost: "5 gc",
			availability: "Common",
			specialRules:
				"Like a wine skin it allows the owner to carry one more water unit than normal. Each character may only take one Bota Bag.",
		},
		{
			name: "Bugman's Ale",
			cost: "50 + 3D6 gc",
			availability: "Rare 9",
			description:
				"Of all the Dwarf brewmasters, Josef Bugman is the most famous. His ale is known throughout the Old World, and widely regarded as the best.",
			specialRules:
				"A warband that drinks a barrel of Bugman's before a battle will be immune to fear for the whole of the battle. Elves may not drink Bugman's ale as they are far too delicate to cope with its effects. There is only enough ale to supply the warband for one battle.",
		},
		{
			name: "Caltrops",
			cost: "15 + 2D6 gc",
			availability: "Rare 6",
			description:
				"Originally used on the battlefield to impede cavalry charges, a caltrop is a small spiked iron ball. In the City of the Damned a pouch of these small items can be enough to deter any attacker who risks serious injury should they try to charge over them.",
			specialRules:
				"There are enough caltrops to last for one use only. They may be used when an opponent decides to charge. The defender simply throws the caltrops into the path of his attacker and they reduce his charge range by D6 inches. If this means that the attacker cannot reach his target then it is a failed charge.",
		},
		{
			name: "Cathayan Silk Clothes",
			cost: "50 + 2D6 gc",
			availability: "Rare 9",
			description:
				"Some rich warband leaders like to flaunt their wealth and purchase clothes made out of silk from distant Cathay. This silk is the most expensive fabric in the known world, and wearing such clothes is a sure way to attract attention – especially thieves and assassins!",
			specialRules:
				"Any Mercenary warband whose leader is wearing silk clothes may re-roll the first failed Rout test. However, after each battle in which the leader is taken out of action, roll a D6. On a roll of 1-3 the clothes are ruined and must be discarded.",
		},
		{
			name: "Chest",
			cost: "5 gc",
			availability: "Common",
			description:
				"Chests are often used to store weapons, equipment and victuals. And sometimes even more valuable luggage can be found inside the 'trunk'.",
			specialRules:
				"Cumbersome: A chest must be carried by two models. The carriers must remain in base contact with the chest or it is dropped. They may not use ranged weapons or attack in combat.",
		},
		{
			name: "Compass",
			cost: "45 + 2D6 gc",
			availability: "Rare 9 (Pirates only)",
			description:
				"A compass can be a big help on the land as well as at sea, by helping the pirates navigate faster and more accurately around the seemingly random ruins of the blasted city.",
			specialRules:
				"In any scenarios where players roll to see which side deploys first, then his warband may re-roll their result. This can only be done if the pirate with the compass is not missing the game though! Note that only one re-roll is allowed, even If multiple pirates have a Compass, and if both sides have one then no re-rolls are allowed.",
		},
		{
			name: "Conch Shell Horn",
			cost: "25 gc",
			availability: "Rare 8 (Amazons (Lustria) Piranha Warrior only)",
			description:
				"The Conch shell Horn is used by experienced Piranha warriors to warn the warband of approaching enemies.",
			specialRules:
				"At the beginning of the game a Piranha warrior may use the horn to re-roll when deciding who deploys first and who goes first. Multiple models that have the horn cannot force a second re-roll.",
		},
		{
			name: "Elven Boots",
			cost: "75 + D6 x 10 gc",
			availability: "Rare 12",
			description:
				"A rare but highly prized item, Elven boots are made from the finest materials. They are light weight and supple granting the wearer almost supernatural speed to match that of the fey race that created them.",
			specialRules:
				"Elven boots increase the wearer's move characteristic by +1. This can take a warrior's move value above its maximum.",
		},
		{
			name: "Elven Cloak",
			cost: "100 + D6 x 10 gc",
			availability: "Rare 12",
			description:
				"Made from the hair of Elven maidens and interwoven with living tree leaves, an Elven cloak is a wonder to behold. A warrior wearing such a cloak will blend into the shadows, making it very difficult to shoot at them with missile weapons.",
			specialRules:
				"A warrior aiming a missile weapon at a warrior wearing an Elven cloak suffers -1 on his to hit roll.",
		},
		{
			name: "Elven Runestones",
			cost: "50 + 2D6 gc",
			availability: "Rare 11 (Shadow Warrior Weavers only)",
			description:
				"High Elven mages are well known as the masters of defensive magic. To aid them, they have developed several mystic runes of power.",
			specialRules:
				"A mage with Elven Runestones may use them to attempt to dispel a spell that has been successfully cast against himself or another member of his warband. To dispel such a spell, the mage must roll against the spell's Difficulty (Sorcery does not help here). If he succeeds, the spell fails to work. If the roll fails, the spell works normally",
		},
		{
			name: "Elven Wine",
			cost: "50 + 3D6 gc",
			availability: "Rare 10 (Shadow Warriors only)",
			description:
				"High Elven wines are well known to be the best in the world, and some are even rumoured to have magical qualities.",
			specialRules:
				"A Shadow Warrior Warband that drinks Elven Wine before a battle will be immune to fear for the whole of the battle.",
		},
		{
			name: "Enchanted Skins",
			cost: "20 gc",
			availability: "Rare 6 (Amazons (Lustria) only)",
			description:
				"The protective skins and charms that the Amazons wear have been warded with defensive magic.",
			specialRules:
				"To represent this, any model wearing Skins and Charms receives a 6+ special save versus any wounds inflicted. In addition, the wearer of Skins and Charms is unaffected by enemy magic on a roll of 5+.",
		},
		{
			name: "Familiar",
			cost: "20 + D6 gc (Gold is spent even on unsuccessful rare roll)",
			availability:
				"Rare 8 (All warbands*, only spell casters may attempt to find)",
			description:
				"Wizards are often solitary, usually shunned by those who can barely conceive of, much less understand, the power these individuals wield.",
			specialRules:
				"Familiars cannot actually be purchased as normal equipment. The cost to 'purchase' a familiar actually represents the cost of materials to cast the ritual to summon a familiar and form a magical bond with it. A wizard with a familiar is allowed to re-roll one failed roll to cast a spell each turn.",
		},
		{
			name: "Fire Arrows",
			cost: "30 + D6 gc",
			availability: "Rare 9",
			description:
				"Fire arrows are tied with rags soaked in oil bunched tip to a tight pouch that explodes when hitting the target, setting clothes and equipment alight.",
			specialRules:
				"If you hit with a fire arrow roll a D6. If you score a 4+ your opponent has been set on fire. They must roll a D6 in the recovery phase and score a 4+ to put themselves out or they will suffer a strength 4 hit and will be unable to do anything other than move for each turn they are on fire. The fire arrows last for one battle only.",
		},
		{
			name: "Fire Bomb",
			cost: "35 + 2D6 gc",
			availability: "Rare 9",
			description:
				"Designed by the dwarf engineers of the World's Edge Mountains, fire bombs are a rare and deadly weapon.",
			specialRules:
				"The fire bomb may be thrown in the shooting phase in the same way as blessed water. If the bomb lands on target the warrior hit takes D3 Strength 4 hits with no saves for armour and all warriors, friend or foe, within 1 inch of him take 1 Strength 3 hit with saves as normal.",
		},
		{
			name: "Firecrackers",
			cost: "20 gc",
			availability: "Rare 9",
			description:
				"These tiny explosives are too weak to set something on fire or to injure human beings. Firecrackers generate a loud noise, causing alarm in animals.",
			specialRules:
				"If an animal or mounted warrior tries to charge the model, while it is not in combat, knocked down or stunned, it may pass an Initiative test in order to use the firecrackers. If it succeeds the animal must pass an Ld test. If it fails the test, the charge has failed and mounted warriors have to roll on the Whoa Boy! table.",
		},
		{
			name: "Flash Powder",
			cost: "25 + 2D6 gc",
			availability: "Rare 8",
			description:
				"An ancient Dwarf creation, flash powder is used in mines to illuminate darkened fissures in the search for gold and other precious minerals.",
			specialRules:
				"Flash powder can be thrown as an enemy charges the wielder (as an interrupt). The charger must take an immediate Initiative test in order to cover their eyes. If he fails, he is temporarily blinded and it counts as a failed charge. There is only enough flash powder for one use during the battle.",
		},
		{
			name: "Garlic",
			cost: "1 gc",
			availability: "Common (May not be bought by Undead)",
			description:
				"Garlic is a common herb grown in most gardens of the Empire. It is said to ward off Vampires and other denizens of the dark.",
			specialRules:
				"A Vampire must pass a Leadership test or it will be unable to charge a model carrying a clove of garlic. Garlic lasts for the duration of one battle only, whether it is used or not.",
		},
		{
			name: "Halfling Cookbook",
			cost: "30 + 3D6 gc",
			availability:
				"Rare 7 (Undead or the Carnival of Chaos may not use this item)",
			description:
				"All Halfling chefs have their own secret recipes, and these are recorded in tomes handwritten in Mootland.",
			specialRules:
				"The maximum number of warriors allowed in your warband is increased by +1.",
		},
		{
			name: "Holy (Unholy) Relic",
			cost: "15 + 3D6 gc",
			availability: "Rare 8 (Rare 6 for Warrior-Priests and Sisters of Sigmar)",
			description:
				"In this age of superstition and religious fanaticism, holy objects are an important part of life.",
			specialRules:
				"A model with a holy relic will automatically pass the first Leadership test he is required to make in the game. If worn by the leader, it will allow him to automatically pass the first Rout test if he has not taken any Leadership tests before.",
		},
		{
			name: "Holy Tome",
			cost: "100 + D6 x 10 gc",
			availability: "Rare 8 (Warrior-Priests and Sisters of Sigmar only)",
			description:
				"Books of prayers and descriptions of the holy deeds of religious heroes like Sigmar Heldenhammer are copied by hand in the scriptoriums of Sigmar and Ulric.",
			specialRules:
				"A Warrior Priest or Sister of Sigmar with a holy tome can add +1 to the score when determining whether he (or she) can recite a spell successfully or not.",
		},
		{
			name: "Hook Hand",
			cost: "4 gc",
			availability: "Common (Pirates only)",
			description:
				"Pirates who have lost a hand or arm due to a Hand Injury or Arm Wound can be fitted with a sharpened metal hook.",
			specialRules:
				"The wearer of the stylish new device cannot use any two-handed weapons, but will always count as having a close combat weapon in that hand. The hook strikes in close combat in the same manner as a dagger.",
		},
		{
			name: "Hunting Arrows",
			cost: "25 + D6 gc",
			availability: "Rare 8",
			description:
				"The best hunting arrows are made by the hunters of Drakwald forest. They have sharp, barbed arrowheads which cause excruciating pain when they hit their target.",
			specialRules:
				"A model using a Short Bow, Bow, Long Bow or Elf Bow may use these arrows. They add +1 to all Injury rolls.",
		},
		{
			name: "Jolly Roger",
			cost: "40 + 2D6 gc",
			availability: "Rare 9 (Pirates only)",
			description:
				"Ah, the sight of the Jolly Roger waving in the wind is enough to bring a tear to the eye of even the toughest old salty dog.",
			specialRules:
				'Any Pirates within 12" of the Jolly Roger never count as being all alone in combat. Carrying the banner takes up one hand though, so that model may not carry or use any two-handed weapons during the game.',
		},
		{
			name: "Ladders",
			cost: "Small: 5 gc, Large: 10 gc",
			availability: "Small: Common, Large: Rare 5",
			description:
				"A ladder is a useful tool for reaching higher ground such as scaling walls or trees.",
			specialRules:
				'A ladder is placed on the board like any other model. A Ladder requires two models, Heroes or Henchmen, (or a single large model) to carry it. Small ladders have a length of up to 3", large ladders are longer than 3".',
		},
		{
			name: "Lantern",
			cost: "10 gc",
			availability: "Common",
			specialRules:
				'A model that is in possession of a lantern may add +4" to the distance from which he is able to spot hidden enemies.',
		},
		{
			name: "Lock Picks",
			cost: "15 gc",
			availability: "Rare 8",
			description:
				"A standard piece of kit for less scrupulous characters. A set of lock picks may be used by those who rely more on skill-at-arms and speed of thought than brute strength to open doors that others have secured.",
			specialRules:
				"A model equipped with a set of lock picks may make his test to open doors on his Initiative rather than his Strength characteristic if he wishes.",
		},
		{
			name: "Lucky Charm",
			cost: "10 gc",
			availability: "Rare 6",
			description:
				"These take many shapes, but the most common are symbolic hammers that a pious Sigmarite Priest has touched, or carved heads of ancient Dwarf gods.",
			specialRules:
				"The first time a model with a lucky charm is hit in a battle they roll a D6. On a 4+ the hit is discarded and no damage is suffered.",
		},
		{
			name: "Map of Cathay",
			cost: "20 + 4D6 gc",
			availability: "Rare 9",
			description:
				"There are many maps circulating for various regions around Cathay and the borderlands. Most of them cannot be trusted but now and then a warband may get hold of a valuable chart.",
			specialRules:
				"Roll a D6 to determine what the map depicts (see table in source)",
		},
		{
			name: "Mordheim Map",
			cost: "20 + 4D6 gc",
			availability: "Rare 9",
			description:
				"Some survivors of the cataclysm still remain in the many settlements around Mordheim, and make a living by preparing maps of the city from memory.",
			specialRules:
				"A map can help a warband find their way through the confusing maze of streets and into areas with rich buildings to loot. When you buy a map, roll a D6 (see table in source)",
		},
		{
			name: "Net",
			cost: "5 gc",
			availability: "Common",
			description:
				"Steel nets, such as those used by Pit Fighters, can be used in battles.",
			specialRules:
				'Once per game, the net may be thrown in the shooting phase instead of the model shooting a missile weapon. Treat the net as a missile weapon in all respects with a range of 8". If it hits, the target must immediately roll a D6. If the result is equal to, or lower than his Strength, he rips the net apart. If the result is higher, he may not move, shoot or cast spells in his next turn.',
		},
		{
			name: "Parrot",
			cost: "15 gc",
			availability: "Rare 8 (Pirate Captain and Mates only)",
			description:
				"Squawk! Pieces of Wyrdstone, Pieces of Wyrdstone! A well trained parrot is excellent at distracting opponents.",
			specialRules:
				"All enemy in base contact with the owner will be at –1 to hit in their first round of combat with the pirate unless they can pass a Leadership Test.",
		},
		{
			name: "Peg Leg",
			cost: "8 gc",
			availability: "Common (Pirates only, one per model)",
			description:
				"Any Pirate suffering a Leg Wound or Smashed Leg can opt to have his ruined leg replaced with a stout wooden peg leg.",
			specialRules:
				"This will reduce his Movement (and maximum possible Movement characteristic) by -1, but offers a chance that stray hits will strike the leg instead. This gives him a special saving throw of 6+.",
		},
		{
			name: "Poisoned Weapon",
			cost: "+25 gc",
			availability: "Common (Forest Goblins only)",
			description:
				"Forest Goblins commonly jab their weapon points into the bodies of giant spiders in hopes of coating them with deadly poison.",
			specialRules:
				"Once this poison is bought, it is applied to one weapon, and may not be traded or sold later on. The weapon in question, once poisoned, adds +1 to any injury rolls from then on.",
		},
		{
			name: "Rabbit's Foot",
			cost: "10 gc",
			availability: "Rare 5",
			description:
				"The rabbit's foot is it symbol of good luck and often worn about the neck on a thin cord of leather by superstitious warriors.",
			specialRules:
				"A rabbit's foot allows the warrior wearing it to reroll one dice during the battle. If not used in the battle it can be used to reroll one dice during the exploration phase providing the hero is able to search through the ruins.",
		},
		{
			name: "Rain Coat",
			cost: "10 gc",
			availability: "Common",
			description:
				"Rain Coats or Capes protect its wearer – and especially his equipment – from becoming soaked with water.",
			specialRules:
				"Note that this miscellaneous item is an exception to the normal rules as it is available to Henchmen.",
		},
		{
			name: "Rope & Hook",
			cost: "5 gc",
			availability: "Common",
			description:
				"A warrior using a rope & hook will find it much easier to move amongst the ruins of Mordheim.",
			specialRules:
				"A warrior equipped with a rope & hook may re-roll failed Initiative tests when climbing up and down.",
		},
		{
			name: "Rosary",
			cost: "10 gc",
			availability: "Rare 6",
			description:
				"A rosary is made of stone or ivory beads and other blessed ornaments lined up on a chain. It helps concentrate while praying or meditating.",
			specialRules:
				"A prayer user wearing a Rosary may re-roll a failed Difficulty test if he hasn't done anything that turn except moving (no running) or remaining stationary. A Rosary cannot be used in combat.",
		},
		{
			name: "Smoke Bomb",
			cost: "30 + 2D6 gc",
			availability: "Rare 10",
			description:
				"The Cathayans are experts in working with blackpowder, poisons and other strange natural ingredients far superior to anything known to alchemists of the Old World.",
			specialRules:
				'At the beginning of the Movement phase, a smoke bomb may be thrown at any point within 4" where it creates a thick smoke of 2" radius that lasts until the beginning of the model\'s next turn.',
		},
		{
			name: "Superior Blackpowder",
			cost: "30 gc",
			availability: "Rare 11",
			description:
				"The model has acquired a better quality of blackpowder than is normally available.",
			specialRules:
				"This new batch adds +1 Strength to all blackpowder weapons that the model has. There is enough superior blackpowder to last for one game.",
		},
		{
			name: "Tarot Cards",
			cost: "50 gc",
			availability:
				"Rare 7 (Not available to Witch Hunters or Sisters of Sigmar)",
			description:
				"Though declared blasphemous and illegal by the Grand Theogonist, the Tarot of Stars is said to foretell the future for those who dare to consult it.",
			specialRules:
				"A Hero with a deck of tarot cards may consult them before each game. Make a Leadership test. If successful, the Hero gains a favorable insight into the future and you may modify the result of any one dice in the Exploration phase by -1/+1.",
		},
		{
			name: "Telescope",
			cost: "75 + 3D6 gc",
			availability: "Rare 10",
			description:
				"Common to the great astronomers in the observatories at Nuln, telescopes are a useful, if highly rare, item to have in the City of the Damned.",
			specialRules:
				"Any hero using a telescope may increase the range of any missile weapon he is using by D6 inches each turn. Furthermore, he triples the distance at which he can spot hidden enemies.",
		},
		{
			name: "Tome of Magic",
			cost: "200 + D6 x 25 gc",
			availability:
				"Rare 12 (Not available to Witch Hunters or Sisters of Sigmar)",
			description:
				"Sometimes books of forbidden lore are offered for sale in the markets and dark alleys of the settlements around Mordheim.",
			specialRules:
				"If a warband includes a wizard, he will gain an extra spell from the tome, permanently. He may randomly generate this new spell from his own list or the Lesser Magic list.",
		},
		{
			name: "Torch",
			cost: "2 gc",
			availability: "Common",
			description:
				"Warriors lacking the funds for a lantern may have to make do with torches.",
			specialRules:
				'Torches act exactly as lanterns, adding +4" to the range the model may spot hidden enemies. A torch will only last one game. A model armed with a torch counts as causing fear in animals.',
		},
		{
			name: "War Horn",
			cost: "30 + 2D6 gc",
			availability: "Rare 8",
			description:
				"The blaring sound of a war horn can be enough to stir the hearts of any warband which it is attempting to bolster.",
			specialRules:
				"A war horn may be used once per battle at the beginning of any turn. It allows the warband to increase its Leadership by +1. The effect will last from the start of one turn to the start of the next.",
		},
		{
			name: "Wheelbarrow",
			cost: "5 gc",
			availability: "Rare 5",
			description:
				"Probably the adventurer's best friend, wheelbarrows allow for convenient transport of all sorts of bulky objects like treasure chests and powder kegs.",
			specialRules:
				"A wheelbarrow is placed on the board like any other model. A Hero or Henchman who is neither an animal nor stupid may push a wheelbarrow while he is in base-contact with it.",
		},
		{
			name: "Winter Furs",
			cost: "5 gc",
			availability: "Common (Not available to Beastmen)",
			description:
				"Winter clothes include Snow Shoes and Pelts. A model wearing a pelt clothing is immune to special rules from Bitter Cold weather.",
			specialRules:
				"If the pelt clothing becomes soaked with water, it is useless for the rest of the battle. Note that like Rain Coats, this item may be used by Henchmen also.",
		},
		{
			name: "Wolfcloak",
			cost: "10 gc",
			availability:
				"Special (Middenheimers, Norse Explorers and Marauders of Chaos only)",
			description:
				"In Middenheim it is still considered to be the feat of a true man to slay a great wolf single-handed.",
			specialRules:
				"To acquire a Wolfcloak, a Hero must pay 10 gc. A model wearing a Wolfcloak will gain +1 to his armour saves against all shooting attacks.",
		},
		{
			name: "Wyrdstone Pendulum",
			cost: "25 + 3D6 gc",
			availability: "Rare 9",
			description:
				"Pendulums made of wyrdstone can reputedly be used to find even more of the magical stone.",
			specialRules:
				"If he was not taken out, the Hero using the Wyrdstone Pendulum may make a Leadership test after the battle. If he is successful, you may re-roll any one dice in the Exploration phase.",
		},
	] as MiscellaneousItem[],

	poisonsAndDrugs: [
		{
			name: "Black Lotus",
			cost: "10 + D6 gc",
			availability:
				"Rare 9 (Not available to Witch Hunters, Warrior-Priests or Sisters of Sigmar. Rare 7 for Skaven and Lizardmen, 10 gc and Common For Skink Heroes)",
			description:
				"In the deepest forests of the Southlands grows a plant that is extremely poisonous.",
			specialRules:
				"A weapon coated with the sap of the Black Lotus will wound its target automatically if you roll a 6 to hit.",
		},
		{
			name: "Crimson Shade",
			cost: "35 + D6 gc",
			availability: "Rare 8",
			description:
				"Crimson Shade is the name given by Old Worlders to the leaves of the blood oak of Estalia. It is an extremely addictive drug, but grants its users inhuman quickness and strength.",
			effect:
				"A model using Crimson Shade has his Initiative increased by +D3 points, and Movement and Strength by +1 (this effect lasts for one game).",
			sideEffects:
				"After the battle, roll 2D6. On a roll of 2-3, the model becomes addicted. On a roll of 12 the model's Initiative is increased permanently by +1.",
		},
		{
			name: "Dark Venom",
			cost: "30 + 2D6 gc",
			availability:
				"Rare 8 (Not available to Witch Hunters, Warrior-Priests, or Sisters of Sigmar. Rare 6 for Dark Elves and Lizardmen)",
			description:
				"This is a poison extracted from Heldrakes, gigantic sea serpents that plague the Western Ocean and the coast of Naggaroth.",
			specialRules:
				"Any hit caused by a weapon coated with Dark Venom counts as having +1 Strength.",
		},
		{
			name: "Healing Herbs",
			cost: "20 + 2D6 gc",
			availability: "Rare 8 (Common for Amazons (Lustria))",
			description:
				"Certain plants that grow on the banks of the River Stir have curative properties.",
			specialRules:
				"A Hero with healing herbs can use them at the beginning of any of his recovery phases as long as he is not engaged in hand-to-hand combat. This restores all wounds he has previously lost during the game.",
		},
		{
			name: "Mad Cap Mushrooms",
			cost: "30 + 3D6 gc (25 gc for Orc Mob)",
			availability: "Rare 9 (Common if warband includes Goblins)",
			description:
				"The feared cult of Goblin Fanatics of the Worlds Edge Mountains use these hallucinogenic mushrooms to drive themselves into a frenzied state.",
			effect:
				"Any warrior who takes Mad Cap Mushrooms before a battle will be subject to frenzy.",
			sideEffects:
				"After the battle, roll a D6. On a roll of a 1 the model becomes permanently stupid.",
		},
		{
			name: "Mandrake Root",
			cost: "25 + D6 gc",
			availability: "Rare 8",
			description:
				"The man-shaped Mandrake Root grows in the rotting swamps of Sylvania. It is a noxious, deadly plant which is highly addictive and slowly kills its users.",
			effect:
				"Mandrake Root makes a man almost oblivious to pain. His Toughness is increased by +1 for the duration of a battle and he treats all stunned results as knocked down instead.",
			sideEffects:
				"Mandrake Root is highly poisonous. At the end of the battle, roll 2D6. On a roll of 2-3 the model loses 1 point of Toughness permanently.",
		},
		{
			name: "Manticore Spoor",
			cost: "30 + 2D6 gc",
			availability: "Rare 9",
			description:
				"A soporific substance just as lethal as the beast which excreted it.",
			specialRules:
				"Any model wounded by a weapon smeared with Manticore Spoor must roll a D6 at the beginning of its turn: On a roll of 1 the poisoned model loses one wound. On a roll of 6 the poison's effect ends.",
		},
		{
			name: "Reptile Venom",
			cost: "5 gc",
			availability: "Common (Skink Henchmen only)",
			specialRules:
				"Skink henchmen may buy low-strength Reptile Venom for their missile weapons at a cost of 5 pts per weapon. This adds +1 to the Strength of the weapon but does not grant the -1 save modifier. The poison only lasts for one battle.",
		},
		{
			name: "Spider Spittle",
			cost: "30 + D6 gc",
			availability: "Rare 7",
			description:
				"Toxins are harvested from small animals poisoned by spider bites to concoct a paralytic dose.",
			specialRules:
				"Any warrior hit by a weapon laced with Spider Spittle must pass an immediate Toughness test or becomes paralyzed. A paralyzed warrior cannot move or fight and is hit automatically in close combat.",
		},
		{
			name: "Tears of Shallaya",
			cost: "10 + 2D6 gc",
			availability: "Rare 7 (Not available to Possessed or Undead models)",
			description:
				"Tears of Shallaya are vials of water from the holy spring in Couronne.",
			specialRules:
				"A model who drinks a vial of the Tears of Shallaya at the beginning of a battle will be completely immune to all poisons for the duration of combat.",
		},
		{
			name: "Vial of Pestilens",
			cost: "25 + 2D6 gc",
			availability: "Rare 9 (Skaven only)",
			description:
				"This small crystal vial contains an extremely potent and rapid disease.",
			specialRules:
				"The vial may be opened and shoved in the face of the model in base contact that just took the Skaven Out of Action. The opponent must roll equal to or under its Toughness or automatically be taken Out of Action, no save is allowed. The vial may be used once.",
		},
	] as PoisonOrDrug[],

	claimedGnoblars: [
		{
			name: "Lookout-Gnoblar",
			cost: "20 gc",
			availability: "Rare 8 (Maneaters only)",
			specialRules:
				"An Ogre with a Lookout-Gnoblar gains the skill Dodge from the Speed skill list.",
		},
		{
			name: "Luck-Gnoblar",
			cost: "25 gc",
			availability: "Rare 9 (Maneaters only)",
			specialRules:
				"An Ogre with a Luck-Gnoblar may re-roll one dice during the battle. Remember you may never re-roll a re-roll.",
		},
		{
			name: "Sword-Gnoblar",
			cost: "30 gc",
			availability: "Rare 10 (Maneaters only)",
			specialRules:
				"An Ogre with a Sword-Gnoblar gains one extra Strength 2 attack in Close Combat, at the weapon skill of the owning model.",
		},
	] as MiscellaneousItem[],

	vehicles: [
		{
			name: "Engine of Chaos",
			cost: "195 gc",
			availability: "Rare 10 (Chaos Dwarfs only)",
			description:
				"Gaolers lock up their victims in a twisted daemonic machine crafted by the industrial insanity of Chaos Engineers.",
			profile: {
				Engine: { T: 8, W: 4 },
				Wheel: { T: 6, W: 1 },
				Daemon: { M: 6, T: 6, W: 3 },
			},
			specialRules:
				"The Engine of Chaos follows all rules for Wagons unless specified otherwise here. The Engine is powered by the binding of a daemon. A Chaos Dwarf must function as the driver. No more than six captives may be imprisoned in the Engine at a time.",
		},
		{
			name: "Opulent Coach",
			cost: "250 gc",
			availability: "Rare 10",
			description:
				"The height of such indulgence is an opulent coach, which the warband leader can use for driving around the settlements surrounding Mordheim.",
			specialRules:
				"The opulent coach impresses even the most suspicious merchant and they will flock to offer their most exotic wares to the obviously rich warband leader. The warband leader gains +3 to any rolls to locate rare items.",
		},
		{
			name: "Rickshaw",
			cost: "70 gc",
			availability: "Rare 8 (Humans only)",
			description: "Rickshaws are two-wheeled carts pulled by a human runner.",
			specialRules:
				"One non-animal warband member must be assigned as the runner in order to move the rickshaw. There is one seat in the rickshaw for one passenger to sit down.",
		},
		{
			name: "Rowboat",
			cost: "40 gc",
			availability: "Rare 7",
			specialRules:
				"For all the rules on how to use Rowboats, see the Vehicles of the Empire section.",
		},
		{
			name: "Riverboat",
			cost: "100 gc",
			availability: "Rare 8",
			specialRules:
				"For all the rules on how to use Riverboats, see the Vehicles of the Empire section.",
		},
		{
			name: "River Barge",
			cost: "200 gc",
			availability: "Rare 9",
			specialRules:
				"For all the rules on how to use River Barges, see the Vehicles of the Empire section.",
		},
		{
			name: "Skeleton Chariot",
			cost: "200 + 10D6 gc",
			availability: "Common? (Tomb Guardians only)",
			description:
				"A Skeleton Chariot is made from the bones of the dead, pulled by two Skeleton Steeds and ridden by a member of the warband.",
			profile: {
				Chariot: { S: 4, T: 4, W: 3 },
				Steed: { M: 8, WS: 2, BS: 2, S: 3, T: 3, W: 1, I: 2, A: 1, Ld: 5 },
			},
			specialRules:
				'A Skeleton Chariot normally moves at 8" and may not run. However, it may double its normal move when charging. Chariots are feared for their devastating charges.',
		},
		{
			name: "Trade Wagon",
			cost: "180 gc",
			availability: "Common (Merchant Caravans only)",
			description:
				"The many vulnerable items such as Cathayan jewels, spices and silk cloths are stored in the Trade Cart.",
			profile: {
				Cart: { T: 8, W: 4 },
				Wheel: { T: 6, W: 1 },
				"Draft Horse": {
					M: 8,
					WS: 1,
					BS: 0,
					S: 3,
					T: 3,
					W: 1,
					I: 3,
					A: 0,
					Ld: 5,
				},
			},
			specialRules:
				"The Trade Wagon is a wagon and so follows all rules for Wagons. All the warband's stored equipment and treasures are stored inside the Trade Wagon. For every five different rare items stored inside the Trade Wagon, the Merchant gets +1 to his rolls for finding rare items.",
		},
		{
			name: "Wagon",
			cost: "100 gc",
			availability: "Rare 7 (without draft animals)",
			specialRules:
				"For all the rules on how to use Wagons, see the Vehicles of the Empire section.",
		},
		{
			name: "Stagecoach",
			cost: "100 gc",
			availability: "Rare 7 (without draft animals)",
			specialRules:
				"For all the rules on how to use Stagecoaches, see the Vehicles of the Empire section.",
		},
	] as Vehicle[],
};

export default miscellaneousEquipment;
