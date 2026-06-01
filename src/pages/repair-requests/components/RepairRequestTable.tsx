import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import type { RepairRequest } from "@/api/services/repairRequestService";
import repairRequestService from "@/api/services/repairRequestService";
import { Button } from "@/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { StyledBadge } from "@/utils/badge-styles";

function OperationalBadge({ status }: { status?: string | null }) {
	if (status === "needs_repair") return <StyledBadge color="yellow">Needs Repair</StyledBadge>;
	if (status === "non_operational") return <StyledBadge color="red">Non-Operational</StyledBadge>;
	return <span className="text-muted-foreground text-sm">—</span>;
}

function SourceBadge({ source }: { source: string }) {
	if (source === "field_worker") return <StyledBadge color="blue">Field Worker</StyledBadge>;
	return <StyledBadge color="purple">Customer Admin</StyledBadge>;
}

function StatusSelect({ request }: { request: RepairRequest }) {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: (status: string) => repairRequestService.updateRepairRequestStatus(request.id, status),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["repair-requests"] });
			toast.success("Status updated");
		},
	});

	const colorMap: Record<string, "blue" | "yellow" | "emerald"> = {
		open: "blue",
		acknowledged: "yellow",
		resolved: "emerald",
	};

	return (
		<Select value={request.status} onValueChange={(v) => mutation.mutate(v)} disabled={mutation.isPending}>
			<SelectTrigger className="h-7 w-[140px] text-xs border-0 p-0 shadow-none focus:ring-0">
				<SelectValue>
					<StyledBadge color={colorMap[request.status] ?? "blue"}>
						{request.status.charAt(0).toUpperCase() + request.status.slice(1)}
					</StyledBadge>
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="open">
					<StyledBadge color="blue">Open</StyledBadge>
				</SelectItem>
				<SelectItem value="acknowledged">
					<StyledBadge color="yellow">Acknowledged</StyledBadge>
				</SelectItem>
				<SelectItem value="resolved">
					<StyledBadge color="emerald">Resolved</StyledBadge>
				</SelectItem>
			</SelectContent>
		</Select>
	);
}

interface RepairRequestTableProps {
	requests: RepairRequest[];
	isLoading: boolean;
	onView: (request: RepairRequest) => void;
}

export function RepairRequestTable({ requests, isLoading, onView }: RepairRequestTableProps) {
	if (isLoading) {
		return (
			<Table>
				<TableHeader>
					<TableRow>
						{[
							"Date",
							"Serial #",
							"Make / Model",
							"Category",
							"Site",
							"Operational",
							"Source",
							"Notes",
							"Status",
							"Requested By",
							"",
						].map((h) => (
							<TableHead key={h}>{h}</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{Array.from({ length: 6 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
						<TableRow key={i}>
							{Array.from({ length: 11 }).map((_, j) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
								<TableCell key={j}>
									<Skeleton className="h-4 w-20" />
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		);
	}

	if (requests.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-20 text-center">
				<p className="font-medium text-muted-foreground">No repair requests found</p>
				<p className="text-sm text-muted-foreground mt-1">
					Repair requests are logged automatically when field workers flag assets, or manually by admins.
				</p>
			</div>
		);
	}

	return (
		<Table>
			<TableHeader className="sticky top-0 bg-background z-10">
				<TableRow>
					<TableHead>Date</TableHead>
					<TableHead>Serial #</TableHead>
					<TableHead>Make / Model</TableHead>
					<TableHead>Category</TableHead>
					<TableHead>Site</TableHead>
					<TableHead>Operational</TableHead>
					<TableHead>Source</TableHead>
					<TableHead>Notes</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Requested By</TableHead>
					<TableHead className="w-[60px]" />
				</TableRow>
			</TableHeader>
			<TableBody>
				{requests.map((req) => (
					<TableRow key={req.id}>
						<TableCell className="text-sm text-muted-foreground whitespace-nowrap">
							{format(new Date(req.createdAt), "MMM d, yyyy HH:mm")}
						</TableCell>
						<TableCell className="font-mono text-sm">{req.assetSnapshot.serialNumber}</TableCell>
						<TableCell className="text-sm">
							{req.assetSnapshot.make} {req.assetSnapshot.model}
						</TableCell>
						<TableCell className="text-sm text-muted-foreground">{req.assetSnapshot.categoryName || "—"}</TableCell>
						<TableCell className="text-sm text-muted-foreground">{req.assetSnapshot.siteName || "—"}</TableCell>
						<TableCell>
							<OperationalBadge status={req.operationalStatus} />
						</TableCell>
						<TableCell>
							<SourceBadge source={req.source} />
						</TableCell>
						<TableCell className="max-w-[180px]">
							<p className="text-sm text-muted-foreground truncate" title={req.notes}>
								{req.notes || "—"}
							</p>
						</TableCell>
						<TableCell>
							<StatusSelect request={req} />
						</TableCell>
						<TableCell className="text-sm text-muted-foreground whitespace-nowrap">
							{req.requestedBy?.name || "—"}
						</TableCell>
						<TableCell>
							<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView(req)}>
								<Eye className="h-4 w-4" />
							</Button>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
