import { format } from "date-fns";
import {
	AlertTriangle,
	Camera,
	Car,
	CheckCircle2,
	Clock,
	Flag,
	MapPin,
	MapPinOff,
	RefreshCw,
	Search,
	XCircle,
} from "lucide-react";
import type { Verification } from "@/api/services/verificationService";
import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader } from "@/ui/card";

interface VerificationCardProps {
	verification: Verification;
}

const getResultBadge = (result: string) => {
	switch (result) {
		case "passed":
			return (
				<Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
					<CheckCircle2 className="h-3 w-3 mr-1" />
					Passed
				</Badge>
			);
		case "passed_with_flags":
			return (
				<Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
					<Flag className="h-3 w-3 mr-1" />
					Passed with Flags
				</Badge>
			);
		case "failed":
			return (
				<Badge className="bg-red-500/10 text-red-500 border-red-500/20">
					<XCircle className="h-3 w-3 mr-1" />
					Failed
				</Badge>
			);
		case "pending_admin_review":
			return (
				<Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">
					<Clock className="h-3 w-3 mr-1" />
					Pending Review
				</Badge>
			);
		case "investigation_required":
			return (
				<Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">
					<Search className="h-3 w-3 mr-1" />
					Investigation Required
				</Badge>
			);
		default:
			return <Badge variant="secondary">{result}</Badge>;
	}
};

const getConditionBadge = (condition: string) => {
	switch (condition) {
		case "good":
			return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Good</Badge>;
		case "fair":
			return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Fair</Badge>;
		case "poor":
			return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Poor</Badge>;
		default:
			return <Badge variant="secondary">Unknown</Badge>;
	}
};

export function VerificationCard({ verification }: VerificationCardProps) {
	const asset = verification.assetId;
	const hasAsset = asset !== null;

	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between gap-4">
					<div className="flex items-center gap-3">
						{/* Asset Photo or Placeholder */}
						{hasAsset && asset.photos?.[0] ? (
							<img
								src={asset.photos[0]}
								alt={`${asset.make} ${asset.model}`}
								className="h-14 w-14 rounded-lg object-cover"
							/>
						) : (
							<div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center">
								<Car className="h-6 w-6 text-muted-foreground" />
							</div>
						)}
						<div>
							{hasAsset ? (
								<>
									<h4 className="font-semibold">
										{asset.make} {asset.model}
									</h4>
									<p className="text-sm text-muted-foreground">SN: {asset.serialNumber}</p>
								</>
							) : (
								<>
									<h4 className="font-semibold text-muted-foreground">Asset Deleted</h4>
									<p className="text-sm text-muted-foreground">Asset no longer exists</p>
								</>
							)}
						</div>
					</div>
					{getResultBadge(verification.verificationResult)}
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Verification Info */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
					{/* Verified At */}
					<div>
						<p className="text-muted-foreground">Verified At</p>
						<p className="font-medium">{format(new Date(verification.verifiedAt), "MMM d, yyyy h:mm a")}</p>
					</div>

					{/* GPS Status */}
					<div>
						<p className="text-muted-foreground">GPS Check</p>
						<div className="flex items-center gap-1">
							{verification.gpsCheckPassed ? (
								<>
									<MapPin className="h-4 w-4 text-emerald-500" />
									<span className="font-medium text-emerald-600">Passed</span>
								</>
							) : (
								<>
									<MapPinOff className="h-4 w-4 text-red-500" />
									<span className="font-medium text-red-600">Failed</span>
								</>
							)}
						</div>
					</div>

					{/* Distance */}
					<div>
						<p className="text-muted-foreground">Distance</p>
						<p className="font-medium">{verification.distanceFromAsset.toFixed(1)}m</p>
					</div>

					{/* Condition */}
					<div>
						<p className="text-muted-foreground">Condition</p>
						{getConditionBadge(verification.checklist.conditionStatus)}
					</div>
				</div>

				{/* Additional Info Row */}
				<div className="flex flex-wrap items-center gap-3 pt-2 border-t">
					{/* Photos Count */}
					<div className="flex items-center gap-1 text-sm text-muted-foreground">
						<Camera className="h-4 w-4" />
						<span>{verification.photos?.length || 0} photos</span>
					</div>

					{/* GPS Override */}
					{verification.gpsOverrideUsed && (
						<Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
							<RefreshCw className="h-3 w-3 mr-1" />
							GPS Override
						</Badge>
					)}

					{/* Repair Needed */}
					{verification.repairNeeded && (
						<Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
							<AlertTriangle className="h-3 w-3 mr-1" />
							Repair Needed
						</Badge>
					)}

					{/* Investigation Status */}
					{verification.investigationStatus === "open" && (
						<Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
							<Search className="h-3 w-3 mr-1" />
							Under Investigation
						</Badge>
					)}

					{/* Flags */}
					{verification.flags?.length > 0 && (
						<div className="flex items-center gap-1">
							<Flag className="h-3 w-3 text-muted-foreground" />
							<span className="text-xs text-muted-foreground">{verification.flags.length} flags</span>
						</div>
					)}
				</div>

				{/* Condition Explanation */}
				{verification.checklist.conditionExplanation && (
					<div className="pt-2 border-t">
						<p className="text-sm text-muted-foreground">Notes</p>
						<p className="text-sm">{verification.checklist.conditionExplanation}</p>
					</div>
				)}

				{/* Asset Location Info */}
				{hasAsset && (asset.siteName || asset.client || asset.channel) && (
					<div className="pt-2 border-t grid grid-cols-3 gap-2 text-sm">
						{asset.siteName && (
							<div>
								<p className="text-muted-foreground">Site</p>
								<p className="font-medium">{asset.siteName}</p>
							</div>
						)}
						{asset.client && (
							<div>
								<p className="text-muted-foreground">Client</p>
								<p className="font-medium">{asset.client}</p>
							</div>
						)}
						{asset.channel && (
							<div>
								<p className="text-muted-foreground">Channel</p>
								<p className="font-medium">{asset.channel}</p>
							</div>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export default VerificationCard;
