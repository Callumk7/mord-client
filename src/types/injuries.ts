import z from "zod";
import { seriousInjuries } from "~/data/serious-injuries";

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
 * Convert an injury name from serious-injuries.ts to the enum value
 * @param name - The injury name (e.g., "Dead", "Leg Wound")
 * @returns The snake_case enum value or undefined if not found
 */
export function injuryNameToEnum(name: string): InjuryType | undefined {
	const enumValue = name
		.toLowerCase()
		.replace(/\s+/g, "_")
		.replace(/'/g, "");

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
	// Find the injury in serious-injuries.ts by matching the enum value
	const injury = seriousInjuries.find(
		(inj) => injuryNameToEnum(inj.name) === enumValue,
	);

	if (injury) {
		return injury.name;
	}

	// Fallback: convert snake_case to Title Case
	return enumValue
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

/**
 * Get injury options for select components
 * Maps serious injuries data to select options with enum values
 */
export function getInjuryOptions() {
	return seriousInjuries
		.map((injury) => {
			const enumValue = injuryNameToEnum(injury.name);
			if (!enumValue) {
				return null;
			}
			return {
				value: enumValue,
				label: injury.name,
				description: injury.description,
			};
		})
		.filter((option): option is NonNullable<typeof option> => option !== null);
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

