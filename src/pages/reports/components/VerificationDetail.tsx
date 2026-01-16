import { format } from "date-fns";
import { Calendar, FileText, MapPin, Wrench } from "lucide-react";
import type { VerificationReportItem } from "#/report";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog";
import { StyledBadge } from "@/utils/badge-styles";

interface VerificationDetailProps {
	verification: VerificationReportItem | null;
	open: boolean;
	onClose: () => void;
}

export function VerificationDetail({ verification, open, onClose }: VerificationDetailProps) {
	if (!verification) return null;

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "on_time":
				return <StyledBadge color="emerald">On Time</StyledBadge>;
			case "due_soon":
				return <StyledBadge color="orange">Due Soon</StyledBadge>;
			case "overdue":
				return <StyledBadge color="red">Overdue</StyledBadge>;
			default:
				return <StyledBadge color="gray">{status}</StyledBadge>;
		}
	};

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
								<p className="font-medium">{verification.serialNumber || "N/A"}</p>
							</div>
							<div>
								<p className="text-muted-foreground">Make / Model</p>
								<p className="font-medium">{verification.makeModel}</p>
							</div>
							<div>
								<p className="text-muted-foreground">Status</p>
								{getStatusBadge(verification.verificationStatus)}
							</div>
							<div>
								<p className="text-muted-foreground">Next Due</p>
								<p className="font-medium">
									{verification.nextVerificationDue
										? format(new Date(verification.nextVerificationDue), "MMM dd, yyyy")
										: "N/A"}
								</p>
							</div>
						</div>
					</div>

					{/* Verification Info */}
					<div className="rounded-lg border p-4">
						<h3 className="font-semibold mb-3 flex items-center gap-2">
							<Calendar className="h-4 w-4" />
							Verification Info
						</h3>
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<p className="text-muted-foreground">Last Verified</p>
								<p className="font-medium">
									{verification.lastVerifiedAt
										? format(new Date(verification.lastVerifiedAt), "MMM dd, yyyy 'at' hh:mm a")
										: "Never"}
								</p>
							</div>
							<div>
								<p className="text-muted-foreground">Total Verifications</p>
								<p className="font-medium">{verification.totalVerifications}</p>
							</div>
							<div>
								<p className="text-muted-foreground">Days Until Due</p>
								<p
									className={`font-medium ${
										verification.daysUntilDue < 0
											? "text-red-500"
											: verification.daysUntilDue < 7
												? "text-orange-500"
												: "text-emerald-500"
									}`}
								>
									{verification.daysUntilDue.toFixed(0)} days
								</p>
							</div>
							{verification.lastGpsCheckPassed !== undefined && (
								<div>
									<p className="text-muted-foreground">Last GPS Check</p>
									<StyledBadge color={verification.lastGpsCheckPassed ? "emerald" : "orange"}>
										{verification.lastGpsCheckPassed ? "Passed" : "Override"}
									</StyledBadge>
								</div>
							)}
						</div>
					</div>

					{/* Condition */}
					{(verification.lastCondition || verification.lastOperational) && (
						<div className="rounded-lg border p-4">
							<h3 className="font-semibold mb-3">Last Condition Assessment</h3>
							<div className="grid grid-cols-2 gap-4 text-sm">
								{verification.lastCondition && (
									<div>
										<p className="text-muted-foreground">Condition</p>
										<StyledBadge
											color={
												verification.lastCondition === "excellent"
													? "emerald"
													: verification.lastCondition === "good"
														? "blue"
														: verification.lastCondition === "fair"
															? "orange"
															: "red"
											}
										>
											{verification.lastCondition}
										</StyledBadge>
									</div>
								)}
								{verification.lastOperational && (
									<div>
										<p className="text-muted-foreground">Operational Status</p>
										<StyledBadge
											color={
												verification.lastOperational === "operational"
													? "emerald"
													: verification.lastOperational === "needs_repair"
														? "orange"
														: "red"
											}
										>
											{verification.lastOperational.replace("_", " ")}
										</StyledBadge>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Location */}
					{verification.registeredLocation && (
						<div className="rounded-lg border p-4">
							<h3 className="font-semibold mb-3 flex items-center gap-2">
								<MapPin className="h-4 w-4" />
								Registered Location
							</h3>
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<p className="text-muted-foreground">Latitude</p>
									<p className="font-medium">{verification.registeredLocation.coordinates[1].toFixed(6)}</p>
								</div>
								<div>
									<p className="text-muted-foreground">Longitude</p>
									<p className="font-medium">{verification.registeredLocation.coordinates[0].toFixed(6)}</p>
								</div>
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default VerificationDetail;
