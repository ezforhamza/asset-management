import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
	CalendarIcon,
	CheckCircle,
	ChevronLeft,
	ChevronRight,
	Loader2,
	MapPin,
	MoreHorizontal,
	Play,
	Search,
	Trash2,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import assetMovementService, {
	type AssetMovement,
	type AssetMovementListParams,
} from "@/api/services/assetMovementService";
import { Button } from "@/ui/button";
import { Calendar } from "@/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Textarea } from "@/ui/textarea";
import { StyledBadge } from "@/utils/badge-styles";
import { formatLabel } from "@/utils/formatLabel";
import { cn } from "@/utils/index";

export default function AssetMovementsPage() {
	const queryClient = useQueryClient();

	const [page, setPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");

	// Filter state
	const [statusFilter, setStatusFilter] = useState<string>("");
	const [destinationTypeFilter, setDestinationTypeFilter] = useState<string>("");
	const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
	const [toDate, setToDate] = useState<Date | undefined>(undefined);

	// Details modal state
	const [detailsModalOpen, setDetailsModalOpen] = useState(false);
	const [selectedMovement, setSelectedMovement] = useState<AssetMovement | null>(null);
	const [loadingDetails, setLoadingDetails] = useState(false);

	// Delete/Cancel modal state
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [deletingMovement, setDeletingMovement] = useState<AssetMovement | null>(null);
	const [cancellationReason, setCancellationReason] = useState("");

	// Start movement modal state
	const [startModalOpen, setStartModalOpen] = useState(false);
	const [startingMovement, setStartingMovement] = useState<AssetMovement | null>(null);

	// Complete movement modal state
	const [completeModalOpen, setCompleteModalOpen] = useState(false);
	const [completingMovement, setCompletingMovement] = useState<AssetMovement | null>(null);
	const [completionNotes, setCompletionNotes] = useState("");

	const limit = 10;

	const invalidateAll = () => {
		queryClient.invalidateQueries({ queryKey: ["asset-movements"] });
		queryClient.invalidateQueries({ queryKey: ["assets"] });
		queryClient.invalidateQueries({ queryKey: ["assets-all-for-filters"] });
	};

	// Build query params with filters
	const queryParams: AssetMovementListParams = useMemo(() => {
		const params: AssetMovementListParams = { page, limit, sortBy: "createdAt:desc" };
		if (statusFilter) params.status = statusFilter as AssetMovementListParams["status"];
		if (destinationTypeFilter)
			params.destinationType = destinationTypeFilter as AssetMovementListParams["destinationType"];
		if (fromDate) params.fromDate = fromDate.toISOString();
		if (toDate) params.toDate = toDate.toISOString();
		return params;
	}, [page, statusFilter, destinationTypeFilter, fromDate, toDate]);

	const { data, isLoading } = useQuery({
		queryKey: ["asset-movements", queryParams],
		queryFn: () => assetMovementService.getAssetMovements(queryParams),
	});

	const deleteMutation = useMutation({
		mutationFn: ({ movementId, reason }: { movementId: string; reason?: string }) =>
			assetMovementService.deleteAssetMovement(movementId, reason ? { cancellationReason: reason } : undefined),
		onSuccess: () => {
			toast.success("Movement cancelled — asset restored to active");
			invalidateAll();
			setDeleteModalOpen(false);
			setDeletingMovement(null);
			setCancellationReason("");
		},
		onError: () => {
			// Error toast is handled by apiClient
		},
	});

	const startMutation = useMutation({
		mutationFn: (movementId: string) => assetMovementService.startMovement(movementId),
		onSuccess: () => {
			toast.success("Movement started — asset registration data cleared");
			invalidateAll();
			setStartModalOpen(false);
			setStartingMovement(null);
		},
		onError: () => {
			// Error toast is handled by apiClient
		},
	});

	const completeMutation = useMutation({
		mutationFn: ({ movementId, notes }: { movementId: string; notes?: string }) =>
			assetMovementService.completeMovement(movementId, notes ? { completionNotes: notes } : undefined),
		onSuccess: () => {
			toast.success("Movement completed — asset is now active at new location");
			invalidateAll();
			setCompleteModalOpen(false);
			setCompletingMovement(null);
			setCompletionNotes("");
		},
		onError: () => {
			// Error toast is handled by apiClient
		},
	});

	const movements = data?.results || [];
	const totalPages = data?.totalPages || 1;
	const totalResults = data?.totalResults || 0;

	// Client-side search filter
	const filteredMovements = searchQuery
		? movements.filter(
				(movement) =>
					movement.assetId?.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					movement.assetId?.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					movement.assetId?.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					movement.deliveryDestinationText?.toLowerCase().includes(searchQuery.toLowerCase()),
			)
		: movements;

	const handleRowClick = async (movement: AssetMovement) => {
		setSelectedMovement(movement);
		setLoadingDetails(true);
		setDetailsModalOpen(true);

		try {
			const details = await assetMovementService.getAssetMovementById(movement.id);
			setSelectedMovement(details);
		} catch {
			// Error handled by apiClient, keep the basic info shown
		} finally {
			setLoadingDetails(false);
		}
	};

	const handleDeleteClick = (movement: AssetMovement, e: React.MouseEvent) => {
		e.stopPropagation();
		setDeletingMovement(movement);
		setDeleteModalOpen(true);
	};

	const handleStartClick = (movement: AssetMovement, e: React.MouseEvent) => {
		e.stopPropagation();
		setStartingMovement(movement);
		setStartModalOpen(true);
	};

	const handleCompleteClick = (movement: AssetMovement, e: React.MouseEvent) => {
		e.stopPropagation();
		setCompletingMovement(movement);
		setCompletionNotes("");
		setCompleteModalOpen(true);
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "pending":
				return <StyledBadge color="yellow">Pending</StyledBadge>;
			case "in_progress":
				return <StyledBadge color="blue">In Progress</StyledBadge>;
			case "completed":
				return <StyledBadge color="emerald">Completed</StyledBadge>;
			case "cancelled":
				return <StyledBadge color="gray">Cancelled</StyledBadge>;
			default:
				return <StyledBadge color="gray">{formatLabel(status)}</StyledBadge>;
		}
	};

	const getDestinationTypeBadge = (type: string) => {
		switch (type) {
			case "warehouse":
				return <StyledBadge color="purple">Warehouse</StyledBadge>;
			case "client_location":
				return <StyledBadge color="cyan">Client Location</StyledBadge>;
			default:
				return <StyledBadge color="gray">{formatLabel(type)}</StyledBadge>;
		}
	};

	const clearFilters = () => {
		setStatusFilter("");
		setDestinationTypeFilter("");
		setFromDate(undefined);
		setToDate(undefined);
		setPage(1);
	};

	const hasFilters = statusFilter || destinationTypeFilter || fromDate || toDate;

	return (
		<div className="h-full flex flex-col overflow-hidden">
			{/* Header */}
			<div className="flex-shrink-0 px-6 py-4 border-b bg-card/50">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-xl font-semibold">Asset Movements</h1>
						<p className="text-sm text-muted-foreground">Track and manage asset movement requests</p>
					</div>
				</div>
			</div>

			{/* Search and Filters */}
			<div className="flex-shrink-0 px-6 py-4 border-b space-y-3">
				<div className="flex items-center gap-4 flex-wrap">
					{/* Search */}
					<div className="relative flex-1 min-w-[200px] max-w-md">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search by serial number, make, model, or destination..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
						/>
					</div>

					{/* Status Filter */}
					<Select
						value={statusFilter}
						onValueChange={(val) => {
							setStatusFilter(val);
							setPage(1);
						}}
					>
						<SelectTrigger className="w-[140px]">
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="pending">Pending</SelectItem>
							<SelectItem value="in_progress">In Progress</SelectItem>
							<SelectItem value="completed">Completed</SelectItem>
							<SelectItem value="cancelled">Cancelled</SelectItem>
						</SelectContent>
					</Select>

					{/* Destination Type Filter */}
					<Select
						value={destinationTypeFilter}
						onValueChange={(val) => {
							setDestinationTypeFilter(val);
							setPage(1);
						}}
					>
						<SelectTrigger className="w-[160px]">
							<SelectValue placeholder="Destination Type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="warehouse">Warehouse</SelectItem>
							<SelectItem value="client_location">Client Location</SelectItem>
						</SelectContent>
					</Select>

					{/* From Date */}
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className={cn("w-[140px] justify-start text-left font-normal", !fromDate && "text-muted-foreground")}
							>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{fromDate ? format(fromDate, "PP") : "From Date"}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="start">
							<Calendar
								mode="single"
								selected={fromDate}
								onSelect={(date) => {
									setFromDate(date);
									setPage(1);
								}}
								initialFocus
							/>
						</PopoverContent>
					</Popover>

					{/* To Date */}
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className={cn("w-[140px] justify-start text-left font-normal", !toDate && "text-muted-foreground")}
							>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{toDate ? format(toDate, "PP") : "To Date"}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="start">
							<Calendar
								mode="single"
								selected={toDate}
								onSelect={(date) => {
									setToDate(date);
									setPage(1);
								}}
								initialFocus
							/>
						</PopoverContent>
					</Popover>

					{/* Clear Filters */}
					{hasFilters && (
						<Button variant="ghost" size="sm" onClick={clearFilters}>
							<X className="h-4 w-4 mr-1" />
							Clear Filters
						</Button>
					)}
				</div>
			</div>

			{/* Results count */}
			<div className="flex-shrink-0 flex items-center justify-between px-6 py-2 bg-muted/30">
				<p className="text-sm text-muted-foreground">
					{isLoading ? "Loading..." : `Showing ${filteredMovements.length} of ${totalResults} movements`}
				</p>
			</div>

			{/* Table */}
			<div className="flex-1 min-h-0 overflow-hidden px-6 py-4">
				<div className="rounded-md border flex flex-col h-full max-h-full overflow-hidden">
					<div className="flex-1 min-h-0 overflow-auto">
						<Table>
							<TableHeader className="sticky top-0 bg-background z-10">
								<TableRow>
									<TableHead>Asset</TableHead>
									<TableHead>Destination</TableHead>
									<TableHead>Destination Type</TableHead>
									<TableHead>Collection Date</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Requested By</TableHead>
									<TableHead>Created At</TableHead>
									<TableHead className="w-[50px]" />
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									Array.from({ length: 10 }).map((_, i) => (
										<TableRow key={`skeleton-${i}`}>
											<TableCell>
												<Skeleton className="h-4 w-32" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-40" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-5 w-24" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-24" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-5 w-20" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-28" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-24" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-8 w-8" />
											</TableCell>
										</TableRow>
									))
								) : filteredMovements.length === 0 ? (
									<TableRow>
										<TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
											No movement requests found
										</TableCell>
									</TableRow>
								) : (
									filteredMovements.map((movement) => (
										<TableRow
											key={movement.id}
											className="cursor-pointer hover:bg-muted/50"
											onClick={() => handleRowClick(movement)}
										>
											<TableCell>
												<div>
													<p className="font-medium">{movement.assetId?.serialNumber || "N/A"}</p>
													<p className="text-xs text-muted-foreground">
														{movement.assetId?.make} {movement.assetId?.model}
													</p>
												</div>
											</TableCell>
											<TableCell className="max-w-[200px] truncate">{movement.deliveryDestinationText}</TableCell>
											<TableCell>{getDestinationTypeBadge(movement.destinationType)}</TableCell>
											<TableCell>{format(new Date(movement.collectionDatetime), "PPp")}</TableCell>
											<TableCell>{getStatusBadge(movement.status)}</TableCell>
											<TableCell>
												<div>
													<p className="text-sm">{movement.requestedBy?.name || "N/A"}</p>
													<p className="text-xs text-muted-foreground">{movement.requestedBy?.email}</p>
												</div>
											</TableCell>
											<TableCell className="text-muted-foreground">
												{format(new Date(movement.createdAt), "PP")}
											</TableCell>
											<TableCell>
												{(movement.status === "pending" || movement.status === "in_progress") && (
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button
																variant="ghost"
																size="icon"
																className="h-8 w-8"
																onClick={(e) => e.stopPropagation()}
															>
																<MoreHorizontal className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															{movement.status === "pending" && (
																<DropdownMenuItem onClick={(e) => handleStartClick(movement, e)}>
																	<Play className="h-4 w-4 mr-2" />
																	Start Movement
																</DropdownMenuItem>
															)}
															{movement.status === "in_progress" && (
																<DropdownMenuItem onClick={(e) => handleCompleteClick(movement, e)}>
																	<CheckCircle className="h-4 w-4 mr-2" />
																	Complete Movement
																</DropdownMenuItem>
															)}
															{movement.status === "pending" && (
																<DropdownMenuItem
																	onClick={(e) => handleDeleteClick(movement, e)}
																	className="text-destructive focus:text-destructive"
																>
																	<Trash2 className="h-4 w-4 mr-2" />
																	Cancel Movement
																</DropdownMenuItem>
															)}
														</DropdownMenuContent>
													</DropdownMenu>
												)}
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>

					{/* Pagination Footer */}
					<div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-t bg-muted/30">
						<p className="text-sm text-muted-foreground">
							Page {page} of {totalPages || 1}
						</p>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								disabled={page === 1}
							>
								<ChevronLeft className="h-4 w-4 mr-1" />
								Previous
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
								disabled={page >= totalPages}
							>
								Next
								<ChevronRight className="h-4 w-4 ml-1" />
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Movement Details Modal */}
			<Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle>Movement Details</DialogTitle>
						<DialogDescription>
							Details for movement request of asset {selectedMovement?.assetId?.serialNumber}
						</DialogDescription>
					</DialogHeader>
					{loadingDetails ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						</div>
					) : selectedMovement ? (
						<div className="space-y-4 py-4">
							{/* Asset Info */}
							<div className="p-3 bg-muted/50 rounded-md space-y-1">
								<p className="text-sm font-medium">Asset Information</p>
								<p className="text-sm text-muted-foreground">
									Serial Number:{" "}
									<span className="font-medium text-foreground">{selectedMovement.assetId?.serialNumber}</span>
								</p>
								<p className="text-sm text-muted-foreground">
									Make / Model:{" "}
									<span className="font-medium text-foreground">
										{selectedMovement.assetId?.make} {selectedMovement.assetId?.model}
									</span>
								</p>
							</div>

							{/* Movement Info */}
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label className="text-muted-foreground">Status</Label>
									<div className="mt-1">{getStatusBadge(selectedMovement.status)}</div>
								</div>
								<div>
									<Label className="text-muted-foreground">Destination Type</Label>
									<div className="mt-1">{getDestinationTypeBadge(selectedMovement.destinationType)}</div>
								</div>
							</div>

							<div>
								<Label className="text-muted-foreground">Delivery Destination</Label>
								<p className="mt-1 text-sm">{selectedMovement.deliveryDestinationText}</p>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label className="text-muted-foreground">Collection Date & Time</Label>
									<p className="mt-1 text-sm">{format(new Date(selectedMovement.collectionDatetime), "PPp")}</p>
								</div>
								<div>
									<Label className="text-muted-foreground">Created At</Label>
									<p className="mt-1 text-sm">{format(new Date(selectedMovement.createdAt), "PPp")}</p>
								</div>
							</div>

							{/* Collection Location */}
							{selectedMovement.collectionLocation && (
								<div>
									<Label className="text-muted-foreground">Collection Location</Label>
									<div className="mt-1 flex items-center gap-2">
										<MapPin className="h-4 w-4 text-muted-foreground" />
										<p className="text-sm">{selectedMovement.collectionLocation.description}</p>
									</div>
								</div>
							)}

							{/* Movement Instructions */}
							{selectedMovement.movementInstructions && (
								<div>
									<Label className="text-muted-foreground">Movement Instructions</Label>
									<p className="mt-1 text-sm p-3 bg-muted/30 rounded-md">{selectedMovement.movementInstructions}</p>
								</div>
							)}

							{/* Requested By */}
							<div>
								<Label className="text-muted-foreground">Requested By</Label>
								<p className="mt-1 text-sm">
									{selectedMovement.requestedBy?.name} ({selectedMovement.requestedBy?.email})
								</p>
							</div>

							{/* Cancellation Reason (if cancelled) */}
							{selectedMovement.status === "cancelled" && selectedMovement.cancellationReason && (
								<div>
									<Label className="text-muted-foreground">Cancellation Reason</Label>
									<p className="mt-1 text-sm p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
										{selectedMovement.cancellationReason}
									</p>
								</div>
							)}

							{/* Completion Notes (if completed) */}
							{selectedMovement.status === "completed" && selectedMovement.completionNotes && (
								<div>
									<Label className="text-muted-foreground">Completion Notes</Label>
									<p className="mt-1 text-sm p-3 bg-muted/30 rounded-md">{selectedMovement.completionNotes}</p>
								</div>
							)}
						</div>
					) : null}
					<DialogFooter>
						<Button variant="outline" onClick={() => setDetailsModalOpen(false)}>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete/Cancel Movement Modal */}
			<Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Cancel Movement Request</DialogTitle>
						<DialogDescription>
							Are you sure you want to cancel the movement request for asset{" "}
							<strong>{deletingMovement?.assetId?.serialNumber}</strong>?
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<Label>Cancellation Reason (Optional)</Label>
						<Textarea
							placeholder="e.g., Client requested to keep asset at current location"
							value={cancellationReason}
							onChange={(e) => setCancellationReason(e.target.value)}
							className="mt-2"
							rows={3}
						/>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setDeleteModalOpen(false);
								setCancellationReason("");
							}}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() =>
								deletingMovement &&
								deleteMutation.mutate({ movementId: deletingMovement.id, reason: cancellationReason })
							}
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							Cancel Movement
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Start Movement Confirmation Modal */}
			<Dialog open={startModalOpen} onOpenChange={setStartModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Start Movement</DialogTitle>
						<DialogDescription>
							Are you sure you want to start the movement for asset{" "}
							<strong>{startingMovement?.assetId?.serialNumber}</strong>? This will clear the asset's registration data
							(QR code, location, etc.) and send a notification email.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setStartModalOpen(false)}>
							Cancel
						</Button>
						<Button
							onClick={() => startingMovement && startMutation.mutate(startingMovement.id)}
							disabled={startMutation.isPending}
						>
							{startMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							Start Movement
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Complete Movement Modal */}
			<Dialog open={completeModalOpen} onOpenChange={setCompleteModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Complete Movement</DialogTitle>
						<DialogDescription>
							Mark the movement for asset <strong>{completingMovement?.assetId?.serialNumber}</strong> as completed. The
							asset will become active at the new location.
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<Label>Completion Notes (Optional)</Label>
						<Textarea
							placeholder="e.g., Delivered successfully to Building A"
							value={completionNotes}
							onChange={(e) => setCompletionNotes(e.target.value)}
							className="mt-2"
							rows={3}
						/>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setCompleteModalOpen(false);
								setCompletionNotes("");
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={() =>
								completingMovement &&
								completeMutation.mutate({ movementId: completingMovement.id, notes: completionNotes })
							}
							disabled={completeMutation.isPending}
						>
							{completeMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							Complete Movement
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
