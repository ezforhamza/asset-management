import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, Loader2, MapPin, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import assetService, { type RegistrationHistoryItem, type VerificationHistoryItem } from "@/api/services/assetService";
import { CorrectGpsModal } from "@/components/correct-gps-modal";
import { AssetSummary, RegistrationEvent, VerificationCard } from "@/pages/assets/history/components";
import { Button } from "@/ui/button";

export default function SuperUserAssetDetailPage() {
	const { companyId, assetId } = useParams<{ companyId: string; assetId: string }>();
	const navigate = useNavigate();
	const [gpsModalOpen, setGpsModalOpen] = useState(false);

	const { data: historyData, isLoading } = useQuery({
		queryKey: ["super-user", "asset-history", assetId],
		queryFn: () => assetService.getAssetHistory(assetId ?? ""),
		enabled: !!assetId,
	});

	const asset = historyData?.asset;
	const companyName = (asset as (typeof asset & { companyName?: string }) | undefined)?.companyName;

	const currentRegistration = useMemo<RegistrationHistoryItem | null>(() => {
		if (!historyData?.registrationHistory || !historyData.asset.qrCode) return null;
		const currentQrCode =
			typeof historyData.asset.qrCode === "string"
				? historyData.asset.qrCode
				: (historyData.asset.qrCode as { code: string })?.code;
		if (!currentQrCode) return null;
		const matching = historyData.registrationHistory.filter((reg) => reg.qrCode?.code === currentQrCode);
		if (matching.length === 0) return null;
		return matching.reduce((latest, current) =>
			new Date(current.timestamp).getTime() > new Date(latest.timestamp).getTime() ? current : latest,
		);
	}, [historyData?.registrationHistory, historyData?.asset.qrCode]);

	const filteredVerifications = useMemo<VerificationHistoryItem[]>(() => {
		if (!historyData?.verificationHistory) return [];
		const registrationTime = new Date(historyData.asset.registeredAt ?? 0).getTime();
		const registrationTimeIsValid = !Number.isNaN(registrationTime) && registrationTime > 0;
		return [...historyData.verificationHistory]
			.filter((v) => {
				if (!registrationTimeIsValid) return true;
				const verifiedTime = new Date(v.verifiedAt).getTime();
				if (Number.isNaN(verifiedTime) || verifiedTime === 0) return true;
				return verifiedTime >= registrationTime;
			})
			.sort((a, b) => new Date(a.verifiedAt).getTime() - new Date(b.verifiedAt).getTime());
	}, [historyData?.verificationHistory, historyData?.asset.registeredAt]);

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

	if (!asset) {
		return (
			<div className="flex items-center justify-center h-full">
				<p className="text-muted-foreground">Asset not found.</p>
			</div>
		);
	}

	const isRegistered =
		asset.registrationState === "fully_registered" || asset.registrationState === "partially_registered";

	return (
		<div className="min-h-full flex flex-col">
			{/* Header */}
			<div className="flex-shrink-0 px-6 py-4 border-b bg-background sticky top-0 z-10">
				<nav className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
					<button
						type="button"
						onClick={() => navigate("/super-user/dashboard")}
						className="hover:text-foreground transition-colors"
					>
						Support Portal
					</button>
					{" > "}
					<button
						type="button"
						onClick={() => navigate(`/super-user/companies/${companyId}/assets`)}
						className="hover:text-foreground transition-colors"
					>
						{companyName || "Company"}
					</button>
					{" > "}
					<span className="text-foreground">{asset.serialNumber}</span>
				</nav>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
							<ArrowLeft className="h-5 w-5" />
						</Button>
						<div>
							<h1 className="text-xl font-semibold">Asset Verification History</h1>
							<p className="text-sm text-muted-foreground">
								{asset.serialNumber} • {asset.make} {asset.model}
								{asset.siteName ? ` • ${asset.siteName}` : ""}
							</p>
						</div>
					</div>
					{asset.location?.latitude != null && (
						<Button variant="outline" size="sm" onClick={() => setGpsModalOpen(true)}>
							<MapPin className="h-4 w-4 mr-2" />
							Correct GPS
						</Button>
					)}
				</div>
			</div>

			{/* Asset Summary */}
			<div className="flex-shrink-0 px-6 pt-4">
				<AssetSummary asset={asset} />
			</div>

			{/* Timeline */}
			<div className="flex-1 px-6 py-6 space-y-6">
				{isRegistered ? (
					<>
						<section>
							<div className="flex items-center gap-2 mb-4">
								<ShieldCheck
									className={`h-5 w-5 ${currentRegistration ? "text-green-600" : "text-muted-foreground"}`}
								/>
								<h2 className={`font-semibold ${!currentRegistration ? "text-muted-foreground" : ""}`}>Registration</h2>
							</div>
							{currentRegistration ? (
								<RegistrationEvent registration={currentRegistration} assetId={assetId} showMapLink={false} />
							) : (
								<div className="pl-8 py-4 text-sm text-muted-foreground border rounded-lg bg-muted/30">
									No registration recorded for this asset.
								</div>
							)}
						</section>

						<section>
							<div className="flex items-center gap-2 mb-4">
								<Clock className="h-5 w-5 text-blue-600" />
								<h2 className="font-semibold">Verification History</h2>
								{filteredVerifications.length > 0 && (
									<span className="text-sm text-muted-foreground">
										({filteredVerifications.length} verification{filteredVerifications.length !== 1 ? "s" : ""})
									</span>
								)}
							</div>
							{filteredVerifications.length === 0 ? (
								<div className="pl-8 py-8 text-center text-sm text-muted-foreground border rounded-lg bg-muted/30">
									<ShieldCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
									<p>No verifications recorded yet</p>
									<p className="text-xs mt-1">Verifications will appear here once field workers verify this asset.</p>
								</div>
							) : (
								<div className="space-y-4">
									{filteredVerifications.map((verification, index) => (
										<VerificationCard
											key={verification.id}
											verification={verification}
											index={index}
											showMapLink={false}
										/>
									))}
								</div>
							)}
						</section>
					</>
				) : (
					<section>
						<div className="flex flex-col items-center justify-center py-12 px-6 border rounded-lg bg-muted/30">
							<ShieldCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
							<h3 className="font-semibold text-lg mb-2">Asset Not Registered</h3>
							<p className="text-sm text-muted-foreground text-center max-w-md">
								Registration and verification history will appear here once the asset is registered.
							</p>
						</div>
					</section>
				)}
				<div className="h-8" />
			</div>

			<CorrectGpsModal
				asset={asset}
				open={gpsModalOpen}
				onClose={() => setGpsModalOpen(false)}
				queryKeysToInvalidate={[["super-user", "asset-history", assetId]]}
			/>
		</div>
	);
}
