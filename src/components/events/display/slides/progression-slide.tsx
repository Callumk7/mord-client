import { WarbandProgressChart } from "~/components/campaign/warband-progress-chart";
import type {
	ProgressChartRow,
	ProgressMetric,
	WarbandMeta,
} from "~/lib/campaign-history";
import type { BroadcastChart } from "~/types/display";

interface ProgressionSlideProps {
	id: string;
	title: string;
	subtitle: string;
	gradient: string;
	chartData: ProgressChartRow[];
	warbands: WarbandMeta[];
	metric: ProgressMetric;
	yAxisLabel: string;
	defaultColor: string;
}

export function createProgressionSlide({
	id,
	title,
	subtitle,
	gradient,
	chartData,
	warbands,
	metric,
	yAxisLabel,
	defaultColor,
}: ProgressionSlideProps): BroadcastChart {
	return {
		type: "chart",
		id,
		gradient,
		content: (
			<div className="flex h-full w-full min-h-0 flex-col p-6 pb-4">
				<div className="mb-4 flex-shrink-0">
					<h3 className="text-lg font-black tracking-wider text-foreground">
						{title}
					</h3>
					<p className="text-xs font-semibold tracking-[0.35em] text-muted-foreground">
						{subtitle}
					</p>
				</div>
				<div className="min-h-0 flex-1 overflow-hidden">
					<WarbandProgressChart
						title=""
						chartData={chartData}
						warbands={warbands}
						metric={metric}
						yAxisLabel={yAxisLabel}
						defaultColor={defaultColor}
						showLegend={true}
						variant="embedded"
					/>
				</div>
			</div>
		),
	};
}
