import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Badge } from "@/ui/badge";
import { StatusBadge } from "@/pages/dashboard/components/StatusBadge";
import { format } from "date-fns";
import { MapPin, Calendar, User, Camera, CheckCircle, AlertTriangle, Wrench, FileText } from "lucide-react";
import type { Verification } from "#/entity";
import { VerificationStatus } from "#/enum";

interface VerificationDetailProps {
	verification: Verification | null;
	open: boolean;
	onClose: () => void;
}

export function VerificationDetail({ verification, open, onClose }: VerificationDetailProps) {
	if (!verification) return null;

	const asset = verification.asset;

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						Verification Details
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					{/* Asset Info */}
					<div className="rounded-lg border p-4">
						<h3 className="font-semibold mb-3 flex items-center gap-2">
							<Wrench className="h-4 w-4" />
							Asset Information
						</h3>
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<p className="text-muted-foreground">Serial Number</p>
								<p className="font-medium">{asset?.serialNumber || "N/A"}</p>
							</div>
							<div>
								<p className="text-muted-foreground">Make / Model</p>
								<p className="font-medium">
									{asset?.make} {asset?.model}
								</p>
							</div>
							<div>
								<p className="text-muted-foreground">Status</p>
								<StatusBadge status={asset?.verificationStatus || VerificationStatus.ON_TIME} />
							</div>
							<div>
								<p className="text-muted-foreground">Next Due</p>
								<p className="font-medium">
									{asset?.nextVerificationDue ? format(new Date(asset.nextVerificationDue), "MMM dd, yyyy") : "N/A"}
								</p>
							</div>
						</div>
					</div>

					{/* Verification Info */}
					<div className="rounded-lg border p-4">
						<h3 className="font-semibold mb-3 flex items-center gap-2">
							<CheckCircle className="h-4 w-4" />
							Verification Info
						</h3>
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div className="flex items-start gap-2">
								<User className="h-4 w-4 text-muted-foreground mt-0.5" />
								<div>
									<p className="text-muted-foreground">Verified By</p>
									<p className="font-medium">{verification.verifiedByName}</p>
								</div>
							</div>
							<div className="flex items-start gap-2">
								<Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
								<div>
									<p className="text-muted-foreground">Date & Time</p>
									<p className="font-medium">
										{format(new Date(verification.verifiedAt), "MMM dd, yyyy 'at' hh:mm a")}
									</p>
								</div>
							</div>
							<div className="flex items-start gap-2">
								<MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
								<div>
									<p className="text-muted-foreground">Distance from Asset</p>
									<p className="font-medium">{verification.distanceFromAsset.toFixed(1)} meters</p>
								</div>
							</div>
							<div>
								<p className="text-muted-foreground">GPS Check</p>
								{verification.gpsCheckPassed ? (
									<Badge variant="outline" className="bg-emerald-500/10 text-emerald-500">
										<CheckCircle className="h-3 w-3 mr-1" />
										Passed
									</Badge>
								) : (
									<Badge variant="outline" className="bg-orange-500/10 text-orange-500">
										<AlertTriangle className="h-3 w-3 mr-1" />
										Override Used
									</Badge>
								)}
							</div>
						</div>

						{verification.gpsOverrideUsed && (
							<div className="mt-4 p-3 rounded bg-orange-500/10 border border-orange-500/20">
								<p className="text-sm text-orange-600 dark:text-orange-400">
									<AlertTriangle className="h-4 w-4 inline mr-1" />
									GPS override was used after {verification.gpsRetryCount} retries.
									{verification.investigationStatus && (
										<span className="ml-1">
											Investigation status: <strong className="capitalize">{verification.investigationStatus}</strong>
										</span>
									)}
								</p>
							</div>
						)}
					</div>

					{/* Checklist */}
					<div className="rounded-lg border p-4">
						<h3 className="font-semibold mb-3">Checklist Responses</h3>
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<p className="text-muted-foreground">Condition Status</p>
								<Badge
									variant="outline"
									className={
										verification.checklist.conditionStatus === "good"
											? "bg-emerald-500/10 text-emerald-500"
											: verification.checklist.conditionStatus === "fair"
												? "bg-orange-500/10 text-orange-500"
												: "bg-red-500/10 text-red-500"
									}
								>
									{verification.checklist.conditionStatus.charAt(0).toUpperCase() +
										verification.checklist.conditionStatus.slice(1)}
								</Badge>
							</div>
							<div>
								<p className="text-muted-foreground">Operational Status</p>
								<Badge
									variant="outline"
									className={
										verification.checklist.operationalStatus === "operational"
											? "bg-emerald-500/10 text-emerald-500"
											: verification.checklist.operationalStatus === "needs_repair"
												? "bg-orange-500/10 text-orange-500"
												: "bg-red-500/10 text-red-500"
									}
								>
									{verification.checklist.operationalStatus.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
								</Badge>
							</div>
						</div>

						{verification.checklist.repairNotes && (
							<div className="mt-4">
								<p className="text-muted-foreground text-sm mb-1">Repair Notes</p>
								<p className="text-sm bg-muted p-3 rounded">{verification.checklist.repairNotes}</p>
							</div>
						)}
					</div>

					{/* Photos */}
					{verification.photos && verification.photos.length > 0 && (
						<div className="rounded-lg border p-4">
							<h3 className="font-semibold mb-3 flex items-center gap-2">
								<Camera className="h-4 w-4" />
								Photos ({verification.photos.length})
							</h3>
							<div className="grid grid-cols-2 gap-4">
								{verification.photos.map((_, index) => (
									<div
										key={index}
										className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground"
									>
										<Camera className="h-8 w-8" />
										<span className="ml-2">Photo {index + 1}</span>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default VerificationDetail;
