import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import type { MapAsset } from "#/entity";
import { VerificationStatus } from "#/enum";
import { AssetPopup } from "./AssetPopup";

interface AssetMarkerProps {
	asset: MapAsset;
	onViewDetails?: (assetId: string) => void;
	isHighlighted?: boolean;
}

// Custom marker icons based on status - Modern minimal design
const createIcon = (status: VerificationStatus, isHighlighted = false) => {
	const colors = {
		[VerificationStatus.ON_TIME]: { fill: "#10B981", shadow: "#059669" },
		[VerificationStatus.DUE_SOON]: { fill: "#F59E0B", shadow: "#D97706" },
		[VerificationStatus.OVERDUE]: { fill: "#EF4444", shadow: "#DC2626" },
	};

	const { fill, shadow } = colors[status] || { fill: "#6B7280", shadow: "#4B5563" };
	const size = isHighlighted ? 40 : 28;
	const innerSize = isHighlighted ? 12 : 8;
	const highlightRing = isHighlighted
		? `box-shadow: 0 0 0 4px ${fill}40, 0 0 20px ${fill}80, 0 2px 8px ${shadow}80;`
		: `box-shadow: 0 2px 8px ${shadow}80, 0 1px 3px rgba(0,0,0,0.2);`;
	const animation = isHighlighted ? "animation: pulse-marker 1.5s ease-in-out infinite;" : "";

	return L.divIcon({
		className: "custom-marker-icon",
		html: `
			<style>
				@keyframes pulse-marker {
					0%, 100% { transform: translate(-50%, -50%) scale(1); }
					50% { transform: translate(-50%, -50%) scale(1.15); }
				}
			</style>
			<div style="
				position: relative;
				width: ${size}px;
				height: ${size}px;
				transform: translate(-50%, -50%);
				${animation}
			">
				<div style="
					width: ${size}px;
					height: ${size}px;
					background: ${fill};
					border: ${isHighlighted ? 4 : 3}px solid white;
					border-radius: 50%;
					${highlightRing}
					display: flex;
					align-items: center;
					justify-content: center;
					transition: transform 0.2s ease;
				">
					<div style="
						width: ${innerSize}px;
						height: ${innerSize}px;
						background: white;
						border-radius: 50%;
					"></div>
				</div>
			</div>
		`,
		iconSize: [size, size],
		iconAnchor: [size / 2, size / 2],
		popupAnchor: [0, -size / 2],
	});
};

export function AssetMarker({ asset, onViewDetails, isHighlighted = false }: AssetMarkerProps) {
	const icon = createIcon(asset.status, isHighlighted);

	return (
		<Marker
			position={[asset.location.latitude, asset.location.longitude]}
			icon={icon}
			zIndexOffset={isHighlighted ? 1000 : 0}
		>
			<Popup>
				<AssetPopup asset={asset} onViewDetails={onViewDetails} />
			</Popup>
		</Marker>
	);
}

export default AssetMarker;
