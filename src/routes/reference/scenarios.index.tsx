import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface Scenario {
	id: string;
	title: string;
	number: string;
}

// Server function to get list of scenarios
const getScenarios = createServerFn({ method: "GET" }).handler(async () => {
	try {
		const scenariosPath = join(process.cwd(), "src", "content", "scenarios");
		const files = await readdir(scenariosPath);

		const scenarios: Scenario[] = files
			.filter((file) => file.endsWith(".md"))
			.map((file) => {
				const match = file.match(/^(\d+)-(.+)\.md$/);
				if (match) {
					const [, number, slug] = match;
					const title = slug
						.split("-")
						.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
						.join(" ");
					return {
						id: file.replace(".md", ""),
						number,
						title,
					};
				}
				return null;
			})
			.filter((s): s is Scenario => s !== null)
			.sort(
				(a, b) => Number.parseInt(a.number, 10) - Number.parseInt(b.number, 10),
			);

		return scenarios;
	} catch (error) {
		console.error("Error loading scenarios:", error);
		return [];
	}
});

export const Route = createFileRoute("/reference/scenarios/")({
	component: ScenariosIndexComponent,
	loader: async () => {
		return getScenarios();
	},
});

function ScenariosIndexComponent() {
	const scenarios = Route.useLoaderData();

	return (
		<div className="container mx-auto max-w-4xl p-4">
			<div className="mb-6">
				<h1 className="text-3xl font-bold">Scenario Reference</h1>
				<p className="mt-2 text-muted-foreground">
					Browse all available Mordheim scenarios for your campaign.
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				{scenarios.map((scenario) => (
					<Link
						key={scenario.id}
						to="/reference/scenarios/$scenarioId"
						params={{ scenarioId: scenario.id }}
						className="transition-transform hover:scale-[1.02]"
					>
						<Card className="h-full cursor-pointer hover:border-primary">
							<CardHeader>
								<CardTitle>
									<span className="text-muted-foreground">
										{scenario.number}.
									</span>{" "}
									{scenario.title}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									Click to view scenario details
								</p>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		</div>
	);
}
