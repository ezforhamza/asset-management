import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ChevronDown, Eye, FileDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { RepairRequest } from "@/api/services/repairRequestService";
import repairRequestService from "@/api/services/repairRequestService";
import { Button } from "@/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { StyledBadge } from "@/utils/badge-styles";

function DownloadPdfButton({ req }: { req: RepairRequest }) {
	const [loading, setLoading] = useState(false);

	const handleDownload = async () => {
		setLoading(true);
		try {
			await repairRequestService.downloadCoolingRepairPdf(req._id ?? req.id, req.assetSnapshot.serialNumber);
		} catch {
			toast.error("Failed to download PDF");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Button
			variant="ghost"
			size="icon"
			className="h-8 w-8"
			onClick={handleDownload}
			disabled={loading}
			title="Download Cooling Repair PDF"
		>
			<FileDown className="h-4 w-4" />
		</Button>
	);
}

function SourceBadge({ source }: { source: string }) {
	if (source === "field_worker") return <StyledBadge color="blue">Field Worker</StyledBadge>;
	return <StyledBadge color="purple">Customer Admin</StyledBadge>;
}

function StatusDropdown({ request }: { request: RepairRequest }) {
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
	const label = request.status.charAt(0).toUpperCase() + request.status.slice(1);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="flex items-center gap-1 outline-none focus:outline-none disabled:opacity-50"
					disabled={mutation.isPending}
				>
					<StyledBadge color={colorMap[request.status] ?? "blue"}>{label}</StyledBadge>
					<ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				<DropdownMenuItem onClick={() => mutation.mutate("open")}>
					<StyledBadge color="blue">Open</StyledBadge>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => mutation.mutate("acknowledged")}>
					<StyledBadge color="yellow">Acknowledged</StyledBadge>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => mutation.mutate("resolved")}>
					<StyledBadge color="emerald">Resolved</StyledBadge>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

const COLS = 9;

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
						{["Serial #", "Make / Model", "Category", "Site", "Source", "Notes", "Date", "Status", ""].map((h) => (
							<TableHead key={h}>{h}</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{Array.from({ length: 6 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
						<TableRow key={i}>
							{Array.from({ length: COLS }).map((_, j) => (
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
					<TableHead>Serial #</TableHead>
					<TableHead>Make / Model</TableHead>
					<TableHead>Category</TableHead>
					<TableHead>Site</TableHead>
					<TableHead>Source</TableHead>
					<TableHead>Notes</TableHead>
					<TableHead>Date</TableHead>
					<TableHead>Status</TableHead>
					<TableHead className="w-[50px]" />
				</TableRow>
			</TableHeader>
			<TableBody>
				{requests.map((req) => (
					<TableRow
						key={req.id}
						className="cursor-pointer hover:bg-muted/50"
						onClick={(e) => {
							if ((e.target as HTMLElement).closest("button, [role='menuitem'], [role='menu']")) return;
							onView(req);
						}}
					>
						<TableCell className="font-mono text-sm">{req.assetSnapshot.serialNumber}</TableCell>
						<TableCell className="text-sm">
							{req.assetSnapshot.make} {req.assetSnapshot.model}
						</TableCell>
						<TableCell className="text-sm text-muted-foreground">{req.assetSnapshot.categoryName || "—"}</TableCell>
						<TableCell className="text-sm text-muted-foreground">{req.assetSnapshot.siteName || "—"}</TableCell>
						<TableCell>
							<SourceBadge source={req.source} />
						</TableCell>
						<TableCell className="max-w-[200px]">
							<p className="text-sm text-muted-foreground truncate" title={req.notes}>
								{req.notes || "—"}
							</p>
						</TableCell>
						<TableCell className="text-sm text-muted-foreground whitespace-nowrap">
							{format(new Date(req.createdAt), "MMM d, yyyy HH:mm")}
						</TableCell>
						<TableCell onClick={(e) => e.stopPropagation()}>
							<StatusDropdown request={req} />
						</TableCell>
						<TableCell onClick={(e) => e.stopPropagation()}>
							<div className="flex items-center gap-1">
								{req.assetSnapshot.categoryName === "Cooling Equipment" &&
									!!req.coolingRepairForm &&
									Object.keys(req.coolingRepairForm).length > 0 && <DownloadPdfButton req={req} />}
								<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView(req)}>
									<Eye className="h-4 w-4" />
								</Button>
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
