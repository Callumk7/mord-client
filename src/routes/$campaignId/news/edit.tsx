import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
	deleteCustomNewsFn,
	getCampaignCustomNewsOptions,
	updateCustomNewsFn,
} from "~/api/news";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Link } from "~/components/ui/link";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { Textarea } from "~/components/ui/textarea";

export const Route = createFileRoute("/$campaignId/news/edit")({
	component: RouteComponent,
	loader: async ({ params, context }) => {
		await context.queryClient.ensureQueryData(
			getCampaignCustomNewsOptions(params.campaignId),
		);
	},
});

function RouteComponent() {
	const { campaignId } = Route.useParams();
	const queryClient = useQueryClient();

	const { data, isLoading } = useQuery(getCampaignCustomNewsOptions(campaignId));

	const [filter, setFilter] = useState("");
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [activeId, setActiveId] = useState<number | null>(null);
	const [draftContent, setDraftContent] = useState("");

	const filtered = useMemo(() => {
		const q = filter.trim().toLowerCase();
		if (!q) return data ?? [];
		return (data ?? []).filter((row) => row.content.toLowerCase().includes(q));
	}, [data, filter]);

	const editRow = useMemo(() => {
		if (activeId == null) return null;
		return (data ?? []).find((row) => row.id === activeId) ?? null;
	}, [activeId, data]);

	const updateMutation = useMutation({
		mutationFn: updateCustomNewsFn,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getCampaignCustomNewsOptions(campaignId).queryKey,
			});
			toast.success("News item updated");
			setEditOpen(false);
			setTimeout(() => setActiveId(null), 200);
		},
		onError: () => toast.error("Failed to update news item"),
	});

	const deleteMutation = useMutation({
		mutationFn: deleteCustomNewsFn,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getCampaignCustomNewsOptions(campaignId).queryKey,
			});
			toast.success("News item deleted");
			setDeleteOpen(false);
			setTimeout(() => setActiveId(null), 200);
		},
		onError: () => toast.error("Failed to delete news item"),
	});

	const openEdit = (id: number) => {
		const row = (data ?? []).find((r) => r.id === id);
		if (!row) return;
		setActiveId(id);
		setDraftContent(row.content);
		setEditOpen(true);
	};

	const openDelete = (id: number) => {
		setActiveId(id);
		setDeleteOpen(true);
	};

	const formatDateTime = (date: Date) => new Date(date).toLocaleString();

	if (isLoading) {
		return <div className="p-6">Loading news items...</div>;
	}

	return (
		<div className="container mx-auto p-6">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold">Manage news reel</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Edit or delete custom ticker entries for this campaign.
					</p>
				</div>
				<Link
					variant="outline"
					to="/$campaignId/news"
					params={{ campaignId }}
					className="no-underline"
				>
					Add new
				</Link>
			</div>

			<Card className="mt-6">
				<CardHeader className="gap-2">
					<div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
						<div>
							<CardTitle>Custom entries</CardTitle>
							<CardDescription>
								These will appear on the display ticker.
							</CardDescription>
						</div>
						<div className="w-full md:w-80">
							<Input
								value={filter}
								onChange={(e) => setFilter(e.target.value)}
								placeholder="Filter by text…"
							/>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Content</TableHead>
								<TableHead className="whitespace-nowrap">Created</TableHead>
								<TableHead className="whitespace-nowrap">Updated</TableHead>
								<TableHead className="w-[90px]" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{filtered.length === 0 ? (
								<TableRow>
									<TableCell colSpan={4} className="text-muted-foreground">
										No custom news entries yet.
									</TableCell>
								</TableRow>
							) : (
								filtered.map((row) => (
									<TableRow key={row.id}>
										<TableCell className="max-w-[70ch]">
											<div className="truncate">{row.content}</div>
										</TableCell>
										<TableCell className="text-muted-foreground whitespace-nowrap">
											{formatDateTime(row.createdAt)}
										</TableCell>
										<TableCell className="text-muted-foreground whitespace-nowrap">
											{formatDateTime(row.updatedAt)}
										</TableCell>
										<TableCell className="text-right whitespace-nowrap">
											<Button
												size="icon-sm"
												variant="ghost"
												onClick={() => openEdit(row.id)}
												aria-label="Edit"
											>
												<PencilIcon />
											</Button>
											<Button
												size="icon-sm"
												variant="ghost"
												onClick={() => openDelete(row.id)}
												aria-label="Delete"
											>
												<Trash2Icon />
											</Button>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<Dialog open={editOpen} onOpenChange={setEditOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit news item</DialogTitle>
						<DialogDescription>Update the content shown on the reel.</DialogDescription>
					</DialogHeader>

					<Textarea
						value={draftContent}
						onChange={(e) => setDraftContent(e.target.value)}
					/>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setEditOpen(false);
								setTimeout(() => setActiveId(null), 200);
							}}
						>
							Cancel
						</Button>
						<Button
							disabled={
								updateMutation.isPending ||
								!editRow ||
								draftContent.trim().length === 0
							}
							onClick={() => {
								if (!editRow) return;
								updateMutation.mutate({
									data: { id: editRow.id, content: draftContent },
								});
							}}
						>
							{updateMutation.isPending ? "Saving..." : "Save"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete news item?</DialogTitle>
						<DialogDescription>
							This removes it from the campaign’s ticker.
						</DialogDescription>
					</DialogHeader>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setDeleteOpen(false);
								setTimeout(() => setActiveId(null), 200);
							}}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							disabled={deleteMutation.isPending || activeId == null}
							onClick={() => {
								if (activeId == null) return;
								deleteMutation.mutate({ data: { id: activeId } });
							}}
						>
							{deleteMutation.isPending ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}


