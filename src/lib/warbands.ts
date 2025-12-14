import type { Warrior } from "~/db/schema";

export function getActiveWarriors(warriors: Warrior[]) {
	return warriors.filter((warrior) => warrior.isAlive);
}
