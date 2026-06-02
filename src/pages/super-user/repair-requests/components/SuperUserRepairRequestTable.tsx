import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ChevronDown, Eye } from "lucide-react";
import { toast } from "sonner";
import type { RepairRequest } from "@/api/services/repairRequestService";
import repairRequestService from "@/api/services/repairRequestService";
import { Button } from "@/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { StyledBadge } from "@/utils/badge-styles";

function SourceBadge({ source }: { source: string }) {
	if (source === "field_worker") return <StyledBadge color="blue">Field Worker</StyledBadge>;
	return <StyledBadge color="purple">Customer Admin</StyledBadge>;
}

function StatusDisplay({ request, canMutate }: { request: RepairRequest; canMutate: boolean }) {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: (status: string) => repairRequestService.updateRepairRequestStatus(request.id, status),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["super-user", "repair-requests"] });
			toast.success("Status updated");
		},
	});

	const colorMap: Record<string, "blue" | "yellow" | "emerald"> = {
		open: "blue",
		acknowledged: "yellow",
		resolved: "emerald",
	};
	const label = request.status.charAt(0).toUpperCase() + request.status.slice(1);

	if (!canMutate) {
		return <StyledBadge color={colorMap[request.status] ?? "blue"}>{label}</StyledBadge>;
	}

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

interface Props {
	requests: RepairRequest[];
	isLoading: boolean;
	onView: (request: RepairRequest) => void;
	canMutate: boolean;
	showOrgColumn: boolean;
}

export function SuperUserRepairRequestTable({ requests, isLoading, onView, canMutate, showOrgColumn }: Props) {
	const colCount = 9 + (showOrgColumn ? 1 : 0);

	if (isLoading) {
		return (
			<Table>
				<TableHeader>
					<TableRow>
						{showOrgColumn && <TableHead>Organisation</TableHead>}
						{["Serial #", "Make / Model", "Category", "Site", "Source", "Notes", "Date", "Status", ""].map((h) => (
							<TableHead key={h}>{h}</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{Array.from({ length: 6 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
						<TableRow key={i}>
							{Array.from({ length: colCount }).map((_, j) => (
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
				<p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or date range</p>
			</div>
		);
	}

	return (
		<Table>
			<TableHeader className="sticky top-0 bg-background z-10">
				<TableRow>
					{showOrgColumn && <TableHead>Organisation</TableHead>}
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
						{showOrgColumn && <TableCell className="text-sm text-muted-foreground">{req.companyName || "—"}</TableCell>}
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
							<StatusDisplay request={req} canMutate={canMutate} />
						</TableCell>
						<TableCell onClick={(e) => e.stopPropagation()}>
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
