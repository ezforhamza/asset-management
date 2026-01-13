import { useQuery } from "@tanstack/react-query";
import { Layers, Loader2, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import type { MapAsset } from "#/entity";
import { VerificationStatus } from "#/enum";
import reportService from "@/api/services/reportService";
import { Button } from "@/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { AssetMarker } from "./components/AssetMarker";

// Map tile providers
const tileLayers = {
	light: {
		url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
		attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
		name: "Light",
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

export default function MapPage() {
	const [selectedStatus, setSelectedStatus] = useState<VerificationStatus | "all">("all");
	const [tileLayer, setTileLayer] = useState<keyof typeof tileLayers>("light");

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

	// Calculate map center
	const mapCenter = useMemo(() => {
		if (!filteredAssets || filteredAssets.length === 0) {
			return [24.8607, 67.0011] as [number, number];
		}
		const lat = filteredAssets.reduce((sum, a) => sum + a.location.latitude, 0) / filteredAssets.length;
		const lng = filteredAssets.reduce((sum, a) => sum + a.location.longitude, 0) / filteredAssets.length;
		return [lat, lng] as [number, number];
	}, [filteredAssets]);

	const handleViewDetails = (assetId: string) => {
		window.location.href = `/reports?asset=${assetId}`;
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
							zoom={14}
							className="h-full w-full"
							style={{ background: "#f1f5f9", zIndex: 1 }}
							zoomControl={false}
						>
							<TileLayer attribution={currentTile.attribution} url={currentTile.url} />
							{filteredAssets.map((asset) => (
								<AssetMarker
									key={asset.assetId}
									asset={asset as unknown as MapAsset}
									onViewDetails={handleViewDetails}
								/>
							))}
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

						{/* Asset Count Badge */}
						<div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border px-3 py-2 z-[500]">
							<p className="text-sm font-medium">{filteredAssets.length} assets</p>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
