import { format } from "date-fns";
import L from "leaflet";
import { ChevronRight, MapPin } from "lucide-react";
import { Marker, Popup } from "react-leaflet";
import type { MapAsset } from "#/entity";
import { VerificationStatus } from "#/enum";
import { StatusBadge } from "@/pages/dashboard/components/StatusBadge";
import { Button } from "@/ui/button";

interface ClusterMarkerProps {
	assets: MapAsset[];
	position: [number, number];
	onViewDetails: (assetId: string) => void;
}

// Create cluster icon based on count and status distribution
const createClusterIcon = (assets: MapAsset[]) => {
	const count = assets.length;

	// Determine primary color based on worst status in cluster
	const hasOverdue = assets.some((a) => a.status === VerificationStatus.OVERDUE);
	const hasDueSoon = assets.some((a) => a.status === VerificationStatus.DUE_SOON);

	let bgColor = "#10B981"; // green
	let shadowColor = "#059669";
	if (hasOverdue) {
		bgColor = "#EF4444"; // red
		shadowColor = "#DC2626";
	} else if (hasDueSoon) {
		bgColor = "#F59E0B"; // orange
		shadowColor = "#D97706";
	}

	const size = count > 10 ? 48 : count > 5 ? 42 : 36;
	const fontSize = count > 99 ? 11 : count > 9 ? 13 : 14;

	return L.divIcon({
		className: "cluster-marker",
		html: `
			<div style="
				position: relative;
				width: ${size}px;
				height: ${size}px;
				transform: translate(-50%, -50%);
			">
				<div style="
					width: ${size}px;
					height: ${size}px;
					background: linear-gradient(135deg, ${bgColor} 0%, ${shadowColor} 100%);
					border: 3px solid white;
					border-radius: 50%;
					box-shadow: 0 4px 12px ${shadowColor}60, 0 2px 4px rgba(0,0,0,0.2);
					display: flex;
					align-items: center;
					justify-content: center;
					font-weight: 700;
					font-size: ${fontSize}px;
					color: white;
					font-family: system-ui, -apple-system, sans-serif;
				">
					${count}
				</div>
				<div style="
					position: absolute;
					bottom: -4px;
					right: -4px;
					width: 16px;
					height: 16px;
					background: white;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					box-shadow: 0 2px 4px rgba(0,0,0,0.2);
				">
					<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="${bgColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
						<path d="M12 5v14M5 12h14"/>
					</svg>
				</div>
			</div>
		`,
		iconSize: [size, size],
		iconAnchor: [size / 2, size / 2],
		popupAnchor: [0, -size / 2],
	});
};

export function ClusterMarker({ assets, position, onViewDetails }: ClusterMarkerProps) {
	const icon = createClusterIcon(assets);

	return (
		<Marker position={position} icon={icon}>
			<Popup minWidth={320} maxWidth={400} maxHeight={400}>
				<div className="py-1" style={{ maxHeight: "360px", display: "flex", flexDirection: "column" }}>
					{/* Header */}
					<div className="flex items-center justify-between mb-3 pb-2 border-b flex-shrink-0">
						<div className="flex items-center gap-2">
							<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
								<MapPin className="h-4 w-4 text-primary" />
							</div>
							<div>
								<p className="font-semibold text-sm">{assets.length} Assets at this location</p>
								<p className="text-xs text-muted-foreground">
									{position[0].toFixed(4)}, {position[1].toFixed(4)}
								</p>
							</div>
						</div>
					</div>

					{/* Status Summary */}
					<div className="flex items-center gap-2 mb-3 flex-wrap flex-shrink-0">
						{assets.filter((a) => a.status === VerificationStatus.ON_TIME).length > 0 && (
							<span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
								<span className="w-2 h-2 rounded-full bg-emerald-500" />
								{assets.filter((a) => a.status === VerificationStatus.ON_TIME).length} On Time
							</span>
						)}
						{assets.filter((a) => a.status === VerificationStatus.DUE_SOON).length > 0 && (
							<span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
								<span className="w-2 h-2 rounded-full bg-orange-500" />
								{assets.filter((a) => a.status === VerificationStatus.DUE_SOON).length} Due Soon
							</span>
						)}
						{assets.filter((a) => a.status === VerificationStatus.OVERDUE).length > 0 && (
							<span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
								<span className="w-2 h-2 rounded-full bg-red-500" />
								{assets.filter((a) => a.status === VerificationStatus.OVERDUE).length} Overdue
							</span>
						)}
					</div>

					{/* Asset List - Scrollable */}
					<div className="flex-1 overflow-y-auto pr-1" style={{ maxHeight: "220px", overflowY: "auto" }}>
						<div className="space-y-2">
							{assets.map((asset) => (
								<div
									key={asset.assetId}
									className="p-2 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
								>
									<div className="flex items-start justify-between gap-2">
										<div className="flex-1 min-w-0">
											<p className="font-medium text-sm truncate">{asset.serialNumber}</p>
											<p className="text-xs text-muted-foreground truncate">
												{asset.make} {asset.model}
											</p>
											{asset.lastVerified && (
												<p className="text-xs text-muted-foreground mt-1">
													Last: {format(new Date(asset.lastVerified), "MMM dd, yyyy")}
												</p>
											)}
										</div>
										<div className="flex flex-col items-end gap-1">
											<StatusBadge status={asset.status} />
											<Button
												size="sm"
												variant="ghost"
												className="h-6 px-2 text-xs"
												onClick={() => onViewDetails(asset.assetId)}
											>
												View
												<ChevronRight className="h-3 w-3 ml-1" />
											</Button>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</Popup>
		</Marker>
	);
}

export default ClusterMarker;
