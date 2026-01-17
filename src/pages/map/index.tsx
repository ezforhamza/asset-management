import { useQuery } from "@tanstack/react-query";
import L from "leaflet";
import { Layers, Loader2, MapPin } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { useNavigate, useSearchParams } from "react-router";
import "leaflet/dist/leaflet.css";

import type { MapAsset } from "#/entity";
import { VerificationStatus } from "#/enum";
import reportService from "@/api/services/reportService";
import { Button } from "@/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { AssetMarker } from "./components/AssetMarker";
import { ClusterMarker } from "./components/ClusterMarker";

// Group assets by location (for clustering nearby markers)
interface MarkerGroup {
	key: string;
	position: [number, number];
	assets: MapAsset[];
}

const CLUSTER_THRESHOLD = 0.0001; // ~11 meters - group markers within this distance

const groupAssetsByLocation = (assets: MapAsset[]): MarkerGroup[] => {
	const groups: MarkerGroup[] = [];
	const processed = new Set<string>();

	for (const asset of assets) {
		if (processed.has(asset.assetId)) continue;

		const nearbyAssets = assets.filter((other) => {
			if (processed.has(other.assetId)) return false;
			const latDiff = Math.abs(asset.location.latitude - other.location.latitude);
			const lngDiff = Math.abs(asset.location.longitude - other.location.longitude);
			return latDiff < CLUSTER_THRESHOLD && lngDiff < CLUSTER_THRESHOLD;
		});

		for (const nearby of nearbyAssets) {
			processed.add(nearby.assetId);
		}

		const avgLat = nearbyAssets.reduce((sum, a) => sum + a.location.latitude, 0) / nearbyAssets.length;
		const avgLng = nearbyAssets.reduce((sum, a) => sum + a.location.longitude, 0) / nearbyAssets.length;

		groups.push({
			key: `${avgLat.toFixed(6)}-${avgLng.toFixed(6)}`,
			position: [avgLat, avgLng],
			assets: nearbyAssets,
		});
	}

	return groups;
};

// Map tile providers - Premium looking options
const tileLayers = {
	default: {
		url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
		attribution:
			'&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
		name: "Default",
	},
	light: {
		url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
		attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
		name: "Light",
	},
	dark: {
		url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
		attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
		name: "Dark",
	},
	streets: {
		url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
		name: "Streets",
	},
	satellite: {
		url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
		attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
		name: "Satellite",
	},
	terrain: {
		url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
		attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
		name: "Terrain",
	},
};

// Status colors for legend
const statusColors = {
	[VerificationStatus.ON_TIME]: { color: "#10B981", label: "On Time" },
	[VerificationStatus.DUE_SOON]: { color: "#F59E0B", label: "Due Soon" },
	[VerificationStatus.OVERDUE]: { color: "#EF4444", label: "Overdue" },
};

// Map verification status string to enum
const mapVerificationStatus = (status: string | undefined): VerificationStatus | null => {
	switch (status) {
		case "on_time":
			return VerificationStatus.ON_TIME;
		case "due_soon":
			return VerificationStatus.DUE_SOON;
		case "overdue":
			return VerificationStatus.OVERDUE;
		default:
			return null;
	}
};

// Verification report item shape from /api/v1/reports/verifications
interface VerificationReportItem {
	_id: string;
	serialNumber: string;
	make: string;
	model: string;
	nextVerificationDue: string;
	registeredLocation?: {
		type: string;
		coordinates: [number, number]; // [longitude, latitude]
	};
	lastVerifiedAt: string | null;
	verificationStatus: "on_time" | "due_soon" | "overdue";
}

// Check if verification item has valid coordinates
const hasValidCoordinates = (item: VerificationReportItem): boolean => {
	const coords = item.registeredLocation?.coordinates;
	return (
		Array.isArray(coords) &&
		coords.length === 2 &&
		typeof coords[0] === "number" &&
		typeof coords[1] === "number" &&
		!Number.isNaN(coords[0]) &&
		!Number.isNaN(coords[1])
	);
};

// Component to fit bounds to all markers
function FitBoundsToMarkers({
	assets,
	highlightedLocation,
}: {
	assets: MapAsset[];
	highlightedLocation?: { lat: number; lng: number };
}) {
	const map = useMap();
	const hasInitialized = useRef(false);

	useEffect(() => {
		if (hasInitialized.current) return;

		// If there's a highlighted location, center on it with appropriate zoom
		if (highlightedLocation) {
			map.setView([highlightedLocation.lat, highlightedLocation.lng], 16);
			hasInitialized.current = true;
			return;
		}

		// Otherwise fit bounds to show all markers
		if (assets.length > 0) {
			const bounds = L.latLngBounds(assets.map((a) => [a.location.latitude, a.location.longitude]));
			// Use larger padding and lower maxZoom to ensure all markers are visible without showing map edges
			map.fitBounds(bounds, {
				padding: [80, 80],
				maxZoom: 12,
				animate: false,
			});
			hasInitialized.current = true;
		}
	}, [map, assets, highlightedLocation]);

	return null;
}

export default function MapPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [selectedStatus, setSelectedStatus] = useState<VerificationStatus | "all">("all");
	const [tileLayer, setTileLayer] = useState<keyof typeof tileLayers>("default");

	// Get highlight params from URL (when coming from VerificationCard)
	const highlightLat = searchParams.get("lat");
	const highlightLng = searchParams.get("lng");
	const highlightId = searchParams.get("highlight");

	const highlightedLocation = useMemo(() => {
		if (highlightLat && highlightLng) {
			return { lat: parseFloat(highlightLat), lng: parseFloat(highlightLng) };
		}
		return undefined;
	}, [highlightLat, highlightLng]);

	// Fetch verification report data - already excludes never_verified
	const { data, isLoading } = useQuery({
		queryKey: ["map", "verifications"],
		queryFn: () => reportService.getVerificationReport(),
	});

	// Transform verification report items to MapAsset format
	// API already excludes never_verified, so no filtering needed for that
	const assets = useMemo(() => {
		// API returns { results: [...] } - safely extract array
		const responseData = data as { results?: VerificationReportItem[] } | VerificationReportItem[] | undefined;
		const items: VerificationReportItem[] = Array.isArray(responseData)
			? responseData
			: Array.isArray(responseData?.results)
				? responseData.results
				: [];

		return items.filter(hasValidCoordinates).map((item): MapAsset => {
			const coords = item.registeredLocation!.coordinates;
			return {
				assetId: item._id,
				serialNumber: item.serialNumber,
				make: item.make,
				model: item.model,
				location: {
					longitude: coords[0],
					latitude: coords[1],
				},
				status: mapVerificationStatus(item.verificationStatus) || VerificationStatus.OVERDUE,
				lastVerified: item.lastVerifiedAt,
				nextVerificationDue: item.nextVerificationDue,
			};
		});
	}, [data]);

	// Filter assets by status
	const filteredAssets = useMemo(() => {
		if (!assets || assets.length === 0) return [];
		if (selectedStatus === "all") return assets;
		return assets.filter((a) => a.status === selectedStatus);
	}, [assets, selectedStatus]);

	// Group markers by location for clustering
	const markerGroups = useMemo(() => {
		return groupAssetsByLocation(filteredAssets);
	}, [filteredAssets]);

	// Calculate counts
	const counts = useMemo(() => {
		if (!assets || assets.length === 0) return { total: 0, onTime: 0, dueSoon: 0, overdue: 0 };
		return {
			total: assets.length,
			onTime: assets.filter((a) => a.status === VerificationStatus.ON_TIME).length,
			dueSoon: assets.filter((a) => a.status === VerificationStatus.DUE_SOON).length,
			overdue: assets.filter((a) => a.status === VerificationStatus.OVERDUE).length,
		};
	}, [assets]);

	// Calculate map center - use highlighted location or default
	const mapCenter = useMemo(() => {
		if (highlightedLocation) {
			return [highlightedLocation.lat, highlightedLocation.lng] as [number, number];
		}
		if (!filteredAssets || filteredAssets.length === 0) {
			return [24.8607, 67.0011] as [number, number];
		}
		const lat = filteredAssets.reduce((sum, a) => sum + a.location.latitude, 0) / filteredAssets.length;
		const lng = filteredAssets.reduce((sum, a) => sum + a.location.longitude, 0) / filteredAssets.length;
		return [lat, lng] as [number, number];
	}, [filteredAssets, highlightedLocation]);

	// Navigate to AssetHistoryPage instead of ReportsPage
	const handleViewDetails = (assetId: string, highlightRegistration = false) => {
		navigate(`/assets/${assetId}/history`, {
			state: { fromMap: true, highlightLatest: !highlightRegistration, highlightRegistration },
		});
	};

	const currentTile = tileLayers[tileLayer];

	return (
		<div className="h-[calc(100vh-64px)] flex flex-col bg-background">
			{/* Top Bar */}
			<div className="flex-shrink-0 px-6 py-4 border-b bg-card/80 backdrop-blur-sm">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
							<MapPin className="h-5 w-5 text-primary" />
						</div>
						<div>
							<h1 className="text-lg font-semibold">Asset Map</h1>
							<p className="text-sm text-muted-foreground">
								{isLoading ? "Loading..." : `${filteredAssets.length} of ${counts.total} assets`}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-3">
						{/* Status Filter Pills */}
						<div className="hidden md:flex items-center gap-1 p-1 bg-muted rounded-lg">
							<button
								type="button"
								onClick={() => setSelectedStatus("all")}
								className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
									selectedStatus === "all"
										? "bg-background text-foreground shadow-sm"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								All ({counts.total})
							</button>
							<button
								type="button"
								onClick={() => setSelectedStatus(VerificationStatus.ON_TIME)}
								className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
									selectedStatus === VerificationStatus.ON_TIME
										? "bg-emerald-500 text-white shadow-sm"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								On Time ({counts.onTime})
							</button>
							<button
								type="button"
								onClick={() => setSelectedStatus(VerificationStatus.DUE_SOON)}
								className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
									selectedStatus === VerificationStatus.DUE_SOON
										? "bg-orange-500 text-white shadow-sm"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								Due Soon ({counts.dueSoon})
							</button>
							<button
								type="button"
								onClick={() => setSelectedStatus(VerificationStatus.OVERDUE)}
								className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
									selectedStatus === VerificationStatus.OVERDUE
										? "bg-red-500 text-white shadow-sm"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								Overdue ({counts.overdue})
							</button>
						</div>

						{/* Map Style */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm" className="gap-2">
									<Layers className="h-4 w-4" />
									<span className="hidden sm:inline">{currentTile.name}</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="z-[1000]">
								{Object.entries(tileLayers).map(([key, layer]) => (
									<DropdownMenuItem key={key} onClick={() => setTileLayer(key as keyof typeof tileLayers)}>
										{layer.name}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>

			{/* Map Container - Full remaining height */}
			<div className="flex-1 relative">
				{isLoading ? (
					<div className="absolute inset-0 flex items-center justify-center bg-muted/30">
						<div className="flex flex-col items-center gap-3">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
							<p className="text-muted-foreground">Loading map...</p>
						</div>
					</div>
				) : (
					<>
						<MapContainer
							center={mapCenter}
							zoom={3}
							className="h-full w-full map-container-styled"
							style={{ background: "#aad3df", zIndex: 1 }}
							zoomControl={true}
							minZoom={2}
							maxZoom={18}
							maxBounds={[
								[-90, -180],
								[90, 180],
							]}
							maxBoundsViscosity={0.8}
						>
							<TileLayer attribution={currentTile.attribution} url={currentTile.url} />
							<FitBoundsToMarkers assets={filteredAssets} highlightedLocation={highlightedLocation} />
							{markerGroups.map((group) =>
								group.assets.length === 1 ? (
									<AssetMarker
										key={group.assets[0].assetId}
										asset={group.assets[0]}
										onViewDetails={handleViewDetails}
										isHighlighted={group.assets[0].assetId === highlightId}
									/>
								) : (
									<ClusterMarker
										key={group.key}
										assets={group.assets}
										position={group.position}
										onViewDetails={handleViewDetails}
									/>
								),
							)}
						</MapContainer>

						{/* Floating Legend */}
						<div className="absolute bottom-6 left-6 bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border p-3 z-[500]">
							<p className="text-xs font-medium text-muted-foreground mb-2">Legend</p>
							<div className="flex flex-col gap-1.5">
								{Object.entries(statusColors).map(([, { color, label }]) => (
									<div key={label} className="flex items-center gap-2">
										<span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
										<span className="text-xs">{label}</span>
									</div>
								))}
							</div>
						</div>

						{/* Asset Count Badge - Centered at top */}
						<div className="absolute top-4 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-sm rounded-full shadow-lg border px-4 py-2 z-[500]">
							<p className="text-sm font-medium">{filteredAssets.length} assets on map</p>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
