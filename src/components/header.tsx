import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { Warband } from "~/db/schema";
import {
	campaignMatchesQueryOptions,
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
	campaignId: number;
}
export function Header({ campaignId }: HeaderProps) {
	const { data: warbands } = useQuery(
		campaignWarbandQueryOptions(Number(campaignId)),
	);

	const { data: matches } = useQuery(
		campaignMatchesQueryOptions(Number(campaignId)),
	);

	return (
		<NavigationMenu className="p-4 w-full max-w-full">
			<NavigationMenuList className="justify-between w-full">
				<div className="flex items-center gap-1">
					<NavigationMenuItem>
						<NavigationMenuLink
							render={<Link to="/$campaignId" params={{ campaignId }} />}
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
									<Link to="/$campaignId/warbands" params={{ campaignId }} />
								}
							>
								All Warbands
							</NavigationMenuLink>
							{warbands?.map((warband: Warband) => (
								<NavigationMenuLink
									key={warband.id}
									render={
										<Link
											to="/$campaignId/warbands/$warbandId"
											params={{
												campaignId,
												warbandId: warband.id,
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
						<NavigationMenuTrigger>Matches</NavigationMenuTrigger>
						<NavigationMenuContent>
							<NavigationMenuLink
								render={
									<Link to="/$campaignId/matches" params={{ campaignId }} />
								}
							>
								All Matches
							</NavigationMenuLink>
							{matches?.map((match) => (
								<NavigationMenuLink
									key={match.id}
									render={
										<Link
											to="/$campaignId/matches/$matchId"
											params={{
												campaignId,
												matchId: match.id,
											}}
										/>
									}
								>
									{match.name}
								</NavigationMenuLink>
							))}
						</NavigationMenuContent>
					</NavigationMenuItem>
				</div>
				<div className="flex items-center gap-1">
					<NavigationMenuItem>
						<NavigationMenuLink
							render={<Link to="/$campaignId/admin" params={{ campaignId }} />}
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
							<NavigationMenuLink render={<Link to="/reference/scenarios" />}>
								Scenarios
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
											to="/$campaignId"
											params={{ campaignId: campaign.id }}
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
						<NavigationMenuLink render={<Link to="/reference/scenarios" />}>
							Scenarios
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
