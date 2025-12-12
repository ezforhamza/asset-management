import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import type { MapAsset } from "#/entity";
import { VerificationStatus } from "#/enum";
import { AssetPopup } from "./AssetPopup";

interface AssetMarkerProps {
	asset: MapAsset;
	onViewDetails?: (assetId: string) => void;
}

// Custom marker icons based on status - Modern minimal design
const createIcon = (status: VerificationStatus) => {
	const colors = {
		[VerificationStatus.ON_TIME]: { fill: "#10B981", shadow: "#059669" },
		[VerificationStatus.DUE_SOON]: { fill: "#F59E0B", shadow: "#D97706" },
		[VerificationStatus.OVERDUE]: { fill: "#EF4444", shadow: "#DC2626" },
	};

	const { fill, shadow } = colors[status] || { fill: "#6B7280", shadow: "#4B5563" };

	return L.divIcon({
		className: "custom-marker-icon",
		html: `
			<div style="
				position: relative;
				width: 28px;
				height: 28px;
				transform: translate(-50%, -50%);
			">
				<div style="
					width: 28px;
					height: 28px;
					background: ${fill};
					border: 3px solid white;
					border-radius: 50%;
					box-shadow: 0 2px 8px ${shadow}80, 0 1px 3px rgba(0,0,0,0.2);
					display: flex;
					align-items: center;
					justify-content: center;
					transition: transform 0.2s ease;
				">
					<div style="
						width: 8px;
						height: 8px;
						background: white;
						border-radius: 50%;
					"></div>
				</div>
			</div>
		`,
		iconSize: [28, 28],
		iconAnchor: [14, 14],
		popupAnchor: [0, -14],
	});
};

export function AssetMarker({ asset, onViewDetails }: AssetMarkerProps) {
	const icon = createIcon(asset.status);

	return (
		<Marker position={[asset.location.latitude, asset.location.longitude]} icon={icon}>
			<Popup>
				<AssetPopup asset={asset} onViewDetails={onViewDetails} />
			</Popup>
		</Marker>
	);
}

export default AssetMarker;
