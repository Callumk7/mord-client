import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
	campaignsQueryOptions,
	campaignWarbandQueryOptions,
} from "~/query/options";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuPopup,
	NavigationMenuPositioner,
	NavigationMenuTrigger,
} from "./ui/navigation-menu";

interface HeaderProps {
	campaignId: string;
}
export function Header({ campaignId }: HeaderProps) {
	const { data: warbands } = useQuery(
		campaignWarbandQueryOptions(Number(campaignId)),
	);
	return (
		<NavigationMenu>
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuLink
						render={<Link to="/$campaign" params={{ campaign: campaignId }} />}
					>
						Leaderboard
					</NavigationMenuLink>
				</NavigationMenuItem>
				{warbands && (
					<NavigationMenuItem>
						<NavigationMenuTrigger>Warbands</NavigationMenuTrigger>
						<NavigationMenuContent>
							{warbands.map((warband) => (
								<NavigationMenuLink
									key={warband.id}
									render={
										<Link
											to="/$campaign/warbands/$warband"
											params={{
												campaign: campaignId,
												warband: warband.id.toString(),
											}}
										/>
									}
								>
									{warband.name}
								</NavigationMenuLink>
							))}
						</NavigationMenuContent>
					</NavigationMenuItem>
				)}
				<NavigationMenuItem>
					<NavigationMenuLink
						render={
							<Link to="/$campaign/matches" params={{ campaign: campaignId }} />
						}
					>
						Matches
					</NavigationMenuLink>
				</NavigationMenuItem>
			</NavigationMenuList>
			<NavigationMenuPositioner>
				<NavigationMenuPopup />
			</NavigationMenuPositioner>
		</NavigationMenu>
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
