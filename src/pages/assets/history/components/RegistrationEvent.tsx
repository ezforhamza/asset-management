import { format } from "date-fns";
import { ChevronDown, ChevronUp, ClipboardCheck, MapPin, QrCode, Tag, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import type { RegistrationHistoryItem } from "@/api/services/assetService";
import { Card, CardContent } from "@/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/ui/collapsible";
import { StyledBadge } from "@/utils/badge-styles";
import { PhotoGallery } from "./PhotoGallery";

interface RegistrationEventProps {
	registration: RegistrationHistoryItem;
	assetId?: string;
	isHighlighted?: boolean;
}

export function RegistrationEvent({ registration, assetId, isHighlighted = false }: RegistrationEventProps) {
	const [isOpen, setIsOpen] = useState(isHighlighted); // Auto-expand if highlighted

	const formatDate = (dateStr: string) => {
		try {
			return format(new Date(dateStr), "MMM d, yyyy 'at' h:mm a");
		} catch {
			return dateStr;
		}
	};

	const getRoleLabel = (role: string) => {
		switch (role) {
			case "field_user":
				return "Field Worker";
			case "customer_admin":
				return "Customer Admin";
			case "system_admin":
				return "System Admin";
			default:
				return role;
		}
	};

	const hasPhotos = registration.photos.length > 0;
	const hasLocation = registration.location;
	const hasNotes = registration.notes;

	return (
		<div className="relative pl-8">
			{/* Timeline connector */}
			<div className="absolute left-3 top-0 bottom-0 w-px bg-border" />

			{/* Timeline dot */}
			<div className="absolute left-0 top-6 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
				<ClipboardCheck className="h-3.5 w-3.5 text-white" />
			</div>

			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				<Card
					className={`transition-all duration-300 border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20 ${isHighlighted ? "relative" : ""}`}
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
							className="w-full text-left p-4 hover:bg-green-100/50 dark:hover:bg-green-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset cursor-pointer"
						>
							<div className="flex items-start justify-between gap-4">
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 flex-wrap">
										<h4 className="font-medium">Asset Registered</h4>
										<StyledBadge color="emerald">Registration</StyledBadge>
									</div>
									<p className="text-sm text-muted-foreground mt-1">{formatDate(registration.timestamp)}</p>

									{/* Performed By */}
									<div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
										<User className="h-3.5 w-3.5" />
										<span>{registration.performedBy.name}</span>
										<StyledBadge color="blue">
											{getRoleLabel(registration.performedBy.role) || "Field Worker"}
										</StyledBadge>
									</div>

									{/* Quick indicators */}
									<div className="flex items-center gap-2 mt-2 flex-wrap">
										{hasPhotos && (
											<StyledBadge color="gray">
												{registration.photos.length} photo{registration.photos.length !== 1 ? "s" : ""}
											</StyledBadge>
										)}
										{hasLocation && (
											<StyledBadge color="gray">
												<MapPin className="h-3 w-3 mr-1" />
												GPS
											</StyledBadge>
										)}
										{registration.category && (
											<StyledBadge color="gray">
												<Tag className="h-3 w-3 mr-1" />
												{registration.category.name}
											</StyledBadge>
										)}
									</div>
								</div>

								{/* Expand/Collapse indicator - always show */}
								<div className="flex-shrink-0 text-muted-foreground">
									{isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
								</div>
							</div>
						</button>
					</CollapsibleTrigger>

					{/* Expanded Content - always render with fallbacks like VerificationCard */}
					<CollapsibleContent>
						<CardContent className="pt-0 border-t border-green-200 dark:border-green-900">
							<div className="space-y-4 pt-4">
								{/* Registration Details Grid */}
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="space-y-1">
										<p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
											<MapPin className="h-3 w-3" />
											Registration Location
										</p>
										{hasLocation ? (
											<div className="flex items-center gap-2">
												<p className="text-sm font-mono">
													{registration.location?.latitude.toFixed(6)}, {registration.location?.longitude.toFixed(6)}
												</p>
												{registration.location && (
													<Link
														to={`/map?lat=${registration.location.latitude}&lng=${registration.location.longitude}&assetId=${assetId}`}
														state={{ fromRegistration: true, assetId }}
														className="text-primary hover:underline inline-flex items-center gap-1 text-xs"
													>
														<MapPin className="h-3 w-3" />
														View on Map
													</Link>
												)}
											</div>
										) : (
											<p className="text-sm text-muted-foreground">Location not available</p>
										)}
										{registration.locationAccuracy && (
											<p className="text-xs text-muted-foreground">Accuracy: ±{registration.locationAccuracy}m</p>
										)}
									</div>
									<div className="space-y-1">
										<p className="text-xs font-medium text-muted-foreground">Registered By</p>
										<p className="text-sm">{registration.performedBy.name}</p>
										<p className="text-xs text-muted-foreground">{registration.performedBy.email}</p>
									</div>
								</div>

								{/* Additional Details Grid */}
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-muted/50 rounded-lg">
									<div>
										<p className="text-xs text-muted-foreground">Category</p>
										<p className="text-sm font-medium">{registration.category?.name || "—"}</p>
									</div>
									<div>
										<p className="text-xs text-muted-foreground">Condition</p>
										<p className="text-sm font-medium capitalize">
											{registration.conditionAtRegistration?.replace(/_/g, " ") || "—"}
										</p>
									</div>
									{registration.qrCode && (
										<>
											<div>
												<p className="text-xs text-muted-foreground flex items-center gap-1">
													<QrCode className="h-3 w-3" />
													QR Code
												</p>
												<p className="text-sm font-mono">{registration.qrCode.code}</p>
											</div>
											<div>
												<p className="text-xs text-muted-foreground">QR Status</p>
												<p className="text-sm font-medium capitalize">{registration.qrCode.status}</p>
											</div>
										</>
									)}
								</div>

								{/* Notes section */}
								<div className="space-y-1">
									<p className="text-xs font-medium text-muted-foreground">Notes</p>
									<p className="text-sm">{hasNotes ? registration.notes : "No notes recorded"}</p>
								</div>

								{/* Photos section - always render with empty state handling */}
								<PhotoGallery photos={registration.photos} title="Registration Captures" />
							</div>
						</CardContent>
					</CollapsibleContent>
				</Card>
			</Collapsible>
		</div>
	);
}
