import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/display")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<Outlet />
		</div>
	);
}
