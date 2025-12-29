import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Fish, PlusCircle, Shield, TrendingUp } from "lucide-react";
import { getCampaignsOptions } from "~/api/campaign";
import { getCampaignMatchesOptions } from "~/api/matches";
import { campaignWarbandsQueryOptions } from "~/api/warbands";
import type { Warband } from "~/db/schema";
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
import { Separator } from "./ui/separator";

interface HeaderProps {
	campaignId: number;
}
export function Header({ campaignId }: HeaderProps) {
	const { data: warbands } = useQuery(campaignWarbandsQueryOptions(campaignId));
	const { data: matches } = useQuery(getCampaignMatchesOptions(campaignId));

	return (
		<NavigationMenu className="p-4 w-full max-w-full">
			<NavigationMenuList className="justify-between w-full">
				<div className="flex items-center gap-1">
					<NavigationMenuItem>
						<NavigationMenuLink
							render={
								<Link to="/display/$campaignId" params={{ campaignId }} />
							}
						>
							Display
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuLink
							render={<Link to="/$campaignId" params={{ campaignId }} />}
						>
							Leaderboard
						</NavigationMenuLink>
					</NavigationMenuItem>

					{/* Warbands */}
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

					{/* Warriors */}
					<NavigationMenuItem>
						<NavigationMenuLink
							className="flex items-center flex-row gap-2"
							render={
								<Link to="/$campaignId/warriors" params={{ campaignId }} />
							}
						>
							<Shield className="w-4 h-4" />
							Warriors
						</NavigationMenuLink>
					</NavigationMenuItem>

					{/* Matches */}
					<NavigationMenuItem>
						<NavigationMenuTrigger>Matches</NavigationMenuTrigger>
						<NavigationMenuContent>
							<NavigationMenuLink
								className="flex items-center flex-row gap-2"
								render={
									<Link to="/$campaignId/matches/new" params={{ campaignId }} />
								}
							>
								<PlusCircle />
								<span>New Match</span>
							</NavigationMenuLink>
							<NavigationMenuLink
								className="flex items-center flex-row gap-2"
								render={
									<Link to="/$campaignId/matches" params={{ campaignId }} />
								}
							>
								<Fish />
								<span>All Matches</span>
							</NavigationMenuLink>
							<Separator />
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
					<NavigationMenuItem>
						<NavigationMenuLink
							render={<Link to="/$campaignId/events" params={{ campaignId }} />}
						>
							Events
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuLink
							render={<Link to="/$campaignId/news" params={{ campaignId }} />}
						>
							News
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuLink
							render={
								<Link to="/$campaignId/timeline" params={{ campaignId }} />
							}
						>
							Timeline
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuLink
							className="flex items-center flex-row gap-2"
							render={
								<Link to="/$campaignId/progress" params={{ campaignId }} />
							}
						>
							<TrendingUp className="w-4 h-4" />
							Progress
						</NavigationMenuLink>
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
							<NavigationMenuLink
								render={<Link to="/reference/close-combat-weapons" />}
							>
								Close Combat Weapons
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
	const { data: campaigns } = useQuery(getCampaignsOptions);
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
						<NavigationMenuLink
							render={<Link to="/reference/close-combat-weapons" />}
						>
							Close Combat Weapons
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
