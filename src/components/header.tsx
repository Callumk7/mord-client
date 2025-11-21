import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { campaignsQueryOptions } from "~/query/options";

interface HeaderProps {
	campaignId: string;
}
export function Header({ campaignId }: HeaderProps) {
	return (
		<header className="p-4 flex justify-between items-center bg-card border-b shadow-lg">
			<div className="flex items-center gap-4">
				<Link to="/$campaign" params={{ campaign: campaignId }}>
					Leaderboard
				</Link>
				<Link to="/$campaign/warbands" params={{ campaign: campaignId }}>
					Warbands
				</Link>
				<Link to="/$campaign/matches" params={{ campaign: campaignId }}>
					Matches
				</Link>
			</div>
			<div className="flex items-center gap-4">
				<Link to="/$campaign/admin" params={{ campaign: campaignId }}>
					Admin
				</Link>
				<Link to="/reference">Reference</Link>
			</div>
		</header>
	);
}

export function ReferenceHeader() {
	const { data: campaigns } = useQuery(campaignsQueryOptions);
	return (
		<header className="p-4 flex justify-between items-center bg-card border-b shadow-lg">
			{campaigns && (
				<div className="flex items-center gap-4">
					{campaigns.map((campaign) => (
						<Link
							key={campaign.id}
							to="/$campaign"
							params={{ campaign: campaign.id.toString() }}
						>
							{campaign.name}
						</Link>
					))}
				</div>
			)}
			<Link to="/reference">Reference</Link>
		</header>
	);
}
