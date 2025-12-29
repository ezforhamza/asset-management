import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ChevronLeft,
	ChevronRight,
	FileSpreadsheet,
	Loader2,
	MoreHorizontal,
	Pencil,
	Plus,
	Search,
	Trash2,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Asset } from "#/entity";
import assetService, { type UpdateAssetReq } from "@/api/services/assetService";
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
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { AssetImport } from "../settings/components/AssetImport";
import { AssetTemplates } from "../settings/components/AssetTemplates";

export default function AssetsPage() {
	const queryClient = useQueryClient();
	const [page, setPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");
	const [importModalOpen, setImportModalOpen] = useState(false);
	const [templateModalOpen, setTemplateModalOpen] = useState(false);

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

	const limit = 20;

	const { data, isLoading } = useQuery({
		queryKey: ["assets", page, limit],
		queryFn: () => assetService.getAssets({ page, limit }),
	});

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

	const handleUpdateSubmit = () => {
		if (!editingAsset) return;
		updateMutation.mutate({ assetId: getAssetId(editingAsset), data: editForm });
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
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h1 className="text-xl font-semibold">Assets</h1>
						<p className="text-sm text-muted-foreground">View and manage your company assets</p>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="outline" onClick={() => setImportModalOpen(true)}>
							<FileSpreadsheet className="h-4 w-4 mr-2" />
							Import
						</Button>
						<Button variant="outline" onClick={() => setTemplateModalOpen(true)}>
							<Plus className="h-4 w-4 mr-2" />
							Template
						</Button>
					</div>
				</div>
			</div>

			{/* Search */}
			<div className="flex-shrink-0 px-6 py-4 border-b">
				<div className="relative max-w-md">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search by serial number, make, or model..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>
			</div>

			{/* Results count */}
			<div className="flex-shrink-0 flex items-center justify-between px-6 py-2 bg-muted/30">
				<p className="text-sm text-muted-foreground">
					{isLoading ? "Loading..." : `Showing ${filteredAssets.length} of ${totalResults} assets`}
				</p>
			</div>

			{/* Table */}
			<div className="flex-1 overflow-auto px-6 py-4">
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Serial Number</TableHead>
								<TableHead>Make / Model</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Verification</TableHead>
								<TableHead>Frequency</TableHead>
								<TableHead className="w-[50px]" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								Array.from({ length: 10 }).map((_, i) => (
									<TableRow key={`skeleton-${i}`}>
										<TableCell>
											<Skeleton className="h-4 w-24" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 w-32" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-5 w-16" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-5 w-20" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 w-16" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-8 w-8" />
										</TableCell>
									</TableRow>
								))
							) : filteredAssets.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
										No assets found
									</TableCell>
								</TableRow>
							) : (
								filteredAssets.map((asset) => (
									<TableRow key={getAssetId(asset)}>
										<TableCell className="font-mono text-sm">{asset.serialNumber}</TableCell>
										<TableCell>
											{asset.make} {asset.model}
										</TableCell>
										<TableCell>{getStatusBadge(asset.status)}</TableCell>
										<TableCell>{getVerificationBadge(asset.verificationStatus || "unknown")}</TableCell>
										<TableCell className="text-muted-foreground">{asset.verificationFrequency} days</TableCell>
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

					{/* Pagination inside table container */}
					{totalPages > 0 && (
						<div className="flex items-center justify-between px-4 py-3 border-t">
							<p className="text-sm text-muted-foreground">
								Page {page} of {totalPages}
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
									disabled={page === totalPages}
								>
									Next
									<ChevronRight className="h-4 w-4 ml-1" />
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Import Modal */}
			<Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
				<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Bulk Asset Import</DialogTitle>
					</DialogHeader>
					<AssetImport />
				</DialogContent>
			</Dialog>

			{/* Template Modal */}
			<Dialog open={templateModalOpen} onOpenChange={setTemplateModalOpen}>
				<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Asset Templates</DialogTitle>
					</DialogHeader>
					<AssetTemplates />
				</DialogContent>
			</Dialog>

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
						<div className="space-y-2">
							<Label>Verification Frequency (days)</Label>
							<Input
								type="number"
								min={1}
								value={editForm.verificationFrequency || ""}
								onChange={(e) =>
									setEditForm({ ...editForm, verificationFrequency: parseInt(e.target.value) || undefined })
								}
							/>
						</div>
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
		</div>
	);
}
