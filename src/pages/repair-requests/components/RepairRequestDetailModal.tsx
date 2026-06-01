import { format } from "date-fns";
import type { RepairRequest } from "@/api/services/repairRequestService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Separator } from "@/ui/separator";
import { StyledBadge } from "@/utils/badge-styles";

interface RepairRequestDetailModalProps {
	request: RepairRequest | null;
	open: boolean;
	onClose: () => void;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div className="flex justify-between items-start gap-4 py-2">
			<span className="text-sm text-muted-foreground shrink-0 w-36">{label}</span>
			<span className="text-sm font-medium text-right">{value}</span>
		</div>
	);
}

export function RepairRequestDetailModal({ request, open, onClose }: RepairRequestDetailModalProps) {
	if (!request) return null;

	const statusColor: Record<string, "blue" | "yellow" | "emerald"> = {
		open: "blue",
		acknowledged: "yellow",
		resolved: "emerald",
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Repair Request Detail</DialogTitle>
				</DialogHeader>

				<div className="space-y-1">
					{/* Asset Info */}
					<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-1">Asset</p>
					<div className="bg-muted/40 rounded-md px-3 divide-y divide-border">
						<DetailRow
							label="Serial Number"
							value={<span className="font-mono">{request.assetSnapshot.serialNumber}</span>}
						/>
						<DetailRow label="Make / Model" value={`${request.assetSnapshot.make} ${request.assetSnapshot.model}`} />
						<DetailRow label="Category" value={request.assetSnapshot.categoryName || "—"} />
						<DetailRow label="Site Name" value={request.assetSnapshot.siteName || "—"} />
					</div>

					<Separator className="my-3" />

					{/* Request Info */}
					<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Request Details</p>
					<div className="bg-muted/40 rounded-md px-3 divide-y divide-border">
						<DetailRow
							label="Status"
							value={
								<StyledBadge color={statusColor[request.status] ?? "blue"}>
									{request.status.charAt(0).toUpperCase() + request.status.slice(1)}
								</StyledBadge>
							}
						/>
						<DetailRow
							label="Source"
							value={
								request.source === "field_worker" ? (
									<StyledBadge color="blue">Field Worker</StyledBadge>
								) : (
									<StyledBadge color="purple">Customer Admin</StyledBadge>
								)
							}
						/>
						{request.operationalStatus && (
							<DetailRow
								label="Operational Status"
								value={
									request.operationalStatus === "needs_repair" ? (
										<StyledBadge color="yellow">Needs Repair</StyledBadge>
									) : (
										<StyledBadge color="red">Non-Operational</StyledBadge>
									)
								}
							/>
						)}
						{request.conditionStatus && (
							<DetailRow
								label="Condition"
								value={request.conditionStatus.charAt(0).toUpperCase() + request.conditionStatus.slice(1)}
							/>
						)}
						<DetailRow label="Email Sent" value={request.emailSent ? "Yes" : "No"} />
						<DetailRow label="Logged At" value={format(new Date(request.createdAt), "MMM d, yyyy HH:mm")} />
					</div>

					{/* Notes */}
					{request.notes && (
						<>
							<Separator className="my-3" />
							<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notes</p>
							<div className="bg-muted/40 rounded-md p-3">
								<p className="text-sm whitespace-pre-wrap">{request.notes}</p>
							</div>
						</>
					)}

					<Separator className="my-3" />

					{/* Requested By */}
					<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Requested By</p>
					<div className="bg-muted/40 rounded-md px-3 divide-y divide-border">
						<DetailRow label="Name" value={request.requestedBy?.name || "—"} />
						<DetailRow label="Email" value={request.requestedBy?.email || "—"} />
						<DetailRow
							label="Role"
							value={request.requestedBy?.role?.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "—"}
						/>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
