import { Link } from "@tanstack/react-router";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Search, Shield, Skull, User, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "~/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import type { Warband, Warrior } from "~/db/schema";

type WarriorWithWarband = Warrior & {
	warband?: Warband | null;
};

interface WarriorTableProps {
	warriors: WarriorWithWarband[];
}

export function WarriorTable({ warriors }: WarriorTableProps) {
	const [sorting, setSorting] = useState<Array<{ id: string; desc: boolean }>>(
		[],
	);
	const [globalFilter, setGlobalFilter] = useState("");

	const columns: ColumnDef<WarriorWithWarband>[] = useMemo(
		() => [
			{
				accessorKey: "name",
				header: ({ column }) => {
					return (
						<button
							type="button"
							className="flex items-center gap-2 hover:text-foreground"
							onClick={() =>
								column.toggleSorting(column.getIsSorted() === "asc")
							}
						>
							Name
							<ArrowUpDown className="ml-2 h-4 w-4" />
						</button>
					);
				},
				cell: ({ row }) => {
					const warrior = row.original;
					return (
						<Link
							to="/$campaignId/warriors/$warriorId"
							params={{
								campaignId: warrior.campaignId,
								warriorId: warrior.id,
							}}
							className="flex items-center gap-2 min-w-0"
						>
							{warrior.isLeader && (
								<User className="w-4 h-4 text-muted-foreground shrink-0" />
							)}
							<span className="font-medium truncate">{warrior.name}</span>
						</Link>
					);
				},
			},
			{
				id: "warband",
				accessorFn: (row) => row.warband?.faction ?? "",
				header: ({ column }) => {
					return (
						<button
							type="button"
							className="flex items-center gap-2 hover:text-foreground"
							onClick={() =>
								column.toggleSorting(column.getIsSorted() === "asc")
							}
						>
							<Shield className="w-4 h-4 text-muted-foreground shrink-0" />
							Faction
							<ArrowUpDown className="ml-2 h-4 w-4" />
						</button>
					);
				},
				cell: ({ row }) => {
					const faction = row.original.warband?.faction ?? "Unknown";
					return <span>{faction}</span>;
				},
				filterFn: (row, _id, filterValue) => {
					const faction = row.original.warband?.faction ?? "";
					return faction.toLowerCase().includes(filterValue.toLowerCase());
				},
			},
			{
				accessorKey: "type",
				header: ({ column }) => {
					return (
						<button
							type="button"
							className="flex items-center gap-2 hover:text-foreground"
							onClick={() =>
								column.toggleSorting(column.getIsSorted() === "asc")
							}
						>
							Type
							<ArrowUpDown className="ml-2 h-4 w-4" />
						</button>
					);
				},
				cell: ({ row }) => {
					return <span className="capitalize">{row.original.type}</span>;
				},
			},
			{
				accessorKey: "gamesPlayed",
				header: ({ column }) => {
					return (
						<button
							type="button"
							className="flex items-center gap-2 hover:text-foreground"
							onClick={() =>
								column.toggleSorting(column.getIsSorted() === "asc")
							}
						>
							<Users className="w-4 h-4 text-muted-foreground shrink-0" />
							Games
							<ArrowUpDown className="ml-2 h-4 w-4" />
						</button>
					);
				},
				cell: ({ row }) => {
					return <span>{row.original.gamesPlayed}</span>;
				},
			},
			{
				accessorKey: "isAlive",
				header: ({ column }) => {
					return (
						<button
							type="button"
							className="flex items-center gap-2 hover:text-foreground"
							onClick={() =>
								column.toggleSorting(column.getIsSorted() === "asc")
							}
						>
							Status
							<ArrowUpDown className="ml-2 h-4 w-4" />
						</button>
					);
				},
				cell: ({ row }) => {
					const isAlive = row.original.isAlive;
					return (
						<div className="flex items-center gap-2">
							{isAlive ? (
								<span className="text-muted-foreground">Alive</span>
							) : (
								<div className="flex items-center gap-1 text-destructive">
									<Skull className="w-4 h-4" />
									<span>Dead</span>
								</div>
							)}
						</div>
					);
				},
			},
		],
		[],
	);

	const table = useReactTable({
		data: warriors,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onSortingChange: setSorting,
		onGlobalFilterChange: setGlobalFilter,
		globalFilterFn: (row, _columnId, filterValue) => {
			const warrior = row.original;
			const name = warrior.name.toLowerCase();
			const faction = warrior.warband?.faction?.toLowerCase() ?? "";
			const searchTerm = filterValue.toLowerCase();

			return name.includes(searchTerm) || faction.includes(searchTerm);
		},
		state: {
			sorting,
			globalFilter,
		},
	});

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search by name or faction..."
						value={globalFilter}
						onChange={(e) => setGlobalFilter(e.target.value)}
						className="pl-8"
					/>
				</div>
			</div>

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
									No warriors found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
