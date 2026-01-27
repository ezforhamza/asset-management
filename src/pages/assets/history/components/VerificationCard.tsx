import { format } from "date-fns";
import {
	AlertTriangle,
	Calendar,
	CheckCircle2,
	ChevronDown,
	ChevronUp,
	MapPin,
	Ruler,
	Shield,
	User,
	Wrench,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import type { VerificationHistoryItem } from "@/api/services/assetService";
import { Card, CardContent } from "@/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/ui/collapsible";
import { StyledBadge } from "@/utils/badge-styles";
import { formatLabel } from "@/utils/formatLabel";
import { PhotoGallery } from "./PhotoGallery";

interface VerificationCardProps {
	verification: VerificationHistoryItem;
	index: number;
	isHighlighted?: boolean;
}

export function VerificationCard({ verification, index, isHighlighted = false }: VerificationCardProps) {
	const [isOpen, setIsOpen] = useState(isHighlighted); // Auto-expand if highlighted

	const formatDate = (dateStr: string) => {
		try {
			return format(new Date(dateStr), "MMM d, yyyy 'at' h:mm a");
		} catch {
			return dateStr;
		}
	};

	const getConditionBadge = (status: string) => {
		switch (status) {
			case "good":
				return <StyledBadge color="emerald">Good</StyledBadge>;
			case "fair":
				return <StyledBadge color="yellow">Fair</StyledBadge>;
			case "poor":
				return <StyledBadge color="orange">Poor</StyledBadge>;
			case "damaged":
				return <StyledBadge color="red">Damaged</StyledBadge>;
			default:
				return <StyledBadge color="gray">{formatLabel(status)}</StyledBadge>;
		}
	};

	const getOperationalBadge = (status: string) => {
		switch (status) {
			case "operational":
				return <StyledBadge color="emerald">Operational</StyledBadge>;
			case "non_operational":
				return <StyledBadge color="red">Non-Operational</StyledBadge>;
			case "needs_repair":
				return <StyledBadge color="orange">Needs Repair</StyledBadge>;
			default:
				return <StyledBadge color="gray">{formatLabel(status)}</StyledBadge>;
		}
	};

	return (
		<div className="relative pl-8">
			{/* Timeline connector */}
			<div className="absolute left-3 top-0 bottom-0 w-px bg-border" />

			{/* Timeline dot */}
			<div
				className={`absolute left-0 top-6 w-6 h-6 rounded-full flex items-center justify-center ${
					verification.gpsCheckPassed ? "bg-blue-500" : "bg-orange-500"
				}`}
			>
				<Shield className="h-3.5 w-3.5 text-white" />
			</div>

			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				<Card
					className={`transition-all duration-300 ${isHighlighted ? "relative" : ""}`}
					style={
						isHighlighted
							? {
									border: "3px solid #f97316",
									boxShadow: "0 0 0 4px rgba(249, 115, 22, 0.3), 0 0 20px rgba(249, 115, 22, 0.4)",
									background: "linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(249, 115, 22, 0.02) 100%)",
									animation: "pulse-highlight-strong 1.5s ease-in-out 3",
								}
							: undefined
					}
				>
					{/* Collapsed Summary - Always visible */}
					<CollapsibleTrigger asChild>
						<button
							type="button"
							className="w-full text-left p-4 hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
						>
							<div className="flex items-start justify-between gap-4">
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 flex-wrap">
										<h4 className="font-medium">Verification #{index + 1}</h4>
										<span className="text-sm text-muted-foreground">{formatDate(verification.verifiedAt)}</span>
									</div>

									{/* Summary badges row */}
									<div className="flex items-center gap-2 mt-2 flex-wrap">
										{/* GPS Status */}
										{verification.gpsCheckPassed ? (
											<StyledBadge color="emerald">
												<CheckCircle2 className="h-3 w-3 mr-1" />
												GPS Passed
											</StyledBadge>
										) : (
											<StyledBadge color="red">
												<XCircle className="h-3 w-3 mr-1" />
												GPS Failed
											</StyledBadge>
										)}

										{/* Verification Status */}
										{verification.verificationStatus && (
											<StyledBadge
												color={
													verification.verificationStatus === "verified"
														? "emerald"
														: verification.verificationStatus === "failed"
															? "red"
															: "gray"
												}
											>
												{verification.verificationStatus.charAt(0).toUpperCase() +
													verification.verificationStatus.slice(1)}
											</StyledBadge>
										)}

										{/* Condition */}
										{verification.assetCondition && getConditionBadge(verification.assetCondition)}

										{/* Operational */}
										{verification.operationalStatus && getOperationalBadge(verification.operationalStatus)}

										{/* Repair Needed */}
										{verification.repairNeeded && (
											<StyledBadge color="orange">
												<Wrench className="h-3 w-3 mr-1" />
												Repair Needed
											</StyledBadge>
										)}
									</div>

									{/* Verified by */}
									<div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
										<User className="h-3.5 w-3.5" />
										<span>{verification.verifiedBy?.name || "Unknown"}</span>
										<StyledBadge color="blue">Field Worker</StyledBadge>
									</div>
								</div>

								{/* Expand/Collapse indicator */}
								<div className="flex-shrink-0 text-muted-foreground">
									{isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
								</div>
							</div>
						</button>
					</CollapsibleTrigger>

					{/* Expanded Content */}
					<CollapsibleContent>
						<CardContent className="pt-0 border-t">
							<div className="space-y-4 pt-4">
								{/* GPS Details */}
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="space-y-1">
										<p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
											<MapPin className="h-3 w-3" />
											Verification Location
										</p>
										{verification.verifiedAtLocation ? (
											<div className="flex items-center gap-2">
												<p className="text-sm font-mono">
													{verification.verifiedAtLocation.latitude.toFixed(6)},{" "}
													{verification.verifiedAtLocation.longitude.toFixed(6)}
												</p>
												<Link
													to={`/map?lat=${verification.verifiedAtLocation.latitude}&lng=${verification.verifiedAtLocation.longitude}&highlight=${verification.id}`}
													state={{ fromVerification: true, assetId: verification.id }}
													className="text-primary hover:underline inline-flex items-center gap-1 text-xs"
												>
													<MapPin className="h-3 w-3" />
													View on Map
												</Link>
											</div>
										) : (
											<p className="text-sm text-muted-foreground">Location not available</p>
										)}
										{verification.locationAccuracy && (
											<p className="text-xs text-muted-foreground">Accuracy: ±{verification.locationAccuracy}m</p>
										)}
									</div>
									<div className="space-y-1">
										<p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
											<Ruler className="h-3 w-3" />
											Distance vs Geofence
										</p>
										<p className="text-sm">
											{verification.distance != null ? `${verification.distance.toFixed(1)}m` : "—"}
											{verification.geofenceThreshold != null && (
												<span className="text-muted-foreground"> / {verification.geofenceThreshold}m threshold</span>
											)}
										</p>
										{!verification.gpsCheckPassed && (
											<p className="text-xs text-orange-600 inline-flex items-center gap-1">
												<AlertTriangle className="h-3 w-3" />
												Outside geofence threshold
											</p>
										)}
									</div>
								</div>

								{/* Condition & Status Details */}
								<div className="space-y-2">
									<p className="text-xs font-medium text-muted-foreground">Condition & Status</p>
									<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-muted/50 rounded-lg">
										<div>
											<p className="text-xs text-muted-foreground">Asset Condition</p>
											<p className="text-sm font-medium capitalize">{formatLabel(verification.assetCondition)}</p>
										</div>
										<div>
											<p className="text-xs text-muted-foreground">Operational Status</p>
											<p className="text-sm font-medium capitalize">{formatLabel(verification.operationalStatus)}</p>
										</div>
										<div>
											<p className="text-xs text-muted-foreground">Repair Needed</p>
											<p className="text-sm font-medium">{verification.repairNeeded ? "Yes" : "No"}</p>
										</div>
										<div>
											<p className="text-xs text-muted-foreground">Verified By</p>
											<p className="text-sm font-medium">{verification.verifiedBy?.name || "Unknown"}</p>
											{verification.verifiedBy?.email && (
												<p className="text-xs text-muted-foreground">{verification.verifiedBy.email}</p>
											)}
										</div>
									</div>
								</div>

								{/* Next Verification Due */}
								{verification.nextVerificationDue && (
									<div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
										<Calendar className="h-4 w-4 text-blue-600" />
										<div>
											<p className="text-sm font-medium">
												Next Verification Due: {formatDate(verification.nextVerificationDue)}
											</p>
											{verification.daysUntilNextVerification != null && (
												<p className="text-xs text-muted-foreground">
													{verification.daysUntilNextVerification > 0
														? `${verification.daysUntilNextVerification} days remaining`
														: verification.daysUntilNextVerification === 0
															? "Due today"
															: `${Math.abs(verification.daysUntilNextVerification)} days overdue`}
												</p>
											)}
										</div>
									</div>
								)}

								{/* Condition Explanation */}
								{verification.checklist?.conditionExplanation && (
									<div className="space-y-1">
										<p className="text-xs font-medium text-muted-foreground">Condition Explanation</p>
										<p className="text-sm p-3 bg-muted/50 rounded-lg">{verification.checklist.conditionExplanation}</p>
									</div>
								)}

								{/* Additional Notes */}
								{verification.notes && (
									<div className="space-y-1">
										<p className="text-xs font-medium text-muted-foreground">Notes</p>
										<p className="text-sm">{verification.notes}</p>
									</div>
								)}

								{/* Photos - always render with empty state handling */}
								<PhotoGallery photos={verification.photos} title="Verification Captures" />
							</div>
						</CardContent>
					</CollapsibleContent>
				</Card>
			</Collapsible>
		</div>
	);
}
