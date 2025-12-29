import { RecentResultsSlide } from "~/components/events/display/recent-results-slide";
import { CAROUSEL_GRADIENTS } from "~/lib/display-utils";
import type { BroadcastChart, MatchHighlight } from "~/types/display";

export function createRecentResultsSlide(
	highlights: MatchHighlight[],
): BroadcastChart {
	return {
		type: "chart",
		id: "recent-results-slide",
		gradient: CAROUSEL_GRADIENTS["red-to-blue"],
		content: (
			<div className="h-full w-full p-4">
				<RecentResultsSlide highlights={highlights} />
			</div>
		),
	};
}
