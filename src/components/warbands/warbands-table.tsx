import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Coins, Edit, Shield, Trash2, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import {
	campaignWarbandsQueryOptions,
	deleteWarbandMutation,
} from "~/api/warbands";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import type { WarbandWithWarriors } from "~/db/schema";
import { calculateRating } from "~/lib/ratings";
import { getActiveWarriors } from "~/lib/warbands";
import { UpdateWarbandForm } from "./update-warband-form";

interface WarbandsTableProps {
	warbands: WarbandWithWarriors[];
}

export function WarbandsTable({ warbands }: WarbandsTableProps) {
	const queryClient = useQueryClient();
	const [editingWarband, setEditingWarband] =
		useState<WarbandWithWarriors | null>(null);
	const [deletingWarband, setDeletingWarband] =
		useState<WarbandWithWarriors | null>(null);
	const deleteMutation = useMutation(deleteWarbandMutation);

	const handleDelete = () => {
		if (!deletingWarband) return;
		deleteMutation.mutate(deletingWarband.id, {
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: campaignWarbandsQueryOptions(deletingWarband.campaignId)
						.queryKey,
				});
				setDeletingWarband(null);
			},
		});
	};

	const columns: ColumnDef<WarbandWithWarriors>[] = [
		{
			accessorKey: "name",
			header: "Name",
			cell: ({ row }) => {
				const warband = row.original;
				return (
					<div className="flex items-center gap-2 min-w-0">
						{warband.icon && (
							<div
								className="text-lg shrink-0"
								style={{ color: warband.color || undefined }}
							>
								{warband.icon}
							</div>
						)}
						<Link
							to="/$campaignId/warbands/$warbandId"
							params={{
								campaignId: warband.campaignId,
								warbandId: warband.id,
							}}
							className="font-medium hover:underline truncate"
						>
							{warband.name}
						</Link>
					</div>
				);
			},
		},
		{
			accessorKey: "faction",
			header: "Faction",
			cell: ({ row }) => {
				return (
					<div className="flex items-center gap-2">
						<Shield className="w-4 h-4 text-muted-foreground shrink-0" />
						<span>{row.original.faction}</span>
					</div>
				);
			},
		},
		{
			id: "rating",
			header: "Rating",
			cell: ({ row }) => {
				return (
					<div className="flex items-center gap-2">
						<TrendingUp className="w-4 h-4 text-muted-foreground shrink-0" />
						<span>
							{calculateRating(
								getActiveWarriors(row.original.warriors).length,
								row.original.experience,
							)}
						</span>
					</div>
				);
			},
		},
		{
			accessorKey: "treasury",
			header: "Treasury",
			cell: ({ row }) => {
				return (
					<div className="flex items-center gap-2">
						<Coins className="w-4 h-4 text-muted-foreground shrink-0" />
						<span>{row.original.treasury} gc</span>
					</div>
				);
			},
		},
		{
			id: "warriors",
			header: "Warriors",
			cell: ({ row }) => {
				const count = row.original.warriors.length;
				return (
					<div className="flex items-center gap-2">
						<Users className="w-4 h-4 text-muted-foreground shrink-0" />
						<span>{count}</span>
					</div>
				);
			},
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => {
				const warband = row.original;
				return (
					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 text-muted-foreground hover:text-foreground"
							onClick={() => setEditingWarband(warband)}
							aria-label="Edit warband"
						>
							<Edit className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 text-muted-foreground hover:text-destructive"
							onClick={() => setDeletingWarband(warband)}
							aria-label="Delete warband"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				);
			},
		},
	];

	const table = useReactTable({
		data: warbands,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No warbands found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Edit Warband Dialog */}
			{editingWarband && (
				<Dialog
					open={!!editingWarband}
					onOpenChange={(open) => !open && setEditingWarband(null)}
				>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>Edit Warband</DialogTitle>
							<DialogDescription>
								Update the details of your warband.
							</DialogDescription>
						</DialogHeader>
						<UpdateWarbandForm
							warband={editingWarband}
							onSuccess={() => setEditingWarband(null)}
						/>
					</DialogContent>
				</Dialog>
			)}

			{/* Delete Confirmation Dialog */}
			{deletingWarband && (
				<Dialog
					open={!!deletingWarband}
					onOpenChange={(open) => !open && setDeletingWarband(null)}
				>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Delete Warband</DialogTitle>
							<DialogDescription>
								Are you sure you want to delete "{deletingWarband.name}"? This
								action cannot be undone and will remove all associated warriors
								and match data.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setDeletingWarband(null)}
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
			)}
		</>
	);
}
