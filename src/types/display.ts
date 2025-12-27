import type {
	getMostInjuriesFromEvents,
	getMostInjuriesInflictedFromEvents,
	getMostKillsFromEvents,
} from "~/api/campaign";

export type WarriorKillsRow = Awaited<
	ReturnType<typeof getMostKillsFromEvents>
>[number];

export type WarriorInjuriesTakenRow = Awaited<
	ReturnType<typeof getMostInjuriesFromEvents>
>[number];

export type WarriorInjuriesInflictedRow = Awaited<
	ReturnType<typeof getMostInjuriesInflictedFromEvents>
>[number];

export interface BroadcastStat {
	type: "stat";
	id: string;
	title: string;
	value: string;
	statLine: string;
	description: string;
	gradient: string;
	footnote?: string;
}

export interface BroadcastChart {
	type: "chart";
	id: string;
	gradient: string;
	content: React.ReactNode;
}

export interface MatchHighlight {
	id: number;
	name: string;
	date: Date | string;
	status: string;
	matchType: "1v1" | "multiplayer";
	winners: {
		id: number;
		name: string;
		icon: string | null;
		color: string | null;
	}[];
	participants: {
		id: number;
		name: string;
		icon: string | null;
		color: string | null;
	}[];
	kills: number;
	injuries: number;
	totalMoments: number;
}

export interface MatchCenterMatch {
	id: number;
	name: string;
	date: Date | string;
	status: "active" | "ended" | "scheduled" | "resolved";
	matchType: "1v1" | "multiplayer";
	participants: {
		id: number;
		warbandId: number;
		name: string;
		icon: string | null;
		color: string | null;
		rating: number;
	}[];
	events: {
		id: number;
		death: boolean;
		injury: boolean;
		description: string | null;
		timestamp: Date | string | null;
		warrior?: { warbandId: number; name: string } | null;
		defender?: { warbandId: number; name: string } | null;
	}[];
}

export interface WarbandSpotlightData {
	name: string;
	faction: string;
	icon: string | null;
	color: string | null;
	wins: number;
	treasury: number;
	warriorsAlive: number;
	eventsInflicted: number;
	eventsSuffered: number;
}
