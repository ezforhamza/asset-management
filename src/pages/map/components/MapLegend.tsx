import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

export function MapLegend() {
	return (
		<div className="absolute bottom-6 left-6 z-[1000] bg-background/95 backdrop-blur-sm rounded-xl shadow-lg border p-4">
			<h4 className="font-semibold text-sm mb-3">Asset Status</h4>
			<div className="space-y-2">
				<div className="flex items-center gap-2 text-sm">
					<div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
						<CheckCircle className="h-3 w-3 text-white" />
					</div>
					<span>On Time</span>
				</div>
				<div className="flex items-center gap-2 text-sm">
					<div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
						<Clock className="h-3 w-3 text-white" />
					</div>
					<span>Due Soon (&lt;7 days)</span>
				</div>
				<div className="flex items-center gap-2 text-sm">
					<div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
						<AlertTriangle className="h-3 w-3 text-white" />
					</div>
					<span>Overdue</span>
				</div>
			</div>
		</div>
	);
}

export default MapLegend;
