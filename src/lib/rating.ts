import type { Warrior } from "~/db/schema";

export function calculateWarbandRating(warriors: Warrior[]) {
	const count = warriors.length;

	const totalExperience = warriors.reduce(
		(total, warrior) => total + warrior.experience,
		0,
	);

	return count * 5 + totalExperience;
}
