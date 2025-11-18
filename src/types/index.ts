export interface Campaign {
	id: number;
	name: string;
	description?: string;
	startDate: Date;
	endDate: Date;
	createdAt: Date;
	updatedAt: Date;
	warbands: Warband[];
}

export interface Warband {
	id: number;
	name: string;
	faction: string;
	rating: number;
	treasury: number;
	warriors: Warrior[];
	createdAt: Date;
	updatedAt: Date;
	color?: string;
	icon?: string;
	notes?: string;
}

export interface Warrior {
	id: number;
	name: string;
	warbandId: number;
	type: "hero" | "henchman";
	experience: number;
	kills: number;
	injuriesCaused: number;
	injuriesReceived: number;
	gamesPlayed: number;
	isAlive: boolean;
	deathDate?: Date;
	createdAt: Date;
	updatedAt: Date;
	deathDescription?: string;
	equipment?: string[];
	skills?: string[];
}

export interface Match {
	id: number;
	matchNumber: number;
	date: Date;
	matchType: MatchType;
	resultType: MatchResultType;
	scenarioId: number;
	winnerId?: number;
	loserId?: number;
	winningTeamId?: number;
	participants: MatchParticipant[];
	teams?: Team[];
	placements?: Placement[];
	casualties: Casualty[];
	createdAt: Date;
	updatedAt: Date;
}

export type MatchType = "1v1" | "2v2" | "battle_royale";
export type MatchResultType = "standard" | "team" | "placement";

export interface MatchParticipant {
	id: number;
	matchId: number;
	warbandId: number;
}

export interface Team {
	id: number;
	matchId: number;
	name?: string;
	isWinner: boolean;
	members: TeamMember[];
}

export interface TeamMember {
	id: number;
	teamId: number;
	warbandId: number;
}

export interface Placement {
	id: number;
	matchId: number;
	warbandId: number;
	position: number;
}

export interface Casualty {
	id: number;
	matchId: number;
	victimWarriorId: number;
	victimWarbandId: number;
	killerWarriorId: number;
	killerWarbandId: number;
	type: "killed" | "injured" | "stunned" | "escaped";
	description?: string;
	timestamp: Date;
}
