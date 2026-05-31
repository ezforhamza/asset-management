import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, MapPin } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import type { Asset } from "#/entity";
import assetService, { type RegistrationHistoryItem, type VerificationHistoryItem } from "@/api/services/assetService";
import { CorrectGpsModal } from "@/components/correct-gps-modal";
import { Button } from "@/ui/button";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { getAssetStatusBadge, getVerificationStatusBadge, StyledBadge } from "@/utils/badge-styles";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div className="flex flex-col sm:flex-row sm:items-start gap-1 py-2 border-b last:border-0">
			<span className="text-sm text-muted-foreground sm:w-48 shrink-0">{label}</span>
			<span className="text-sm">{value ?? "—"}</span>
		</div>
	);
}

export default function SuperUserAssetDetailPage() {
	const { companyId, assetId } = useParams<{ companyId: string; assetId: string }>();
	const navigate = useNavigate();
	const [gpsModalOpen, setGpsModalOpen] = useState(false);

	const { data: historyData, isLoading } = useQuery({
		queryKey: ["super-user", "asset-history", assetId],
		queryFn: () => assetService.getAssetHistory(assetId ?? ""),
		enabled: !!assetId,
	});

	const asset = historyData?.asset as Asset | undefined;
	const registrations: RegistrationHistoryItem[] = historyData?.registrationHistory || [];
	const verifications: VerificationHistoryItem[] = historyData?.verificationHistory || [];

	const companyName = (asset as (Asset & { companyName?: string }) | undefined)?.companyName;

	if (isLoading) {
		return (
			<div className="p-6 space-y-4">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-48 w-full" />
				<Skeleton className="h-64 w-full" />
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

	const allEvents = [
		...registrations.map((r) => ({ ...r, _type: "registration" as const, _date: r.timestamp })),
		...verifications.map((v) => ({ ...v, _type: "verification" as const, _date: v.verifiedAt })),
	].sort((a, b) => new Date(b._date).getTime() - new Date(a._date).getTime());

	return (
		<div className="h-full flex flex-col overflow-hidden">
			{/* Breadcrumb */}
			<div className="flex-shrink-0 px-6 py-4 border-b bg-card/50">
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
				<div className="flex items-center gap-3">
					<Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<h1 className="text-xl font-semibold">{asset.serialNumber}</h1>
					{getAssetStatusBadge(asset.status)}
				</div>
			</div>

			<div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
				{/* Asset Info */}
				<section>
					<h2 className="text-base font-semibold mb-3">Asset Information</h2>
					<div className="border rounded-lg px-4 divide-y">
						<InfoRow label="Serial Number" value={<span className="font-mono">{asset.serialNumber}</span>} />
						<InfoRow label="Make" value={asset.make} />
						<InfoRow label="Model" value={asset.model} />
						<InfoRow label="Category" value={asset.category?.name} />
						<InfoRow label="Condition" value={asset.condition} />
						<InfoRow label="Status" value={getAssetStatusBadge(asset.status)} />
						<InfoRow label="Site Name" value={asset.siteName} />
						<InfoRow label="Channel" value={asset.channel} />
						<InfoRow label="Client" value={asset.client} />
						<InfoRow label="Notes" value={asset.notes} />
						<InfoRow
							label="Registered GPS"
							value={
								asset.location?.latitude != null ? (
									<div className="flex items-center gap-2">
										<span className="font-mono text-sm">
											{asset.location.latitude}, {asset.location.longitude}
										</span>
										<Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setGpsModalOpen(true)}>
											<MapPin className="h-3 w-3 mr-1" />
											Correct GPS
										</Button>
									</div>
								) : (
									"No GPS"
								)
							}
						/>
						<InfoRow
							label="Location Accuracy"
							value={asset.locationAccuracy != null ? `${asset.locationAccuracy} m` : undefined}
						/>
						<InfoRow
							label="Geofence Threshold"
							value={asset.geofenceThreshold != null ? `${asset.geofenceThreshold} m` : undefined}
						/>
						<InfoRow
							label="Registered By"
							value={
								asset.registeredBy
									? `${(asset.registeredBy as { name?: string }).name} — ${(asset.registeredBy as { email?: string }).email}`
									: undefined
							}
						/>
						<InfoRow
							label="Registered At"
							value={
								asset.registeredAt ? format(new Date(asset.registeredAt as string), "MMM d, yyyy HH:mm") : undefined
							}
						/>
						<InfoRow
							label="Last Verified"
							value={
								asset.lastVerifiedAt ? format(new Date(asset.lastVerifiedAt as string), "MMM d, yyyy HH:mm") : "Never"
							}
						/>
						<InfoRow
							label="Next Verification Due"
							value={
								asset.nextVerificationDue
									? format(new Date(asset.nextVerificationDue as string), "MMM d, yyyy")
									: undefined
							}
						/>
						<InfoRow
							label="Verification Frequency"
							value={asset.verificationFrequency ? `Every ${asset.verificationFrequency} days` : undefined}
						/>
						<InfoRow
							label="QR Code"
							value={asset.qrCode?.code ? <span className="font-mono">{asset.qrCode.code}</span> : undefined}
						/>
					</div>
				</section>

				{/* Verification History */}
				<section>
					<h2 className="text-base font-semibold mb-3">Verification History</h2>
					{allEvents.length === 0 ? (
						<p className="text-sm text-muted-foreground py-4 border rounded-lg text-center">No history yet.</p>
					) : (
						<div className="border rounded-lg overflow-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Date & Time</TableHead>
										<TableHead>Type</TableHead>
										<TableHead>Submitted By</TableHead>
										<TableHead>GPS Passed</TableHead>
										<TableHead>Distance</TableHead>
										<TableHead>Override</TableHead>
										<TableHead>Status</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{allEvents.map((event) => {
										if (event._type === "registration") {
											const r = event as RegistrationHistoryItem & { _type: "registration"; _date: string };
											return (
												<TableRow key={`reg-${r.id}`}>
													<TableCell className="text-sm">
														{format(new Date(r.timestamp), "MMM d, yyyy HH:mm")}
													</TableCell>
													<TableCell>
														<StyledBadge color="purple">Registration</StyledBadge>
													</TableCell>
													<TableCell className="text-sm">{r.performedBy?.name || "—"}</TableCell>
													<TableCell>—</TableCell>
													<TableCell>—</TableCell>
													<TableCell>—</TableCell>
													<TableCell>
														<StyledBadge color="emerald">Completed</StyledBadge>
													</TableCell>
												</TableRow>
											);
										}
										const v = event as VerificationHistoryItem & { _type: "verification"; _date: string };
										return (
											<TableRow key={`ver-${v.id}`}>
												<TableCell className="text-sm">{format(new Date(v.verifiedAt), "MMM d, yyyy HH:mm")}</TableCell>
												<TableCell>
													<StyledBadge color="blue">Verification</StyledBadge>
												</TableCell>
												<TableCell className="text-sm">{v.verifiedBy?.name || "—"}</TableCell>
												<TableCell>
													{v.gpsCheckPassed ? (
														<StyledBadge color="emerald">Yes</StyledBadge>
													) : (
														<StyledBadge color="red">No</StyledBadge>
													)}
												</TableCell>
												<TableCell className="text-sm text-muted-foreground">
													{v.distance != null ? `${v.distance} m` : "—"}
												</TableCell>
												<TableCell>
													{(v as unknown as { gpsOverrideUsed?: boolean }).gpsOverrideUsed ? (
														<StyledBadge color="orange">Yes</StyledBadge>
													) : (
														"No"
													)}
												</TableCell>
												<TableCell>{getVerificationStatusBadge(v.verificationStatus || "")}</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</div>
					)}
				</section>
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
