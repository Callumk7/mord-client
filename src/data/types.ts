// Common types for Mordheim equipment and items

// Availability types
export type Availability = "Common" | `Rare ${number}` | string;

// Source grade/tier classification
export type Grade = "core" | "1a" | "1b" | "1c";

// Armor save types
export type ArmorSave =
	| "4+"
	| "5+"
	| "6+"
	| "+1 to existing save"
	| "+2 on foot, +1 mounted with armour"
	| "5+ on foot, 6+ mounted";

// Warband restrictions
export type WarbandRestriction =
	| "No warband restriction"
	| "Cult of the Possessed"
	| "Marienburgers"
	| "Middenheimers"
	| "Reiklanders"
	| "Sisters of Sigmar"
	| "Skaven"
	| "Undead"
	| "Witch Hunters"
	| "Averlanders"
	| "Beastmen Raiders"
	| "Carnival of Chaos"
	| "Dwarf Treasure Hunters"
	| "Kislevites"
	| "Orc Mob"
	| "Ostlanders"
	| "Amazons (Lustria)"
	| "Amazons (Mordheim)"
	| "Arabian Tomb Raiders"
	| "Black Orcs"
	| "Bretonnian Knights"
	| "Dark Elves"
	| "Dwarf Rangers"
	| "Forest Goblins"
	| "Gunnery School of Nuln"
	| "Hochland Bandits"
	| "Horned Hunters"
	| "Imperial Outriders"
	| "Lizardmen"
	| "Miragleans"
	| "Mootlanders"
	| "Norse Explorers"
	| "Ostermarkers"
	| "Outlaws of Stirwood Forest, The"
	| "Pirates"
	| "Pit Fighters"
	| "Remasens"
	| "Shadow Warriors"
	| "Skaven of Clan Pestilens"
	| "Tomb Guardians"
	| "Trantios"
	| "Battle Monks of Cathay"
	| "Maneaters"
	| "Chaos Dwarfs"
	| "Marauders of Chaos"
	| "Norse"
	| "Beastmen"
	| "Possessed"
	| "Bretonnian Chapel Guard"
	| "Merchant Caravans"
	| "Hobgoblins"
	| "Goblins"
	| "Night Goblins"
	| "Lustrian Reavers";

// Special rules interface
export interface SpecialRule {
	name: string;
	description: string;
}

// Base weapon interface
export interface BaseWeapon {
	name: string;
	source: string;
	availability: Availability;
	restrictions?: string;
	description: string;
	range: string;
	strength: number | string;
	specialRules?: SpecialRule[];
}

// Close combat weapon (uses number cost)
export interface CloseCombatWeapon extends BaseWeapon {
	cost: number;
}

// Missile weapon (uses string cost and warband restrictions array)
export interface MissileWeapon extends Omit<BaseWeapon, "restrictions"> {
	cost: string;
	warbandRestrictions?: WarbandRestriction[];
	specialRules?: SpecialRule[];
}

// Blackpowder weapon (includes grade)
export interface BlackpowderWeapon extends BaseWeapon {
	grade: Grade;
	cost: string;
}

// Armor interface
export interface Armor {
	name: string;
	source: string;
	cost: number;
	availability: Availability;
	save: ArmorSave;
	description?: string;
	specialRules?: SpecialRule[];
	restrictions?: string[];
}

// Miscellaneous item interface
export interface MiscellaneousItem {
	name: string;
	cost: string;
	availability: string;
	restrictions?: string;
	description: string;
	specialRules: string;
}

// Poison or drug (extends miscellaneous item)
export interface PoisonOrDrug extends MiscellaneousItem {
	effect?: string;
	sideEffects?: string;
}

// Vehicle profile stats
export interface VehicleProfile {
	M?: number | string;
	WS?: number | string;
	BS?: number | string;
	S?: number | string;
	T?: number | string;
	W?: number | string;
	I?: number | string;
	A?: number | string;
	Ld?: number | string;
}

// Vehicle (extends miscellaneous item)
export interface Vehicle extends MiscellaneousItem {
	profile?: {
		[key: string]: VehicleProfile;
	};
}
