import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Header } from "~/components/header";

export const Route = createFileRoute("/$campaign")({
	component: RouteComponent,
});

function RouteComponent() {
	const { campaign } = Route.useParams();
	return (
		<div className="min-h-screen bg-background">
			<Header campaignId={campaign} />
			<div className="container mx-auto mt-18">
				<Outlet />
			</div>
		</div>
	);
}
