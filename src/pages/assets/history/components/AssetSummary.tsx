import { format } from "date-fns";
import { Calendar, Hash, MapPin, QrCode, Tag } from "lucide-react";
import type { Asset } from "#/entity";
import { Card, CardContent } from "@/ui/card";
import { StyledBadge } from "@/utils/badge-styles";

interface AssetSummaryProps {
	asset: Asset;
}

export function AssetSummary({ asset }: AssetSummaryProps) {
	const getStatusBadge = (status: string) => {
		switch (status) {
			case "active":
				return <StyledBadge color="emerald">Active</StyledBadge>;
			case "retired":
				return <StyledBadge color="gray">Retired</StyledBadge>;
			case "transferred":
				return <StyledBadge color="blue">Transferred</StyledBadge>;
			default:
				return <StyledBadge color="gray">{status}</StyledBadge>;
		}
	};

	const getRegistrationBadge = (state?: string) => {
		switch (state) {
			case "registered":
			case "fully_registered":
				return <StyledBadge color="emerald">Registered</StyledBadge>;
			case "partially_registered":
				return <StyledBadge color="orange">Partial</StyledBadge>;
			case "unregistered":
				return <StyledBadge color="gray">Unregistered</StyledBadge>;
			default:
				return <StyledBadge color="gray">{state || "Unknown"}</StyledBadge>;
		}
	};

	const formatDate = (dateStr: string | null | undefined) => {
		if (!dateStr) return "—";
		try {
			return format(new Date(dateStr), "MMM d, yyyy 'at' h:mm a");
		} catch {
			return "—";
		}
	};

	return (
		<Card className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border shadow-sm">
			<CardContent className="pt-6">
				<div className="grid grid-cols-3 md:grid-cols-6 gap-4">
					{/* Row 1 */}
					<div className="space-y-1">
						<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
							<Hash className="h-3 w-3" />
							Serial Number
						</div>
						<p className="font-mono font-medium text-sm">{asset.serialNumber}</p>
					</div>

					<div className="space-y-1">
						<div className="text-xs text-muted-foreground">Make</div>
						<p className="font-medium text-sm">{asset.make}</p>
					</div>

					<div className="space-y-1">
						<div className="text-xs text-muted-foreground">Model</div>
						<p className="font-medium text-sm">{asset.model}</p>
					</div>

					<div className="space-y-1">
						<div className="text-xs text-muted-foreground">Status</div>
						{getStatusBadge(asset.status)}
					</div>

					<div className="space-y-1">
						<div className="text-xs text-muted-foreground">Registration</div>
						{getRegistrationBadge(asset.registrationState)}
					</div>

					<div className="space-y-1">
						<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
							<Calendar className="h-3 w-3" />
							Registered At
						</div>
						<p className="text-xs">{formatDate(asset.registeredAt)}</p>
					</div>

					{/* Row 2 */}
					<div className="space-y-1">
						<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
							<Tag className="h-3 w-3" />
							Category
						</div>
						<p className="font-medium text-sm">{asset.category?.name || "—"}</p>
					</div>

					<div className="space-y-1">
						<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
							<QrCode className="h-3 w-3" />
							QR Code
						</div>
						<p className="font-mono text-xs">
							{typeof asset.qrCode === "string" ? asset.qrCode : asset.qrCode?.code || "Not linked"}
						</p>
					</div>

					<div className="space-y-1">
						<div className="text-xs text-muted-foreground">Site Name</div>
						<p className="text-sm">{asset.siteName || "—"}</p>
					</div>

					<div className="space-y-1">
						<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
							<MapPin className="h-3 w-3" />
							Location
						</div>
						<p className="text-sm">{asset.locationDescription || "—"}</p>
					</div>

					<div className="space-y-1">
						<div className="text-xs text-muted-foreground">Client</div>
						<p className="text-sm">{asset.client || "—"}</p>
					</div>

					<div className="space-y-1">
						<div className="text-xs text-muted-foreground">Channel</div>
						<p className="text-sm">{asset.channel || "—"}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
