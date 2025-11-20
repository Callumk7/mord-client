import { Link } from "@tanstack/react-router";

interface HeaderProps {
	campaignId: string;
}
export function Header({ campaignId }: HeaderProps) {
	return (
		<header className="p-4 flex gap-12 items-center bg-gray-800 text-white shadow-lg">
			<h1 className="ml-4 text-xl font-semibold">
				<Link to="/">Mord Stats</Link>
			</h1>
			<div className="flex items-center gap-4">
				<Link to="/$campaign" params={{ campaign: campaignId }}>
					Campaign
				</Link>
				<Link to="/$campaign/warbands" params={{ campaign: campaignId }}>
					Warbands
				</Link>
				<Link to="/$campaign/matches" params={{ campaign: campaignId }}>
					Matches
				</Link>
				<Link to="/reference">Reference</Link>
			</div>
		</header>
	);
}
