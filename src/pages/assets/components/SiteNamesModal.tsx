import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Loader2, MoreHorizontal, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import siteNameService, { type SiteName } from "@/api/services/siteNameService";
import { useCanWrite } from "@/store/userStore";
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
import { ImportSiteNamesModal } from "./ImportSiteNamesModal";

interface SiteNamesModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const ROWS_PER_PAGE = 5;

export function SiteNamesModal({ open, onOpenChange }: SiteNamesModalProps) {
	const queryClient = useQueryClient();
	const canWrite = useCanWrite();
	const [page, setPage] = useState(1);

	// Create state
	const [newSiteName, setNewSiteName] = useState("");
	const [newContactPerson, setNewContactPerson] = useState("");
	const [newContactPhone, setNewContactPhone] = useState("");

	// Edit modal state
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [editingSiteName, setEditingSiteName] = useState<SiteName | null>(null);
	const [editName, setEditName] = useState("");
	const [editContactPerson, setEditContactPerson] = useState("");
	const [editContactPhone, setEditContactPhone] = useState("");

	// Delete modal state
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [deletingSiteName, setDeletingSiteName] = useState<SiteName | null>(null);

	// Import modal state
	const [importModalOpen, setImportModalOpen] = useState(false);

	const { data, isLoading } = useQuery({
		queryKey: ["site-names", page, ROWS_PER_PAGE],
		queryFn: () => siteNameService.getSiteNames({ page, limit: ROWS_PER_PAGE, sortBy: "name:asc" }),
		enabled: open,
	});

	const createMutation = useMutation({
		mutationFn: () =>
			siteNameService.createSiteName({
				name: newSiteName.trim(),
				contactPerson: newContactPerson.trim() || undefined,
				contactPhone: newContactPhone.trim() || undefined,
			}),
		onSuccess: () => {
			toast.success("Site name created successfully");
			queryClient.invalidateQueries({ queryKey: ["site-names"] });
			setNewSiteName("");
			setNewContactPerson("");
			setNewContactPhone("");
		},
		onError: () => {},
	});

	const updateMutation = useMutation({
		mutationFn: ({
			siteNameId,
			data,
		}: {
			siteNameId: string;
			data: { name?: string; contactPerson?: string | null; contactPhone?: string | null };
		}) => siteNameService.updateSiteName(siteNameId, data),
		onSuccess: () => {
			toast.success("Site name updated successfully");
			queryClient.invalidateQueries({ queryKey: ["site-names"] });
			setEditModalOpen(false);
			setEditingSiteName(null);
		},
		onError: () => {},
	});

	const deleteMutation = useMutation({
		mutationFn: (siteNameId: string) => siteNameService.deleteSiteName(siteNameId),
		onSuccess: () => {
			toast.success("Site name deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["site-names"] });
			setDeleteModalOpen(false);
			setDeletingSiteName(null);
		},
		onError: () => {},
	});

	const siteNames = data?.results || [];
	const totalPages = data?.totalPages || 1;

	const handleCreateSiteName = () => {
		if (!newSiteName.trim()) {
			toast.error("Please enter a site name");
			return;
		}
		createMutation.mutate();
	};

	const handleEditClick = (siteName: SiteName) => {
		setEditingSiteName(siteName);
		setEditName(siteName.name);
		setEditContactPerson(siteName.contactPerson || "");
		setEditContactPhone(siteName.contactPhone || "");
		setEditModalOpen(true);
	};

	const handleEditSubmit = () => {
		if (!editingSiteName || !editName.trim()) return;
		updateMutation.mutate({
			siteNameId: editingSiteName.id,
			data: {
				name: editName.trim(),
				contactPerson: editContactPerson.trim() || null,
				contactPhone: editContactPhone.trim() || null,
			},
		});
	};

	const handleDeleteClick = (siteName: SiteName) => {
		setDeletingSiteName(siteName);
		setDeleteModalOpen(true);
	};

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Site Names</DialogTitle>
						<DialogDescription>Manage site names and on-site contact details for your assets</DialogDescription>
					</DialogHeader>

					{/* Add New Site Name Section */}
					{canWrite && (
						<div className="space-y-3 py-2 border rounded-md p-3 bg-muted/30">
							<div className="flex items-center justify-between">
								<Label className="text-sm font-semibold">Add New Site Name</Label>
								<Button variant="outline" size="sm" onClick={() => setImportModalOpen(true)}>
									<Upload className="h-4 w-4 mr-2" />
									Bulk Import
								</Button>
							</div>
							<div className="grid grid-cols-2 gap-2">
								<div className="col-span-2 space-y-1">
									<Label className="text-xs">Site Name *</Label>
									<Input
										placeholder="Enter site name..."
										value={newSiteName}
										onChange={(e) => setNewSiteName(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") handleCreateSiteName();
										}}
									/>
								</div>
								<div className="space-y-1">
									<Label className="text-xs">Contact Person (optional)</Label>
									<Input
										placeholder="e.g. John Dlamini"
										value={newContactPerson}
										onChange={(e) => setNewContactPerson(e.target.value)}
									/>
								</div>
								<div className="space-y-1">
									<Label className="text-xs">Contact Phone (optional)</Label>
									<Input
										placeholder="e.g. +27 82 555 0001"
										value={newContactPhone}
										onChange={(e) => setNewContactPhone(e.target.value)}
									/>
								</div>
							</div>
							<div className="flex justify-end">
								<Button onClick={handleCreateSiteName} disabled={createMutation.isPending}>
									{createMutation.isPending ? (
										<Loader2 className="h-4 w-4 animate-spin mr-1" />
									) : (
										<Plus className="h-4 w-4 mr-1" />
									)}
									Add Site Name
								</Button>
							</div>
						</div>
					)}

					{/* Site Names Table */}
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Contact Person</TableHead>
									<TableHead>Contact Phone</TableHead>
									<TableHead className="w-[50px]" />
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									Array.from({ length: 3 }).map((_, i) => (
										<TableRow key={`skeleton-${i}`}>
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
												<Skeleton className="h-8 w-8" />
											</TableCell>
										</TableRow>
									))
								) : siteNames.length === 0 ? (
									<TableRow>
										<TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
											No site names found. Create one above.
										</TableCell>
									</TableRow>
								) : (
									siteNames.map((siteName) => (
										<TableRow key={siteName.id}>
											<TableCell className="font-medium">{siteName.name}</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{siteName.contactPerson || <span className="text-muted-foreground/50">—</span>}
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{siteName.contactPhone || <span className="text-muted-foreground/50">—</span>}
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
																<DropdownMenuItem onClick={() => handleEditClick(siteName)}>
																	<Pencil className="h-4 w-4 mr-2" />
																	Edit
																</DropdownMenuItem>
																<DropdownMenuSeparator />
																<DropdownMenuItem
																	onClick={() => handleDeleteClick(siteName)}
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

						{totalPages > 0 && (
							<div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
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
										disabled={page === totalPages || totalPages === 0}
									>
										Next
										<ChevronRight className="h-4 w-4 ml-1" />
									</Button>
								</div>
							</div>
						)}
					</div>
				</DialogContent>
			</Dialog>

			{/* Edit Modal */}
			<Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Site Name</DialogTitle>
						<DialogDescription>Update the name and contact details for "{editingSiteName?.name}"</DialogDescription>
					</DialogHeader>
					<div className="space-y-3 py-2">
						<div className="space-y-1">
							<Label>Site Name *</Label>
							<Input
								value={editName}
								onChange={(e) => setEditName(e.target.value)}
								placeholder="Enter site name..."
								onKeyDown={(e) => {
									if (e.key === "Enter") handleEditSubmit();
								}}
							/>
						</div>
						<div className="space-y-1">
							<Label>
								Contact Person <span className="text-muted-foreground text-xs">(optional)</span>
							</Label>
							<Input
								value={editContactPerson}
								onChange={(e) => setEditContactPerson(e.target.value)}
								placeholder="e.g. John Dlamini"
							/>
						</div>
						<div className="space-y-1">
							<Label>
								Contact Phone <span className="text-muted-foreground text-xs">(optional)</span>
							</Label>
							<Input
								value={editContactPhone}
								onChange={(e) => setEditContactPhone(e.target.value)}
								placeholder="e.g. +27 82 555 0001"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setEditModalOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleEditSubmit} disabled={updateMutation.isPending}>
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
						<DialogTitle>Delete Site Name</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete the site name <strong>"{deletingSiteName?.name}"</strong>?
							<span className="block mt-2">This action cannot be undone.</span>
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => deletingSiteName && deleteMutation.mutate(deletingSiteName.id)}
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Import Site Names Modal */}
			<ImportSiteNamesModal open={importModalOpen} onOpenChange={setImportModalOpen} />
		</>
	);
}
