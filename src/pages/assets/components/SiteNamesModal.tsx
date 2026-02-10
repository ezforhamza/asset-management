import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ChevronLeft,
	ChevronRight,
	Loader2,
	MoreHorizontal,
	Pencil,
	Plus,
	Trash2,
} from "lucide-react";
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

interface SiteNamesModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const ROWS_PER_PAGE = 5;

export function SiteNamesModal({ open, onOpenChange }: SiteNamesModalProps) {
	const queryClient = useQueryClient();
	const canWrite = useCanWrite();
	const [page, setPage] = useState(1);
	const [newSiteName, setNewSiteName] = useState("");

	// Rename modal state
	const [renameModalOpen, setRenameModalOpen] = useState(false);
	const [renamingSiteName, setRenamingSiteName] = useState<SiteName | null>(null);
	const [newName, setNewName] = useState("");

	// Delete modal state
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [deletingSiteName, setDeletingSiteName] = useState<SiteName | null>(null);

	// Fetch site names
	const { data, isLoading } = useQuery({
		queryKey: ["site-names", page, ROWS_PER_PAGE],
		queryFn: () => siteNameService.getSiteNames({ page, limit: ROWS_PER_PAGE, sortBy: "name:asc" }),
		enabled: open,
	});

	// Create site name mutation
	const createMutation = useMutation({
		mutationFn: (name: string) => siteNameService.createSiteName({ name }),
		onSuccess: () => {
			toast.success("Site name created successfully");
			queryClient.invalidateQueries({ queryKey: ["site-names"] });
			setNewSiteName("");
		},
		onError: () => {
			// Error toast is handled by apiClient;
		},
	});

	// Update site name mutation
	const updateMutation = useMutation({
		mutationFn: ({
			siteNameId,
			data,
		}: {
			siteNameId: string;
			data: { name: string };
		}) => siteNameService.updateSiteName(siteNameId, data),
		onSuccess: () => {
			toast.success("Site name updated successfully");
			queryClient.invalidateQueries({ queryKey: ["site-names"] });
			setRenameModalOpen(false);
			setRenamingSiteName(null);
		},
		onError: () => {
			// Error toast is handled by apiClient;
		},
	});

	// Delete site name mutation
	const deleteMutation = useMutation({
		mutationFn: (siteNameId: string) => siteNameService.deleteSiteName(siteNameId),
		onSuccess: () => {
			toast.success("Site name deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["site-names"] });
			setDeleteModalOpen(false);
			setDeletingSiteName(null);
		},
		onError: () => {
			// Error toast is handled by apiClient;
		},
	});

	const siteNames = data?.results || [];
	const totalPages = data?.totalPages || 1;

	const handleCreateSiteName = () => {
		if (!newSiteName.trim()) {
			toast.error("Please enter a site name");
			return;
		}
		createMutation.mutate(newSiteName.trim());
	};

	const handleRenameClick = (siteName: SiteName) => {
		setRenamingSiteName(siteName);
		setNewName(siteName.name);
		setRenameModalOpen(true);
	};

	const handleRenameSubmit = () => {
		if (!renamingSiteName || !newName.trim()) return;
		updateMutation.mutate({ siteNameId: renamingSiteName.id, data: { name: newName.trim() } });
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
						<DialogDescription>Manage site names for organizing your assets</DialogDescription>
					</DialogHeader>

					{/* Add New Site Name Section */}
					{canWrite && (
						<div className="space-y-3 py-2">
							<Label>Add New Site Name</Label>
							<div className="flex gap-2">
								<Input
									placeholder="Enter site name..."
									value={newSiteName}
									onChange={(e) => setNewSiteName(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") handleCreateSiteName();
									}}
								/>
								<Button onClick={handleCreateSiteName} disabled={createMutation.isPending}>
									{createMutation.isPending ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Plus className="h-4 w-4" />
									)}
									<span className="ml-1">Add</span>
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
									<TableHead>Created At</TableHead>
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
												<Skeleton className="h-8 w-8" />
											</TableCell>
										</TableRow>
									))
								) : siteNames.length === 0 ? (
									<TableRow>
										<TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
											No site names found. Create one above.
										</TableCell>
									</TableRow>
								) : (
									siteNames.map((siteName) => (
										<TableRow key={siteName.id}>
											<TableCell className="font-medium">{siteName.name}</TableCell>
											<TableCell className="text-muted-foreground text-sm">
												{new Date(siteName.createdAt).toLocaleDateString()}
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
																<DropdownMenuItem onClick={() => handleRenameClick(siteName)}>
																	<Pencil className="h-4 w-4 mr-2" />
																	Rename
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

						{/* Pagination Footer */}
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

			{/* Rename Modal */}
			<Dialog open={renameModalOpen} onOpenChange={setRenameModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Rename Site Name</DialogTitle>
						<DialogDescription>Enter a new name for the site "{renamingSiteName?.name}"</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<Label>New Name</Label>
						<Input
							value={newName}
							onChange={(e) => setNewName(e.target.value)}
							placeholder="Enter new site name..."
							className="mt-2"
							onKeyDown={(e) => {
								if (e.key === "Enter") handleRenameSubmit();
							}}
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setRenameModalOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleRenameSubmit} disabled={updateMutation.isPending}>
							{updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							Save
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
		</>
	);
}
