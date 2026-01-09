import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ChevronLeft,
	ChevronRight,
	FolderOpen,
	Loader2,
	MapPin,
	MoreHorizontal,
	Pencil,
	Plus,
	Search,
	Trash2,
	Upload,
	X,
	XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import type { Asset } from "#/entity";
import allocationService from "@/api/services/allocationService";
import assetCategoryService from "@/api/services/assetCategoryService";
import assetService, { type AssetsListParams, type UpdateAssetReq } from "@/api/services/assetService";
import userService from "@/api/services/userService";
import { useUserInfo } from "@/store/userStore";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Checkbox } from "@/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { AllocateAssetsModal } from "./components/AllocateAssetsModal";
import { BulkAllocationToolbar } from "./components/BulkAllocationToolbar";
import { CategoriesModal } from "./components/CategoriesModal";
import { CreateAssetModal } from "./components/CreateAssetModal";
import { ImportAssetsModal } from "./components/ImportAssetsModal";
import { UnallocateAssetsModal } from "./components/UnallocateAssetsModal";

export default function AssetsPage() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const userInfo = useUserInfo();
	const isAdmin = userInfo.role === "customer_admin" || userInfo.role === "system_admin";

	const [page, setPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");

	// Filter state
	const [categoryFilter, setCategoryFilter] = useState<string>("");
	const [clientFilter, setClientFilter] = useState<string>("");
	const [siteNameFilter, setSiteNameFilter] = useState<string>("");
	const [channelFilter, setChannelFilter] = useState<string>("");

	// Selection state
	const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);

	// Edit modal state
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
	const [editForm, setEditForm] = useState<UpdateAssetReq & { allocatedTo?: string | null }>({});

	// Delete modal state
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null);

	// Retire modal state
	const [retireModalOpen, setRetireModalOpen] = useState(false);
	const [retiringAsset, setRetiringAsset] = useState<Asset | null>(null);

	// Categories modal state
	const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);

	// Import assets modal state
	const [importModalOpen, setImportModalOpen] = useState(false);

	// Create asset modal state
	const [createModalOpen, setCreateModalOpen] = useState(false);

	// Allocation modals
	const [allocateModalOpen, setAllocateModalOpen] = useState(false);
	const [allocateMode, setAllocateMode] = useState<"allocate" | "reassign">("allocate");
	const [unallocateModalOpen, setUnallocateModalOpen] = useState(false);

	const limit = 8;

	// Build query params with filters
	const queryParams: AssetsListParams = useMemo(() => {
		const params: AssetsListParams = { page, limit };
		if (categoryFilter) params.categoryId = categoryFilter;
		if (clientFilter) params.client = clientFilter;
		if (siteNameFilter) params.siteName = siteNameFilter;
		if (channelFilter) params.channel = channelFilter;
		return params;
	}, [page, categoryFilter, clientFilter, siteNameFilter, channelFilter]);

	const { data, isLoading } = useQuery({
		queryKey: ["assets", queryParams],
		queryFn: () => assetService.getAssets(queryParams),
	});

	// Fetch categories for filter dropdown
	const { data: categoriesData } = useQuery({
		queryKey: ["asset-categories", 1, 100],
		queryFn: () => assetCategoryService.getCategories({ page: 1, limit: 100 }),
	});

	// Fetch all assets to extract unique filter values (client, siteName, channel)
	const { data: allAssetsData } = useQuery({
		queryKey: ["assets-all-for-filters"],
		queryFn: () => assetService.getAssets({ page: 1, limit: 1000 }),
	});

	// Extract unique filter values from all assets
	const filterOptions = useMemo(() => {
		const allAssets = allAssetsData?.results || [];
		const clients = [...new Set(allAssets.map((a) => a.client).filter(Boolean))] as string[];
		const siteNames = [...new Set(allAssets.map((a) => a.siteName).filter(Boolean))] as string[];
		const channels = [...new Set(allAssets.map((a) => a.channel).filter(Boolean))] as string[];
		return { clients, siteNames, channels };
	}, [allAssetsData]);

	// Fetch field workers for allocation dropdown
	const { data: fieldWorkersData } = useQuery({
		queryKey: ["users", 1, 1000],
		queryFn: () => userService.getUsers({ page: 1, limit: 1000 }),
		enabled: isAdmin,
	});

	const fieldWorkers = fieldWorkersData?.results?.filter((u) => u.role === "field_user") || [];

	const updateMutation = useMutation({
		mutationFn: ({ assetId, data }: { assetId: string; data: UpdateAssetReq }) =>
			assetService.updateAsset(assetId, data),
		onSuccess: () => {
			toast.success("Asset updated successfully");
			queryClient.invalidateQueries({ queryKey: ["assets"] });
			setEditModalOpen(false);
			setEditingAsset(null);
		},
		onError: () => {
			toast.error("Failed to update asset");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (assetId: string) => assetService.deleteAsset(assetId),
		onSuccess: () => {
			toast.success("Asset deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["assets"] });
			setDeleteModalOpen(false);
			setDeletingAsset(null);
		},
		onError: () => {
			toast.error("Failed to delete asset");
		},
	});

	const retireMutation = useMutation({
		mutationFn: (assetId: string) => assetService.retireAsset(assetId),
		onSuccess: () => {
			toast.success("Asset retired successfully");
			queryClient.invalidateQueries({ queryKey: ["assets"] });
			setRetireModalOpen(false);
			setRetiringAsset(null);
		},
		onError: () => {
			toast.error("Failed to retire asset");
		},
	});

	const allocationMutation = useMutation({
		mutationFn: async ({
			assetId,
			newFieldWorkerId,
			oldFieldWorkerId,
		}: {
			assetId: string;
			newFieldWorkerId: string | null;
			oldFieldWorkerId: string | null;
		}) => {
			// Unassigned → Assigned
			if (!oldFieldWorkerId && newFieldWorkerId) {
				return allocationService.allocateAssets({
					assetIds: [assetId],
					fieldWorkerId: newFieldWorkerId,
				});
			}
			// Assigned → Unassigned
			if (oldFieldWorkerId && !newFieldWorkerId) {
				return allocationService.unallocateAssets({ assetIds: [assetId] });
			}
			// Worker A → Worker B
			if (oldFieldWorkerId && newFieldWorkerId && oldFieldWorkerId !== newFieldWorkerId) {
				return allocationService.reassignAssets({
					assetIds: [assetId],
					newFieldWorkerId,
				});
			}
			return Promise.resolve();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["assets"] });
			queryClient.invalidateQueries({ queryKey: ["allocation-summary"] });
		},
	});

	const assets = data?.results || [];
	const totalPages = data?.totalPages || 1;
	const totalResults = data?.totalResults || 0;

	// Client-side search filter
	const filteredAssets = searchQuery
		? assets.filter(
				(asset) =>
					asset.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					asset.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					asset.model?.toLowerCase().includes(searchQuery.toLowerCase()),
			)
		: assets;

	// Helper to get asset ID (API returns 'id', some places use '_id')
	const getAssetId = (asset: Asset) => asset.id || asset._id || "";

	const handleEditClick = (asset: Asset) => {
		setEditingAsset(asset);
		setEditForm({
			serialNumber: asset.serialNumber,
			make: asset.make,
			model: asset.model,
			status: asset.status,
			verificationFrequency: asset.verificationFrequency ?? undefined,
			geofenceThreshold: asset.geofenceThreshold ?? undefined,
			allocatedTo: asset.allocatedTo || null,
		});
		setEditModalOpen(true);
	};

	const handleDeleteClick = (asset: Asset) => {
		setDeletingAsset(asset);
		setDeleteModalOpen(true);
	};

	const handleRetireClick = (asset: Asset) => {
		setRetiringAsset(asset);
		setRetireModalOpen(true);
	};

	const handleUpdateSubmit = async () => {
		if (!editingAsset) return;
		// Build submit data - only include geofenceThreshold if it has a value
		// Backend must support geofenceThreshold field for this to work
		const submitData: UpdateAssetReq = {
			serialNumber: editForm.serialNumber,
			make: editForm.make,
			model: editForm.model,
			status: editForm.status,
			verificationFrequency: editForm.verificationFrequency,
		};
		// Only include geofenceThreshold if it's explicitly set (not undefined)
		if (editForm.geofenceThreshold !== undefined) {
			submitData.geofenceThreshold = editForm.geofenceThreshold;
		}

		// Handle asset update
		await updateMutation.mutateAsync({
			assetId: getAssetId(editingAsset),
			data: submitData,
		});

		// Handle allocation change if admin
		if (isAdmin && editForm.allocatedTo !== editingAsset.allocatedTo) {
			await allocationMutation.mutateAsync({
				assetId: getAssetId(editingAsset),
				newFieldWorkerId: editForm.allocatedTo || null,
				oldFieldWorkerId: editingAsset.allocatedTo || null,
			});
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "active":
				return <Badge variant="default">Active</Badge>;
			case "retired":
				return <Badge variant="secondary">Retired</Badge>;
			case "transferred":
				return <Badge variant="outline">Transferred</Badge>;
			default:
				return <Badge variant="secondary">{status}</Badge>;
		}
	};

	const getVerificationBadge = (status: string) => {
		switch (status) {
			case "verified":
				return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Verified</Badge>;
			case "due_soon":
				return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">Due Soon</Badge>;
			case "overdue":
				return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">Overdue</Badge>;
			case "never_verified":
				return <Badge variant="outline">Never Verified</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	// Bulk selection handlers
	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedAssetIds(filteredAssets.map((a) => getAssetId(a)));
		} else {
			setSelectedAssetIds([]);
		}
	};

	const handleSelectAsset = (assetId: string, checked: boolean) => {
		if (checked) {
			setSelectedAssetIds((prev) => [...prev, assetId]);
		} else {
			setSelectedAssetIds((prev) => prev.filter((id) => id !== assetId));
		}
	};

	const handleBulkAllocate = () => {
		setAllocateMode("allocate");
		setAllocateModalOpen(true);
	};

	const handleBulkReassign = () => {
		setAllocateMode("reassign");
		setAllocateModalOpen(true);
	};

	const handleBulkUnallocate = () => {
		setUnallocateModalOpen(true);
	};

	const handleClearSelection = () => {
		setSelectedAssetIds([]);
	};

	const allSelected = filteredAssets.length > 0 && selectedAssetIds.length === filteredAssets.length;
	const someSelected = selectedAssetIds.length > 0 && !allSelected;

	return (
		<div className="h-full flex flex-col overflow-hidden">
			{/* Header */}
			<div className="flex-shrink-0 px-6 py-4 border-b bg-card/50">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-xl font-semibold">Assets</h1>
						<p className="text-sm text-muted-foreground">View and manage your company assets</p>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="outline" onClick={() => setCategoriesModalOpen(true)}>
							<FolderOpen className="h-4 w-4 mr-2" />
							Categories
						</Button>
						<Button variant="outline" onClick={() => setImportModalOpen(true)}>
							<Upload className="h-4 w-4 mr-2" />
							Import Assets
						</Button>
						<Button onClick={() => setCreateModalOpen(true)}>
							<Plus className="h-4 w-4 mr-2" />
							Create Asset
						</Button>
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
							placeholder="Search by serial number, make, or model..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
						/>
					</div>

					{/* Category Filter */}
					<Select
						value={categoryFilter}
						onValueChange={(val) => {
							setCategoryFilter(val);
							setPage(1);
						}}
					>
						<SelectTrigger className="w-[160px]">
							<SelectValue placeholder="Category" />
						</SelectTrigger>
						<SelectContent>
							{categoriesData?.results
								?.filter((c) => c.status === "active")
								.map((category) => (
									<SelectItem key={category.id} value={category.id}>
										{category.name}
									</SelectItem>
								))}
							{(!categoriesData?.results ||
								categoriesData.results.filter((c) => c.status === "active").length === 0) && (
								<div className="px-2 py-1.5 text-sm text-muted-foreground">No categories</div>
							)}
						</SelectContent>
					</Select>

					{/* Client Filter */}
					<Select
						value={clientFilter}
						onValueChange={(val) => {
							setClientFilter(val);
							setPage(1);
						}}
					>
						<SelectTrigger className="w-[140px]">
							<SelectValue placeholder="Client" />
						</SelectTrigger>
						<SelectContent>
							{filterOptions.clients.map((client) => (
								<SelectItem key={client} value={client}>
									{client}
								</SelectItem>
							))}
							{filterOptions.clients.length === 0 && (
								<div className="px-2 py-1.5 text-sm text-muted-foreground">No clients</div>
							)}
						</SelectContent>
					</Select>

					{/* Site Name Filter */}
					<Select
						value={siteNameFilter}
						onValueChange={(val) => {
							setSiteNameFilter(val);
							setPage(1);
						}}
					>
						<SelectTrigger className="w-[140px]">
							<SelectValue placeholder="Site Name" />
						</SelectTrigger>
						<SelectContent>
							{filterOptions.siteNames.map((siteName) => (
								<SelectItem key={siteName} value={siteName}>
									{siteName}
								</SelectItem>
							))}
							{filterOptions.siteNames.length === 0 && (
								<div className="px-2 py-1.5 text-sm text-muted-foreground">No sites</div>
							)}
						</SelectContent>
					</Select>

					{/* Channel Filter */}
					<Select
						value={channelFilter}
						onValueChange={(val) => {
							setChannelFilter(val);
							setPage(1);
						}}
					>
						<SelectTrigger className="w-[140px]">
							<SelectValue placeholder="Channel" />
						</SelectTrigger>
						<SelectContent>
							{filterOptions.channels.map((channel) => (
								<SelectItem key={channel} value={channel}>
									{channel}
								</SelectItem>
							))}
							{filterOptions.channels.length === 0 && (
								<div className="px-2 py-1.5 text-sm text-muted-foreground">No channels</div>
							)}
						</SelectContent>
					</Select>

					{/* Clear Filters */}
					{(categoryFilter || clientFilter || siteNameFilter || channelFilter) && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								setCategoryFilter("");
								setClientFilter("");
								setSiteNameFilter("");
								setChannelFilter("");
								setPage(1);
							}}
						>
							<X className="h-4 w-4 mr-1" />
							Clear Filters
						</Button>
					)}
				</div>
			</div>

			{/* Results count */}
			<div className="flex-shrink-0 flex items-center justify-between px-6 py-2 bg-muted/30">
				<p className="text-sm text-muted-foreground">
					{isLoading ? "Loading..." : `Showing ${filteredAssets.length} of ${totalResults} assets`}
				</p>
			</div>

			{/* Bulk Allocation Toolbar */}
			{isAdmin && (
				<BulkAllocationToolbar
					selectedCount={selectedAssetIds.length}
					onAllocate={handleBulkAllocate}
					onReassign={handleBulkReassign}
					onUnallocate={handleBulkUnallocate}
					onClearSelection={handleClearSelection}
				/>
			)}

			{/* Table */}
			<div className="flex-1 min-h-0 overflow-hidden px-6 py-4">
				<div className="rounded-md border flex flex-col h-full max-h-full overflow-hidden">
					<div className="flex-1 min-h-0 overflow-auto">
						<Table>
							<TableHeader className="sticky top-0 bg-background z-10">
								<TableRow>
									{isAdmin && (
										<TableHead className="w-[50px]">
											<Checkbox checked={allSelected || someSelected} onCheckedChange={handleSelectAll} />
										</TableHead>
									)}
									<TableHead>Serial Number</TableHead>
									<TableHead>Make / Model</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>QR Code</TableHead>
									<TableHead>Registered GPS</TableHead>
									<TableHead>Site Name</TableHead>
									<TableHead>Channel</TableHead>
									<TableHead>Client</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Verification</TableHead>
									<TableHead>Assigned To</TableHead>
									<TableHead className="w-[50px]" />
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									Array.from({ length: 8 }).map((_, i) => (
										<TableRow key={`skeleton-${i}`}>
											<TableCell>
												<Skeleton className="h-4 w-24" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-32" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-20" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-24" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-20" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-20" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-16" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-16" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-5 w-16" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-5 w-20" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-8 w-8" />
											</TableCell>
										</TableRow>
									))
								) : filteredAssets.length === 0 ? (
									<TableRow>
										<TableCell colSpan={isAdmin ? 13 : 12} className="text-center py-12 text-muted-foreground">
											No assets found
										</TableCell>
									</TableRow>
								) : (
									filteredAssets.map((asset) => (
										<TableRow key={getAssetId(asset)}>
											{isAdmin && (
												<TableCell>
													<Checkbox
														checked={selectedAssetIds.includes(getAssetId(asset))}
														onCheckedChange={(checked) => handleSelectAsset(getAssetId(asset), !!checked)}
													/>
												</TableCell>
											)}
											<TableCell className="font-mono text-sm">{asset.serialNumber}</TableCell>
											<TableCell>
												{asset.make} {asset.model}
											</TableCell>
											<TableCell className="text-muted-foreground">{asset.category?.name || "Not assigned"}</TableCell>
											<TableCell className="font-mono text-xs">{asset.qrCode?.code || "Not linked"}</TableCell>
											<TableCell>
												{asset.location?.mapLink ? (
													<Button
														variant="ghost"
														size="sm"
														className="h-7 px-2 text-xs"
														onClick={() => navigate(`/map?assetId=${getAssetId(asset)}`)}
													>
														<MapPin className="h-3 w-3 mr-1" />
														View on Map
													</Button>
												) : (
													<span className="text-muted-foreground text-sm">No GPS</span>
												)}
											</TableCell>
											<TableCell className="text-muted-foreground">{asset.siteName || "—"}</TableCell>
											<TableCell className="text-muted-foreground">{asset.channel || "—"}</TableCell>
											<TableCell className="text-muted-foreground">{asset.client || "—"}</TableCell>
											<TableCell>{getStatusBadge(asset.status)}</TableCell>
											<TableCell>{getVerificationBadge(asset.verificationStatus || "never_verified")}</TableCell>
											<TableCell>
												{asset.allocatedTo ? (
													<Badge variant="secondary" className="text-xs">
														Assigned
													</Badge>
												) : (
													<span className="text-muted-foreground text-sm">Unassigned</span>
												)}
											</TableCell>
											<TableCell>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon" className="h-8 w-8">
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem onClick={() => handleEditClick(asset)}>
															<Pencil className="h-4 w-4 mr-2" />
															Edit
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => handleRetireClick(asset)}
															disabled={asset.status === "retired"}
														>
															<XCircle className="h-4 w-4 mr-2" />
															Retire
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															onClick={() => handleDeleteClick(asset)}
															className="text-destructive focus:text-destructive"
														>
															<Trash2 className="h-4 w-4 mr-2" />
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>

					{/* Pagination Footer - Always visible */}
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

			{/* Edit Modal */}
			<Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Asset</DialogTitle>
						<DialogDescription>Update the details for asset {editingAsset?.serialNumber}</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label>Serial Number</Label>
							<Input
								value={editForm.serialNumber || ""}
								onChange={(e) => setEditForm({ ...editForm, serialNumber: e.target.value })}
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>Make</Label>
								<Input
									value={editForm.make || ""}
									onChange={(e) => setEditForm({ ...editForm, make: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<Label>Model</Label>
								<Input
									value={editForm.model || ""}
									onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
								/>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>Verification Frequency (days)</Label>
								<Input
									type="number"
									min={1}
									value={editForm.verificationFrequency || ""}
									onChange={(e) =>
										setEditForm({
											...editForm,
											verificationFrequency: parseInt(e.target.value) || undefined,
										})
									}
								/>
							</div>
							<div className="space-y-2">
								<Label>Geofence Threshold (meters)</Label>
								<Input
									type="number"
									min={0}
									placeholder="Optional"
									value={editForm.geofenceThreshold ?? ""}
									onChange={(e) =>
										setEditForm({
											...editForm,
											geofenceThreshold: e.target.value ? parseInt(e.target.value) : undefined,
										})
									}
								/>
							</div>
						</div>
						{isAdmin && (
							<div className="space-y-2">
								<Label>Assigned Field Worker</Label>
								<Select
									value={editForm.allocatedTo || "unassigned"}
									onValueChange={(val) =>
										setEditForm({
											...editForm,
											allocatedTo: val === "unassigned" ? null : val,
										})
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select field worker" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="unassigned">Unassigned</SelectItem>
										{fieldWorkers.map((worker) => (
											<SelectItem key={worker.id} value={worker.id}>
												{worker.name} ({worker.email})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setEditModalOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleUpdateSubmit} disabled={updateMutation.isPending || allocationMutation.isPending}>
							{(updateMutation.isPending || allocationMutation.isPending) && (
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							)}
							Save Changes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Modal */}
			<Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Asset</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete asset <strong>{deletingAsset?.serialNumber}</strong>? This action cannot
							be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => deletingAsset && deleteMutation.mutate(getAssetId(deletingAsset))}
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							Delete Asset
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Retire Confirmation Modal */}
			<Dialog open={retireModalOpen} onOpenChange={setRetireModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Retire Asset</DialogTitle>
						<DialogDescription>
							Are you sure you want to retire asset <strong>{retiringAsset?.serialNumber}</strong>? This will change the
							asset status to retired.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setRetireModalOpen(false)}>
							Cancel
						</Button>
						<Button
							onClick={() => retiringAsset && retireMutation.mutate(getAssetId(retiringAsset))}
							disabled={retireMutation.isPending}
						>
							{retireMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							Retire Asset
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Categories Modal */}
			<CategoriesModal open={categoriesModalOpen} onOpenChange={setCategoriesModalOpen} />

			{/* Import Assets Modal */}
			<ImportAssetsModal open={importModalOpen} onOpenChange={setImportModalOpen} />

			{/* Create Asset Modal */}
			<CreateAssetModal open={createModalOpen} onOpenChange={setCreateModalOpen} />

			{/* Allocation Modals */}
			{isAdmin && (
				<>
					<AllocateAssetsModal
						open={allocateModalOpen}
						onOpenChange={(open) => {
							setAllocateModalOpen(open);
							if (!open) setSelectedAssetIds([]);
						}}
						assetIds={selectedAssetIds}
						mode={allocateMode}
					/>
					<UnallocateAssetsModal
						open={unallocateModalOpen}
						onOpenChange={(open) => {
							setUnallocateModalOpen(open);
							if (!open) setSelectedAssetIds([]);
						}}
						assetIds={selectedAssetIds}
					/>
				</>
			)}
		</div>
	);
}
