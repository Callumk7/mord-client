import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/display/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="h-screen flex flex-col items-center justify-center overflow-hidden">
			<h1 className="text-6xl text-destructive">Go to Campaign</h1>
		</div>
	);
}
