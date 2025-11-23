import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { marked } from "marked";
import z from "zod";

// Server function to read and process markdown
const getScenarioContent = createServerFn({ method: "GET" })
	.inputValidator(z.object({ scenarioId: z.string() }))
	.handler(async ({ data }) => {
		try {
			// Read the markdown file from the content directory
			const filePath = join(
				process.cwd(),
				"src",
				"content",
				"scenarios",
				`${data.scenarioId}.md`,
			);
			const markdown = await readFile(filePath, "utf-8");

			// Parse markdown to HTML on the server
			const html = await marked.parse(markdown);

			return { html, error: null };
		} catch (error) {
			console.error("Error loading scenario:", error);
			return {
				html: null,
				error:
					error instanceof Error ? error.message : "Failed to load scenario",
			};
		}
	});

export const Route = createFileRoute("/reference/scenarios/$scenarioId")({
	component: ScenarioComponent,
	loader: async ({ params }) => {
		return getScenarioContent({ data: { scenarioId: params.scenarioId } });
	},
});

function ScenarioComponent() {
	const loaderData = Route.useLoaderData();

	if (loaderData.error) {
		return (
			<div className="container mx-auto p-4">
				<div className="rounded-lg border border-red-500 bg-red-50 p-4 dark:bg-red-950">
					<h2 className="text-lg font-semibold text-red-900 dark:text-red-100">
						Error Loading Scenario
					</h2>
					<p className="text-red-700 dark:text-red-300">{loaderData.error}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-4xl p-4">
			<div className="mb-4">
				<Link
					to="/reference/scenarios"
					className="text-sm text-blue-600 hover:underline dark:text-blue-400"
				>
					← Back to Scenarios
				</Link>
			</div>
			<article
				className="prose prose-slate dark:prose-invert max-w-none"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: Server-rendered markdown from trusted source
				dangerouslySetInnerHTML={{ __html: loaderData.html || "" }}
			/>
		</div>
	);
}
