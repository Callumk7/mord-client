import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Coins, Edit, Shield, Trash2, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import { deleteWarbandMutation, warbandKeys } from "~/api/warbands";
import type { WarbandWithWarriors } from "~/db/schema";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { UpdateWarbandForm } from "./update-warband-form";

interface WarbandCardProps {
	warband: WarbandWithWarriors;
}

export function WarbandCard({ warband }: WarbandCardProps) {
	const queryClient = useQueryClient();
	const deleteMutation = useMutation(deleteWarbandMutation);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);

	const handleDelete = () => {
		deleteMutation.mutate(warband.id, {
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: warbandKeys.list(warband.campaignId),
				});
				setShowDeleteDialog(false);
			},
		});
	};

	return (
		<>
			<Card className="transition-all hover:shadow-md">
				<CardHeader className="pb-3">
					<div className="flex items-start justify-between gap-4">
						<div className="flex items-center gap-3 min-w-0 flex-1">
							{warband.icon && (
								<div
									className="text-2xl shrink-0"
									style={{ color: warband.color || undefined }}
								>
									{warband.icon}
								</div>
							)}
							<CardTitle className="text-lg min-w-0">
								<Link
									to="/$campaignId/warbands/$warbandId"
									params={{
										campaignId: warband.campaignId,
										warbandId: warband.id,
									}}
									className="hover:underline block truncate"
								>
									{warband.name}
								</Link>
							</CardTitle>
						</div>
						<div className="flex items-center gap-1 shrink-0">
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 text-muted-foreground hover:text-foreground"
								onClick={() => setShowEditDialog(true)}
								aria-label="Edit warband"
							>
								<Edit className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 text-muted-foreground hover:text-destructive"
								onClick={() => setShowDeleteDialog(true)}
								aria-label="Delete warband"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Stats Grid */}
					<div className="grid grid-cols-2 gap-3">
						<div className="flex items-center gap-2">
							<Shield className="w-4 h-4 text-muted-foreground shrink-0" />
							<div className="flex-1 min-w-0">
								<p className="text-xs text-muted-foreground">Faction</p>
								<p className="font-semibold text-sm truncate">
									{warband.faction}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<TrendingUp className="w-4 h-4 text-muted-foreground shrink-0" />
							<div className="flex-1 min-w-0">
								<p className="text-xs text-muted-foreground">Rating</p>
								<p className="font-semibold text-sm">{warband.rating}</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Coins className="w-4 h-4 text-muted-foreground shrink-0" />
							<div className="flex-1 min-w-0">
								<p className="text-xs text-muted-foreground">Treasury</p>
								<p className="font-semibold text-sm">{warband.treasury} gc</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Users className="w-4 h-4 text-muted-foreground shrink-0" />
							<div className="flex-1 min-w-0">
								<p className="text-xs text-muted-foreground">Warband</p>
								<p className="font-semibold text-sm">View Details</p>
							</div>
						</div>
					</div>

					{/* Notes */}
					{warband.notes && (
						<div className="pt-2 border-t">
							<p className="text-xs text-muted-foreground mb-1">Notes</p>
							<p className="text-sm line-clamp-2">{warband.notes}</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Edit Warband Dialog */}
			<Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Edit Warband</DialogTitle>
						<DialogDescription>
							Update the details of your warband.
						</DialogDescription>
					</DialogHeader>
					<UpdateWarbandForm
						warband={warband}
						onSuccess={() => setShowEditDialog(false)}
					/>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Warband</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete "{warband.name}"? This action
							cannot be undone and will remove all associated warriors and match
							data.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowDeleteDialog(false)}
							disabled={deleteMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleDelete}
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
