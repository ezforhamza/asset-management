import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, FileText, History, Info, Loader2, MapPin, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import assetService, { type RegistrationHistoryItem, type VerificationHistoryItem } from "@/api/services/assetService";
import { Button } from "@/ui/button";
import { AssetSummary, RegistrationEvent, VerificationCard } from "./components";

export default function AssetHistoryPage() {
	const { assetId } = useParams<{ assetId: string }>();
	const navigate = useNavigate();
	const location = useLocation();

	// Check if user came from reports page or map page
	const fromReports = location.state?.fromReports === true;
	const fromMap = location.state?.fromMap === true;
	const highlightLatest = location.state?.highlightLatest === true;

	// Track which verification or registration should be highlighted
	const [highlightedVerificationId, setHighlightedVerificationId] = useState<string | null>(null);
	const [highlightRegistration, setHighlightRegistration] = useState(false);

	// Ref for scrolling to the highlighted card
	const highlightedCardRef = useRef<HTMLDivElement>(null);

	const {
		data: historyData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["asset-history", assetId],
		queryFn: () => assetService.getAssetHistory(assetId!),
		enabled: !!assetId,
	});

	// Set highlighted verification ID when data loads (highlight latest if coming from reports or map)
	useEffect(() => {
		// Check if coming from map and should highlight registration
		if (fromMap && location.state?.highlightRegistration) {
			setHighlightRegistration(true);
			return;
		}

		if (historyData?.verificationHistory && historyData.verificationHistory.length > 0) {
			if (highlightLatest || fromMap) {
				// Highlight the most recent verification (last in the sorted array since we sort ascending)
				const sortedVerifications = [...historyData.verificationHistory].sort(
					(a, b) => new Date(b.verifiedAt).getTime() - new Date(a.verifiedAt).getTime(),
				);
				setHighlightedVerificationId(sortedVerifications[0].id);
			} else if (location.hash.startsWith("#verification-")) {
				// Highlight specific verification from URL hash
				setHighlightedVerificationId(location.hash.replace("#verification-", ""));
			}
		}
	}, [historyData, highlightLatest, fromMap, location.hash, location.state?.highlightRegistration]);

	// Scroll to highlighted verification card after it's set
	useEffect(() => {
		if (highlightedVerificationId && highlightedCardRef.current) {
			const timeout = setTimeout(() => {
				highlightedCardRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "center",
				});
			}, 150);
			return () => clearTimeout(timeout);
		}
	}, [highlightedVerificationId]);

	// Clear highlight after 2.5 seconds
	useEffect(() => {
		if (highlightedVerificationId) {
			const timeout = setTimeout(() => {
				setHighlightedVerificationId(null);
			}, 2500);
			return () => clearTimeout(timeout);
		}
	}, [highlightedVerificationId]);

	// Clear registration highlight after 2.5 seconds
	useEffect(() => {
		if (highlightRegistration) {
			const timeout = setTimeout(() => {
				setHighlightRegistration(false);
			}, 2500);
			return () => clearTimeout(timeout);
		}
	}, [highlightRegistration]);

	// Get the current registration that matches the asset's current QR code and is the latest
	const currentRegistration = useMemo<RegistrationHistoryItem | null>(() => {
		if (!historyData?.registrationHistory || !historyData.asset.qrCode) return null;

		// asset.qrCode is a string (e.g., "QR-TC-019")
		const currentQrCode =
			typeof historyData.asset.qrCode === "string"
				? historyData.asset.qrCode
				: (historyData.asset.qrCode as { code: string })?.code;

		if (!currentQrCode) return null;

		// Filter registrations that match the current asset's QR code
		const matchingRegistrations = historyData.registrationHistory.filter((reg) => reg.qrCode?.code === currentQrCode);

		if (matchingRegistrations.length === 0) return null;

		// Get the latest registration by timestamp
		return matchingRegistrations.reduce((latest, current) =>
			new Date(current.timestamp).getTime() > new Date(latest.timestamp).getTime() ? current : latest,
		);
	}, [historyData?.registrationHistory, historyData?.asset.qrCode]);

	// Filter verifications to only show those after the current registration timestamp
	// Sort by verifiedAt ascending (oldest first) to follow chronological timeline order
	const filteredVerifications = useMemo<VerificationHistoryItem[]>(() => {
		if (!historyData?.verificationHistory || !currentRegistration) return [];

		const registrationTime = new Date(currentRegistration.timestamp).getTime();

		// Only include verifications that occurred AFTER the registration
		// Sort ascending (oldest first) to follow timeline: Registration -> Verification #1 -> #2 -> #3...
		return [...historyData.verificationHistory]
			.filter((v) => new Date(v.verifiedAt).getTime() > registrationTime)
			.sort((a, b) => new Date(a.verifiedAt).getTime() - new Date(b.verifiedAt).getTime());
	}, [historyData?.verificationHistory, currentRegistration]);

	if (isLoading) {
		return (
			<div className="h-full flex items-center justify-center">
				<div className="flex flex-col items-center gap-3">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-sm text-muted-foreground">Loading asset history...</p>
				</div>
			</div>
		);
	}

	if (error || !historyData) {
		return (
			<div className="h-full flex items-center justify-center">
				<div className="flex flex-col items-center gap-4 text-center">
					<div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
						<History className="h-6 w-6 text-destructive" />
					</div>
					<div>
						<h2 className="font-semibold">Failed to load asset history</h2>
						<p className="text-sm text-muted-foreground mt-1">
							{error instanceof Error ? error.message : "An unexpected error occurred"}
						</p>
					</div>
					<Button variant="outline" onClick={() => navigate("/assets")}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Assets
					</Button>
				</div>
			</div>
		);
	}

	const { asset } = historyData;

	// Determine if history should be shown based on registrationState
	const isRegistered =
		asset.registrationState === "fully_registered" || asset.registrationState === "partially_registered";

	return (
		<div className="min-h-full flex flex-col">
			{/* Header - solid background so content scrolls under */}
			<div className="flex-shrink-0 px-6 py-4 border-b bg-background sticky top-0 z-10">
				<div className="flex items-center justify-between w-full">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="icon" onClick={() => navigate("/assets")}>
							<ArrowLeft className="h-5 w-5" />
						</Button>
						<div>
							<h1 className="text-xl font-semibold flex items-center gap-2">
								<History className="h-5 w-5" />
								Asset Verification History
							</h1>
							<p className="text-sm text-muted-foreground">
								{asset.serialNumber} • {asset.make} {asset.model}
							</p>
						</div>
					</div>
					{fromReports && (
						<Button variant="outline" size="sm" onClick={() => navigate("/reports")} className="flex-shrink-0">
							<FileText className="h-4 w-4 mr-2" />
							Back to Reports
						</Button>
					)}
					{fromMap && (
						<Button variant="outline" size="sm" onClick={() => navigate("/map")} className="flex-shrink-0">
							<MapPin className="h-4 w-4 mr-2" />
							Back to Map
						</Button>
					)}
				</div>
			</div>

			{/* Asset Summary */}
			<div className="flex-shrink-0 px-6 pt-4">
				<AssetSummary asset={asset} />
			</div>

			{/* Timeline Content - naturally scrollable */}
			<div className="flex-1 px-6 py-6 space-y-6">
				{/* Conditional rendering based on registrationState */}
				{isRegistered ? (
					<>
						{/* Registration Section - Shows ONE registration matching current QR code */}
						<section>
							<div className="flex items-center gap-2 mb-4">
								<ShieldCheck
									className={`h-5 w-5 ${currentRegistration ? "text-green-600" : "text-muted-foreground"}`}
								/>
								<h2 className={`font-semibold ${!currentRegistration ? "text-muted-foreground" : ""}`}>Registration</h2>
							</div>
							{currentRegistration ? (
								<RegistrationEvent
									registration={currentRegistration}
									assetId={assetId}
									isHighlighted={highlightRegistration}
								/>
							) : (
								<div className="pl-8 py-4 text-sm text-muted-foreground border rounded-lg bg-muted/30">
									No registration recorded for this asset.
								</div>
							)}
						</section>

						{/* Verification History Section - Only verifications after current registration */}
						<section>
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-2">
									<Clock className="h-5 w-5 text-blue-600" />
									<h2 className="font-semibold">Verification History</h2>
									{filteredVerifications.length > 0 && (
										<span className="text-sm text-muted-foreground">
											({filteredVerifications.length} verification{filteredVerifications.length !== 1 ? "s" : ""})
										</span>
									)}
								</div>
							</div>

							{filteredVerifications.length === 0 ? (
								<div className="pl-8 py-8 text-center text-sm text-muted-foreground border rounded-lg bg-muted/30">
									<ShieldCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
									<p>No verifications recorded yet</p>
									<p className="text-xs mt-1">Verifications will appear here once field workers verify this asset.</p>
								</div>
							) : (
								<div className="space-y-4">
									{filteredVerifications.map((verification, index) => {
										const isHighlighted = verification.id === highlightedVerificationId;
										return (
											<div key={verification.id} ref={isHighlighted ? highlightedCardRef : undefined}>
												<VerificationCard verification={verification} index={index} isHighlighted={isHighlighted} />
											</div>
										);
									})}
								</div>
							)}
						</section>
					</>
				) : (
					/* Unregistered state - show info message instead of history */
					<section>
						<div className="flex flex-col items-center justify-center py-12 px-6 border rounded-lg bg-muted/30">
							<div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center mb-4">
								<Info className="h-6 w-6 text-blue-600" />
							</div>
							<h3 className="font-semibold text-lg mb-2">Asset Not Registered</h3>
							<p className="text-sm text-muted-foreground text-center max-w-md">
								This asset is currently unregistered. Registration and verification history will appear here once the
								asset is registered with a QR code.
							</p>
						</div>
					</section>
				)}

				{/* Bottom padding for scroll */}
				<div className="h-8" />
			</div>
		</div>
	);
}
