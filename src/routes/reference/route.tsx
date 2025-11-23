import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ReferenceHeader } from "~/components/header";

export const Route = createFileRoute("/reference")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<ReferenceHeader />
			<Outlet />
		</div>
	);
}
