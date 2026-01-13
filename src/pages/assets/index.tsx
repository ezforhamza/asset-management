import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	AlertTriangle,
	ChevronLeft,
	ChevronRight,
	FolderOpen,
	Link2Off,
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
import assetCategoryService from "@/api/services/assetCategoryService";
import assetService, { type AssetsListParams, type UpdateAssetReq } from "@/api/services/assetService";
import { useCanWrite } from "@/store/userStore";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
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
import { CategoriesModal } from "./components/CategoriesModal";
import { CreateAssetModal } from "./components/CreateAssetModal";
import { ImportAssetsModal } from "./components/ImportAssetsModal";

/**
 * Check if an asset has incomplete registration data.
 * Shows flag if ANY of: unregistered, partially_registered, or missing/empty channel/siteName/client
 * Empty string ("") is treated as missing.
 */
const isAssetIncomplete = (asset: Asset): boolean => {
	const hasIncompleteRegistration =
		asset.registrationState === "unregistered" || asset.registrationState === "partially_registered";

	// Check for null, undefined, or empty string
	const isEmptyOrNull = (value: string | null | undefined): boolean =>
		value === null || value === undefined || value.trim() === "";

	const hasMissingFields = isEmptyOrNull(asset.channel) || isEmptyOrNull(asset.siteName) || isEmptyOrNull(asset.client);

	return hasIncompleteRegistration || hasMissingFields;
};

export default function AssetsPage() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const canWrite = useCanWrite();

	const [page, setPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");

	// Filter state
	const [categoryFilter, setCategoryFilter] = useState<string>("");
	const [clientFilter, setClientFilter] = useState<string>("");
	const [siteNameFilter, setSiteNameFilter] = useState<string>("");
	const [channelFilter, setChannelFilter] = useState<string>("");

	// Edit modal state
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
	const [editForm, setEditForm] = useState<UpdateAssetReq>({});

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

	// Detach QR confirmation state
	const [detachQrModalOpen, setDetachQrModalOpen] = useState(false);

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

	const updateMutation = useMutation({
		mutationFn: ({ assetId, data }: { assetId: string; data: UpdateAssetReq }) =>
			assetService.updateAsset(assetId, data),
		onSuccess: () => {
			toast.success("Asset updated successfully");
			// Invalidate both queries so filter options recompute from fresh data
			queryClient.invalidateQueries({ queryKey: ["assets"] });
			queryClient.invalidateQueries({ queryKey: ["assets-all-for-filters"] });
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
			// Invalidate both queries so filter options recompute from fresh data
			queryClient.invalidateQueries({ queryKey: ["assets"] });
			queryClient.invalidateQueries({ queryKey: ["assets-all-for-filters"] });
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
			// Invalidate both queries so filter options recompute from fresh data
			queryClient.invalidateQueries({ queryKey: ["assets"] });
			queryClient.invalidateQueries({ queryKey: ["assets-all-for-filters"] });
			setRetireModalOpen(false);
			setRetiringAsset(null);
		},
		onError: () => {
			toast.error("Failed to retire asset");
		},
	});

	const detachQrMutation = useMutation({
		mutationFn: (assetId: string) => assetService.detachQrCode(assetId),
		onSuccess: () => {
			toast.success("QR code detached successfully");
			// Invalidate queries to refresh asset data
			queryClient.invalidateQueries({ queryKey: ["assets"] });
			queryClient.invalidateQueries({ queryKey: ["assets-all-for-filters"] });
			setDetachQrModalOpen(false);
			setEditModalOpen(false);
			setEditingAsset(null);
		},
		onError: (error: Error & { response?: { data?: { message?: string } } }) => {
			const message = error.response?.data?.message || "Failed to detach QR code";
			toast.error(message);
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
			verificationFrequency: asset.verificationFrequency ?? undefined,
			geofenceThreshold: asset.geofenceThreshold ?? undefined,
			channel: asset.channel ?? "",
			siteName: asset.siteName ?? "",
			client: asset.client ?? "",
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
		// Build submit data per API contract
		// Only include geofenceThreshold if it's a valid number (omit when empty/undefined)
		const submitData: UpdateAssetReq = {
			verificationFrequency: editForm.verificationFrequency,
			client: editForm.client || "",
			channel: editForm.channel || "",
			siteName: editForm.siteName || "",
		};

		// Only include geofenceThreshold if it's a valid number
		if (typeof editForm.geofenceThreshold === "number" && !Number.isNaN(editForm.geofenceThreshold)) {
			submitData.geofenceThreshold = editForm.geofenceThreshold;
		}

		// Handle asset update
		await updateMutation.mutateAsync({
			assetId: getAssetId(editingAsset),
			data: submitData,
		});
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
						{canWrite && (
							<>
								<Button variant="outline" onClick={() => setImportModalOpen(true)}>
									<Upload className="h-4 w-4 mr-2" />
									Import Assets
								</Button>
								<Button onClick={() => setCreateModalOpen(true)}>
									<Plus className="h-4 w-4 mr-2" />
									Create Asset
								</Button>
							</>
						)}
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

			{/* Table */}
			<div className="flex-1 min-h-0 overflow-hidden px-6 py-4">
				<div className="rounded-md border flex flex-col h-full max-h-full overflow-hidden">
					<div className="flex-1 min-h-0 overflow-auto">
						<Table>
							<TableHeader className="sticky top-0 bg-background z-10">
								<TableRow>
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
									<TableHead>Registration</TableHead>
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
										<TableCell colSpan={12} className="text-center py-12 text-muted-foreground">
											No assets found
										</TableCell>
									</TableRow>
								) : (
									filteredAssets.map((asset) => (
										<TableRow
											key={getAssetId(asset)}
											className="cursor-pointer hover:bg-muted/50"
											onClick={(e) => {
												const target = e.target as HTMLElement;
												if (target.closest("button") || target.closest('[role="menuitem"]')) return;
												navigate(`/assets/${getAssetId(asset)}/history`);
											}}
										>
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
												{isAssetIncomplete(asset) ? (
													<Badge className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 gap-1">
														<AlertTriangle className="h-3 w-3" />
														Incomplete
													</Badge>
												) : (
													<Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Complete</Badge>
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
														{canWrite ? (
															<>
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
															</>
														) : (
															<DropdownMenuItem disabled>No actions available (Read-only)</DropdownMenuItem>
														)}
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
						{/* Read-only asset info */}
						<div className="p-3 bg-muted/50 rounded-md space-y-1">
							<p className="text-sm text-muted-foreground">
								Serial Number: <span className="font-medium text-foreground">{editingAsset?.serialNumber}</span>
							</p>
							<p className="text-sm text-muted-foreground">
								Make / Model:{" "}
								<span className="font-medium text-foreground">
									{editingAsset?.make} {editingAsset?.model}
								</span>
							</p>
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
						<div className="space-y-2">
							<Label>Channel</Label>
							<Input
								placeholder="Enter channel"
								value={editForm.channel || ""}
								onChange={(e) => setEditForm({ ...editForm, channel: e.target.value })}
							/>
						</div>
						<div className="space-y-2">
							<Label>Site Name</Label>
							<Input
								placeholder="Enter site name"
								value={editForm.siteName || ""}
								onChange={(e) => setEditForm({ ...editForm, siteName: e.target.value })}
							/>
						</div>
						<div className="space-y-2">
							<Label>Client</Label>
							<Input
								placeholder="Enter client"
								value={editForm.client || ""}
								onChange={(e) => setEditForm({ ...editForm, client: e.target.value })}
							/>
						</div>

						{/* Detach QR Code Section - Only visible if asset has QR code */}
						{editingAsset?.qrCode && (
							<div className="pt-4 border-t">
								<div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg">
									<div className="flex items-center gap-2">
										<AlertTriangle className="h-4 w-4 text-orange-600" />
										<div>
											<p className="text-sm font-medium">QR Code Linked</p>
											<p className="text-xs text-muted-foreground font-mono">{editingAsset.qrCode.code}</p>
										</div>
									</div>
									<Button variant="destructive" size="sm" onClick={() => setDetachQrModalOpen(true)}>
										<Link2Off className="h-4 w-4 mr-2" />
										Detach QR Code
									</Button>
								</div>
							</div>
						)}
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setEditModalOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleUpdateSubmit} disabled={updateMutation.isPending}>
							{updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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

			{/* Detach QR Code Confirmation Modal */}
			<Dialog open={detachQrModalOpen} onOpenChange={setDetachQrModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5 text-destructive" />
							Detach QR Code?
						</DialogTitle>
						<DialogDescription className="space-y-3 pt-2">
							<p>
								You are about to detach the QR code from asset <strong>{editingAsset?.serialNumber}</strong>.
							</p>
							<div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
								<p className="font-medium">Warning: This action cannot be undone.</p>
								<ul className="list-disc list-inside mt-2 space-y-1">
									<li>The asset's registration will be removed</li>
									<li>All verification history will be cleared</li>
									<li>You will need to re-register the asset with a new QR code</li>
								</ul>
							</div>
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDetachQrModalOpen(false)} disabled={detachQrMutation.isPending}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => editingAsset && detachQrMutation.mutate(getAssetId(editingAsset))}
							disabled={detachQrMutation.isPending}
						>
							{detachQrMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							Detach QR Code
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
