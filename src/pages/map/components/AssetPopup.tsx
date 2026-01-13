import { format } from "date-fns";
import { Calendar, CalendarClock, ExternalLink, MapPin } from "lucide-react";
import type { MapAsset } from "#/entity";
import { StatusBadge } from "@/pages/dashboard/components/StatusBadge";
import { Button } from "@/ui/button";

interface AssetPopupProps {
	asset: MapAsset;
	onViewDetails?: (assetId: string) => void;
}

export function AssetPopup({ asset, onViewDetails }: AssetPopupProps) {
	return (
		<div className="min-w-[280px] p-1">
			{/* Header */}
			<div className="flex items-start justify-between mb-3">
				<div>
					<h3 className="font-semibold text-base">{asset.serialNumber}</h3>
					<p className="text-sm text-muted-foreground">
						{asset.make} {asset.model}
					</p>
				</div>
				<StatusBadge status={asset.status} />
			</div>

			{/* Details */}
			<div className="space-y-2 text-sm">
				<div className="flex items-center gap-2 text-muted-foreground">
					<MapPin className="h-4 w-4 flex-shrink-0" />
					<span>
						{asset.location.latitude.toFixed(4)}, {asset.location.longitude.toFixed(4)}
					</span>
				</div>

				<div className="flex items-center gap-2 text-muted-foreground">
					<Calendar className="h-4 w-4 flex-shrink-0" />
					<span>
						{asset.lastVerified
							? `Last verified: ${format(new Date(asset.lastVerified), "MMM dd, yyyy")}`
							: "Never verified"}
					</span>
				</div>

				<div className="flex items-center gap-2 text-muted-foreground">
					<CalendarClock className="h-4 w-4 flex-shrink-0" />
					<span>
						{asset.nextVerificationDue
							? `Next due: ${format(new Date(asset.nextVerificationDue), "MMM dd, yyyy")}`
							: "Not scheduled"}
					</span>
				</div>
			</div>

			{/* Actions */}
			{onViewDetails && (
				<div className="mt-4 pt-3 border-t">
					<Button size="sm" variant="outline" className="w-full" onClick={() => onViewDetails(asset.assetId)}>
						<ExternalLink className="h-4 w-4 mr-2" />
						View Full Details
					</Button>
				</div>
			)}
		</div>
	);
}

export default AssetPopup;
