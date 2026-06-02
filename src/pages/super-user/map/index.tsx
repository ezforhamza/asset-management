import { GoogleMap, InfoWindow, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Building2, Calendar, CalendarClock, ChevronRight, ExternalLink, Loader2, MapPin, Tag } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import reportService, { type MapLocationItem } from "@/api/services/reportService";
import { Button } from "@/ui/button";
import { CompanyFilter } from "../components/CompanyFilter";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

const containerStyle = { width: "100%", height: "100%" };
const worldCenter = { lat: 20, lng: 0 };

const mapOptions: google.maps.MapOptions = {
	zoomControl: true,
	mapTypeControl: true,
	streetViewControl: false,
	fullscreenControl: true,
	minZoom: 2,
	maxZoom: 20,
	restriction: {
		latLngBounds: { north: 85, south: -85, west: -180, east: 180 },
		strictBounds: true,
	},
	gestureHandling: "greedy",
	styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }],
};

type AssetStatus = "on_time" | "due_soon" | "overdue" | "never_verified" | "all";

const statusColors: Record<string, { color: string; label: string }> = {
	on_time: { color: "#10B981", label: "On Time" },
	due_soon: { color: "#F59E0B", label: "Due Soon" },
	overdue: { color: "#EF4444", label: "Overdue" },
	never_verified: { color: "#3B82F6", label: "Registered" },
};

const createPinMarker = (color: string, isHighlighted = false): string => {
	const scale = isHighlighted ? 1.3 : 1;
	const w = Math.round(24 * scale);
	const h = Math.round(36 * scale);
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 24 36"><path d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24c0-6.6-5.4-12-12-12z" fill="${color}" stroke="white" stroke-width="1.5"/><circle cx="12" cy="12" r="5" fill="white"/></svg>`;
	return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const getMarkerColor = (status: string) => statusColors[status]?.color || "#6B7280";
const getStatusLabel = (status: string) => statusColors[status]?.label || status;

interface AssetCluster {
	key: string;
	position: { lat: number; lng: number };
	assets: MapLocationItem[];
}

const groupAssetsByAssetId = (assets: MapLocationItem[]): AssetCluster[] => {
	const assetMap = new Map<string, MapLocationItem[]>();
	for (const asset of assets) {
		const existing = assetMap.get(asset.assetId) || [];
		existing.push(asset);
		assetMap.set(asset.assetId, existing);
	}
	return Array.from(assetMap.entries()).map(([assetId, records]) => ({
		key: assetId,
		position: { lat: records[0].location.latitude, lng: records[0].location.longitude },
		assets: records,
	}));
};

const hasValidLocation = (item: MapLocationItem) =>
	item.location &&
	typeof item.location.latitude === "number" &&
	typeof item.location.longitude === "number" &&
	!Number.isNaN(item.location.latitude) &&
	!Number.isNaN(item.location.longitude) &&
	item.location.latitude >= -90 &&
	item.location.latitude <= 90 &&
	item.location.longitude >= -180 &&
	item.location.longitude <= 180;

export default function SuperUserMapPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [companyId, setCompanyId] = useState("all");
	const [selectedStatus, setSelectedStatus] = useState<AssetStatus>("all");
	const [selectedCluster, setSelectedCluster] = useState<AssetCluster | null>(null);
	const [map, setMap] = useState<google.maps.Map | null>(null);
	const initialFitDone = useRef(false);

	const { isLoaded, loadError } = useJsApiLoader({
		id: "google-map-script",
		googleMapsApiKey: GOOGLE_MAPS_API_KEY,
	});

	const highlightLat = searchParams.get("lat");
	const highlightLng = searchParams.get("lng");
	const highlightAssetId = searchParams.get("assetId") || searchParams.get("highlight");

	const mapParams = useMemo(() => {
		const p: { companyId?: string; status?: string } = {};
		if (companyId && companyId !== "all") p.companyId = companyId;
		return p;
	}, [companyId]);

	const { data, isLoading } = useQuery({
		queryKey: ["super-user", "map", "locations", mapParams],
		queryFn: () => reportService.getMapLocations(mapParams),
	});

	const assets = useMemo(() => (data?.results || []).filter(hasValidLocation), [data]);

	const filteredAssets = useMemo(() => {
		if (selectedStatus === "all") return assets;
		return assets.filter((a) => a.status === selectedStatus);
	}, [assets, selectedStatus]);

	const clusters = useMemo(() => groupAssetsByAssetId(filteredAssets), [filteredAssets]);

	const counts = useMemo(
		() => ({
			total: assets.length,
			onTime: assets.filter((a) => a.status === "on_time").length,
			dueSoon: assets.filter((a) => a.status === "due_soon").length,
			overdue: assets.filter((a) => a.status === "overdue").length,
			registered: assets.filter((a) => a.status === "never_verified").length,
		}),
		[assets],
	);

	const highlightedAsset = useMemo(() => {
		if (!highlightAssetId || !assets.length) return null;
		return assets.find((a) => a.assetId === highlightAssetId) || null;
	}, [highlightAssetId, assets]);

	const highlightedLocation = useMemo(() => {
		if (highlightLat && highlightLng) return { lat: parseFloat(highlightLat), lng: parseFloat(highlightLng) };
		if (highlightedAsset) return { lat: highlightedAsset.location.latitude, lng: highlightedAsset.location.longitude };
		return null;
	}, [highlightLat, highlightLng, highlightedAsset]);

	const mapCenter = useMemo(() => {
		if (highlightedLocation) return highlightedLocation;
		if (!filteredAssets.length) return worldCenter;
		const lat = filteredAssets.reduce((s, a) => s + a.location.latitude, 0) / filteredAssets.length;
		const lng = filteredAssets.reduce((s, a) => s + a.location.longitude, 0) / filteredAssets.length;
		return { lat, lng };
	}, [filteredAssets, highlightedLocation]);

	const onMapLoad = useCallback((mapInstance: google.maps.Map) => setMap(mapInstance), []);

	useEffect(() => {
		if (!map || initialFitDone.current) return;
		if (highlightedLocation) {
			map.setCenter(highlightedLocation);
			map.setZoom(16);
			initialFitDone.current = true;
			if (highlightedAsset) {
				const cluster = clusters.find((c) => c.assets.some((a) => a.assetId === highlightedAsset.assetId));
				if (cluster) setSelectedCluster(cluster);
			}
		} else if (filteredAssets.length > 0) {
			const bounds = new google.maps.LatLngBounds();
			filteredAssets.forEach((a) => bounds.extend({ lat: a.location.latitude, lng: a.location.longitude }));
			map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
			initialFitDone.current = true;
		}
	}, [map, filteredAssets, highlightedLocation, highlightedAsset, clusters]);

	const handleMapClick = useCallback(() => setSelectedCluster(null), []);

	const handleViewDetails = useCallback(
		(assetId: string, assetCompanyId?: string) => {
			if (assetCompanyId) {
				navigate(`/super-user/companies/${assetCompanyId}/assets/${assetId}`);
			}
		},
		[navigate],
	);

	const getClusterColor = (clusterAssets: MapLocationItem[]) => {
		if (clusterAssets.some((a) => a.status === "overdue")) return statusColors.overdue.color;
		if (clusterAssets.some((a) => a.status === "due_soon")) return statusColors.due_soon.color;
		if (clusterAssets.some((a) => a.status === "never_verified")) return statusColors.never_verified.color;
		return statusColors.on_time.color;
	};

	if (loadError) {
		return (
			<div className="h-[calc(100vh-64px)] flex items-center justify-center">
				<p className="text-destructive">Error loading Google Maps</p>
			</div>
		);
	}

	return (
		<div className="h-[calc(100vh-64px)] flex flex-col bg-background">
			{/* Top Bar */}
			<div className="flex-shrink-0 px-4 py-3 border-b bg-card/80 backdrop-blur-sm">
				<div className="flex items-center justify-between flex-wrap gap-3">
					{/* Left: title + company filter */}
					<div className="flex items-center gap-3">
						<div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
							<MapPin className="h-4 w-4 text-primary" />
						</div>
						<div>
							<h1 className="text-base font-semibold">Asset Map</h1>
							<p className="text-xs text-muted-foreground">
								{isLoading ? "Loading..." : `${filteredAssets.length} of ${counts.total} assets`}
							</p>
						</div>
						<CompanyFilter
							value={companyId}
							onChange={(v) => {
								setCompanyId(v);
								setSelectedCluster(null);
								initialFitDone.current = false;
							}}
						/>
					</div>

					{/* Right: Status Filter Pills */}
					<div className="flex items-center gap-1 p-1 bg-muted rounded-lg overflow-x-auto">
						{[
							{ value: "all", label: `All (${counts.total})` },
							{ value: "on_time", label: `On Time (${counts.onTime})`, bg: "bg-emerald-500" },
							{ value: "due_soon", label: `Due Soon (${counts.dueSoon})`, bg: "bg-orange-500" },
							{ value: "overdue", label: `Overdue (${counts.overdue})`, bg: "bg-red-500" },
							{ value: "never_verified", label: `Registered (${counts.registered})`, bg: "bg-blue-500" },
						].map(({ value, label, bg }) => (
							<button
								key={value}
								type="button"
								onClick={() => {
									setSelectedStatus(value as AssetStatus);
									initialFitDone.current = false;
									setSelectedCluster(null);
								}}
								className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
									selectedStatus === value
										? bg
											? `${bg} text-white shadow-sm`
											: "bg-background text-foreground shadow-sm"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								{label}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Map */}
			<div className="flex-1 relative min-h-0">
				{isLoading || !isLoaded ? (
					<div className="absolute inset-0 flex items-center justify-center bg-muted/30">
						<div className="flex flex-col items-center gap-3">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
							<p className="text-muted-foreground">Loading map...</p>
						</div>
					</div>
				) : (
					<>
						<GoogleMap
							mapContainerStyle={containerStyle}
							center={mapCenter}
							zoom={highlightedLocation ? 16 : 2}
							options={mapOptions}
							onLoad={onMapLoad}
							onClick={handleMapClick}
						>
							{clusters.map((cluster) => (
								<Marker
									key={cluster.key}
									position={cluster.position}
									icon={{
										url: createPinMarker(
											cluster.assets.length === 1
												? getMarkerColor(cluster.assets[0].status)
												: getClusterColor(cluster.assets),
											cluster.assets.some((a) => a.assetId === highlightAssetId),
										),
										scaledSize: new google.maps.Size(
											cluster.assets.some((a) => a.assetId === highlightAssetId) ? 31 : 24,
											cluster.assets.some((a) => a.assetId === highlightAssetId) ? 47 : 36,
										),
										anchor: new google.maps.Point(
											cluster.assets.some((a) => a.assetId === highlightAssetId) ? 15.5 : 12,
											cluster.assets.some((a) => a.assetId === highlightAssetId) ? 47 : 36,
										),
									}}
									label={
										cluster.assets.length > 1
											? { text: String(cluster.assets.length), color: "#1f2937", fontSize: "11px", fontWeight: "bold" }
											: undefined
									}
									onClick={() => setSelectedCluster(cluster)}
								/>
							))}

							{selectedCluster && (
								<InfoWindow position={selectedCluster.position} onCloseClick={() => setSelectedCluster(null)}>
									<div className="min-w-[280px] max-w-[320px] p-1">
										{selectedCluster.assets.length === 1 ? (
											<SingleAssetPopup asset={selectedCluster.assets[0]} onViewDetails={handleViewDetails} />
										) : (
											<ClusterAssetList assets={selectedCluster.assets} onViewDetails={handleViewDetails} />
										)}
									</div>
								</InfoWindow>
							)}
						</GoogleMap>

						<div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border p-2.5 z-[500]">
							<p className="text-xs font-medium text-muted-foreground mb-1.5">Legend</p>
							<div className="flex flex-col gap-1">
								{Object.entries(statusColors).map(([, { color, label }]) => (
									<div key={label} className="flex items-center gap-2">
										<span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
										<span className="text-xs">{label}</span>
									</div>
								))}
							</div>
						</div>

						<div className="absolute top-3 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-sm rounded-full shadow-lg border px-3 py-1.5 z-[500]">
							<p className="text-xs font-medium">{filteredAssets.length} assets on map</p>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

function SingleAssetPopup({
	asset,
	onViewDetails,
}: {
	asset: MapLocationItem;
	onViewDetails: (id: string, companyId?: string) => void;
}) {
	return (
		<div className="p-2">
			<div className="flex items-start justify-between mb-2">
				<div>
					<h3 className="font-semibold text-sm">{asset.serialNumber}</h3>
					<p className="text-xs text-gray-600">
						{asset.make} {asset.model}
					</p>
				</div>
				<span
					className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
					style={{ backgroundColor: getMarkerColor(asset.status) }}
				>
					{getStatusLabel(asset.status)}
				</span>
			</div>
			<div className="space-y-1 text-xs text-gray-600 mb-2">
				<div className="flex items-center gap-1.5">
					<Tag className="h-3 w-3" />
					<span>{asset.category}</span>
				</div>
				{asset.companyName && (
					<div className="flex items-center gap-1.5">
						<Building2 className="h-3 w-3" />
						<span className="font-medium">{asset.companyName}</span>
					</div>
				)}
				{asset.siteName && (
					<div className="flex items-center gap-1.5">
						<Building2 className="h-3 w-3" />
						<span>{asset.siteName}</span>
					</div>
				)}
				<div className="flex items-center gap-1.5">
					<MapPin className="h-3 w-3" />
					<span>
						{asset.location.latitude.toFixed(4)}, {asset.location.longitude.toFixed(4)}
					</span>
				</div>
				<div className="flex items-center gap-1.5">
					<Calendar className="h-3 w-3" />
					<span>Registered: {format(new Date(asset.registeredAt), "MMM dd, yyyy")}</span>
				</div>
				{asset.lastVerified && (
					<div className="flex items-center gap-1.5">
						<CalendarClock className="h-3 w-3" />
						<span>Last verified: {format(new Date(asset.lastVerified), "MMM dd, yyyy")}</span>
					</div>
				)}
				{asset.nextDue && (
					<div className="flex items-center gap-1.5">
						<CalendarClock className="h-3 w-3" />
						<span>Due: {format(new Date(asset.nextDue), "MMM dd, yyyy")}</span>
					</div>
				)}
			</div>
			<Button
				size="sm"
				variant="outline"
				className="w-full h-7 text-xs"
				onClick={() => onViewDetails(asset.assetId, asset.companyId)}
			>
				<ExternalLink className="h-3 w-3 mr-1" />
				View Details
			</Button>
		</div>
	);
}

function ClusterAssetList({
	assets,
	onViewDetails,
}: {
	assets: MapLocationItem[];
	onViewDetails: (id: string, companyId?: string) => void;
}) {
	const sortedAssets = useMemo(() => {
		const order = { never_verified: 0, overdue: 1, due_soon: 2, on_time: 3 };
		return [...assets].sort(
			(a, b) => (order[a.status as keyof typeof order] ?? 4) - (order[b.status as keyof typeof order] ?? 4),
		);
	}, [assets]);

	return (
		<div className="p-1">
			<div className="flex items-center justify-between mb-2 px-1">
				<h3 className="font-semibold text-sm">{assets.length} Assets at this location</h3>
			</div>
			<div className="max-h-[250px] overflow-y-auto space-y-1">
				{sortedAssets.map((asset) => (
					<div
						key={asset.assetId}
						className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
						onClick={() => onViewDetails(asset.assetId, asset.companyId)}
						onKeyDown={(e) => e.key === "Enter" && onViewDetails(asset.assetId, asset.companyId)}
					>
						<div className="flex items-center gap-2 min-w-0">
							<span
								className="w-2 h-2 rounded-full flex-shrink-0"
								style={{ backgroundColor: getMarkerColor(asset.status) }}
							/>
							<div className="min-w-0">
								<p className="text-xs font-medium truncate">{asset.serialNumber}</p>
								<p className="text-xs text-gray-500 truncate">
									{asset.make} {asset.model}
								</p>
								{asset.companyName && <p className="text-xs text-gray-400 truncate">{asset.companyName}</p>}
							</div>
						</div>
						<div className="flex items-center gap-1 flex-shrink-0">
							<span
								className="px-1.5 py-0.5 rounded text-xs font-medium text-white"
								style={{ backgroundColor: getMarkerColor(asset.status) }}
							>
								{getStatusLabel(asset.status)}
							</span>
							<ChevronRight className="h-3 w-3 text-gray-400" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
