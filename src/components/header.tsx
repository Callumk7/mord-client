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
		<NavigationMenu className="p-4 w-full max-w-full">
			<NavigationMenuList className="justify-between w-full">
				<div className="flex items-center gap-1">
					<NavigationMenuItem>
						<NavigationMenuLink
							render={
								<Link to="/$campaign" params={{ campaign: campaignId }} />
							}
						>
							Leaderboard
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuTrigger>Warbands</NavigationMenuTrigger>
						<NavigationMenuContent>
							<NavigationMenuLink
								className="font-bold"
								render={
									<Link
										to="/$campaign/warbands"
										params={{ campaign: campaignId }}
									/>
								}
							>
								All Warbands
							</NavigationMenuLink>
							{warbands?.map((warband) => (
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
					<NavigationMenuItem>
						<NavigationMenuLink
							render={
								<Link
									to="/$campaign/matches"
									params={{ campaign: campaignId }}
								/>
							}
						>
							Matches
						</NavigationMenuLink>
					</NavigationMenuItem>
				</div>
				<div className="flex items-center gap-1">
					<NavigationMenuItem>
						<NavigationMenuLink
							render={
								<Link to="/$campaign/admin" params={{ campaign: campaignId }} />
							}
						>
							Admin
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuTrigger>Reference</NavigationMenuTrigger>
						<NavigationMenuContent>
							<NavigationMenuLink
								className="font-bold"
								render={<Link to="/reference" />}
							>
								Reference Home
							</NavigationMenuLink>
							<NavigationMenuLink render={<Link to="/reference/injuries" />}>
								Injuries
							</NavigationMenuLink>
						</NavigationMenuContent>
					</NavigationMenuItem>
				</div>
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
		<NavigationMenu className="p-4 w-full max-w-full">
			<NavigationMenuList className="justify-between w-full">
				{campaigns && (
					<NavigationMenuItem>
						<NavigationMenuTrigger>Campaigns</NavigationMenuTrigger>
						<NavigationMenuContent>
							{campaigns.map((campaign) => (
								<NavigationMenuLink
									key={campaign.id}
									render={
										<Link
											to="/$campaign"
											params={{ campaign: campaign.id.toString() }}
										/>
									}
								>
									{campaign.name}
								</NavigationMenuLink>
							))}
						</NavigationMenuContent>
					</NavigationMenuItem>
				)}
				<NavigationMenuItem>
					<NavigationMenuTrigger>Reference</NavigationMenuTrigger>
					<NavigationMenuContent>
						<NavigationMenuLink
							className="font-bold"
							render={<Link to="/reference" />}
						>
							Reference Home
						</NavigationMenuLink>
						<NavigationMenuLink render={<Link to="/reference/injuries" />}>
							Injuries
						</NavigationMenuLink>
					</NavigationMenuContent>
				</NavigationMenuItem>
			</NavigationMenuList>
			<NavigationMenuPositioner>
				<NavigationMenuPopup />
			</NavigationMenuPositioner>
		</NavigationMenu>
	);
}
