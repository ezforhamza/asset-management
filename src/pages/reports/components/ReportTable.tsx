import { format } from "date-fns";
import { AlertTriangle, CheckCircle, Eye } from "lucide-react";
import type { Verification } from "#/entity";
import { VerificationStatus } from "#/enum";
import { StatusBadge } from "@/pages/dashboard/components/StatusBadge";
import { Button } from "@/ui/button";
import { Skeleton } from "@/ui/skeleton";

interface ReportTableProps {
	data: Verification[];
	isLoading: boolean;
	onViewDetails: (verification: Verification) => void;
}

export function ReportTable({ data, isLoading, onViewDetails }: ReportTableProps) {
	if (isLoading) {
		return (
			<div className="space-y-3">
				{Array.from({ length: 8 }).map((_, i) => (
					<Skeleton key={i} className="h-16 w-full" />
				))}
			</div>
		);
	}

	if (!data || data.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<div className="rounded-full bg-muted p-4 mb-4">
					<CheckCircle className="h-8 w-8 text-muted-foreground" />
				</div>
				<h3 className="font-semibold text-lg">No verifications found</h3>
				<p className="text-muted-foreground mt-1">Try adjusting your filters or date range</p>
			</div>
		);
	}

	const getAssetStatus = (verification: Verification): VerificationStatus => {
		return verification.asset?.verificationStatus || VerificationStatus.ON_TIME;
	};

	return (
		<div className="rounded-xl border bg-card flex flex-col h-full overflow-hidden">
			{/* Fixed Header */}
			<div className="flex-shrink-0 border-b bg-muted/50 px-4">
				<div className="grid grid-cols-8 py-3 text-sm font-medium text-muted-foreground gap-4">
					<div>Asset</div>
					<div>Verified By</div>
					<div>Date & Time</div>
					<div>Distance</div>
					<div>GPS Check</div>
					<div>Status</div>
					<div>Condition</div>
					<div className="text-right">Actions</div>
				</div>
			</div>
			{/* Scrollable Body */}
			<div className="flex-1 overflow-y-auto">
				{data.map((verification) => (
					<div
						key={verification._id}
						className="grid grid-cols-8 py-3 px-4 border-b last:border-0 items-center gap-4 hover:bg-muted/30 transition-colors"
					>
						<div>
							<p className="font-medium">{verification.asset?.serialNumber || "N/A"}</p>
							<p className="text-sm text-muted-foreground">
								{verification.asset?.make} {verification.asset?.model}
							</p>
						</div>
						<div className="text-sm">{verification.verifiedByName || "Unknown"}</div>
						<div>
							<p className="text-sm">{format(new Date(verification.verifiedAt), "MMM dd, yyyy")}</p>
							<p className="text-xs text-muted-foreground">{format(new Date(verification.verifiedAt), "hh:mm a")}</p>
						</div>
						<div>
							<span className={`text-sm ${verification.distanceFromAsset > 20 ? "text-red-500" : ""}`}>
								{verification.distanceFromAsset.toFixed(1)}m
							</span>
						</div>
						<div>
							{verification.gpsCheckPassed ? (
								<span className="inline-flex items-center text-emerald-500 text-sm">
									<CheckCircle className="h-4 w-4 mr-1" />
									Passed
								</span>
							) : (
								<span className="inline-flex items-center text-orange-500 text-sm">
									<AlertTriangle className="h-4 w-4 mr-1" />
									Override
								</span>
							)}
						</div>
						<div>
							<StatusBadge status={getAssetStatus(verification)} />
						</div>
						<div>
							<span
								className={`text-sm capitalize ${
									verification.checklist.conditionStatus === "poor"
										? "text-red-500"
										: verification.checklist.conditionStatus === "fair"
											? "text-orange-500"
											: "text-emerald-500"
								}`}
							>
								{verification.checklist.conditionStatus}
							</span>
						</div>
						<div className="text-right">
							<Button variant="ghost" size="sm" onClick={() => onViewDetails(verification)}>
								<Eye className="h-4 w-4 mr-1" />
								View
							</Button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default ReportTable;
