import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ChevronLeft,
	ChevronRight,
	Loader2,
	MoreHorizontal,
	Pencil,
	Plus,
	Power,
	PowerOff,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import assetCategoryService, { type AssetCategory } from "@/api/services/assetCategoryService";
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
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

interface CategoriesModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const ROWS_PER_PAGE = 5;

export function CategoriesModal({ open, onOpenChange }: CategoriesModalProps) {
	const queryClient = useQueryClient();
	const canWrite = useCanWrite();
	const [page, setPage] = useState(1);
	const [newCategoryName, setNewCategoryName] = useState("");

	// Rename modal state
	const [renameModalOpen, setRenameModalOpen] = useState(false);
	const [renamingCategory, setRenamingCategory] = useState<AssetCategory | null>(null);
	const [newName, setNewName] = useState("");

	// Delete modal state
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [deletingCategory, setDeletingCategory] = useState<AssetCategory | null>(null);

	// Fetch categories
	const { data, isLoading } = useQuery({
		queryKey: ["asset-categories", page, ROWS_PER_PAGE],
		queryFn: () => assetCategoryService.getCategories({ page, limit: ROWS_PER_PAGE }),
		enabled: open,
	});

	// Create category mutation
	const createMutation = useMutation({
		mutationFn: (name: string) => assetCategoryService.createCategory({ name, status: "active" }),
		onSuccess: () => {
			toast.success("Category created successfully");
			queryClient.invalidateQueries({ queryKey: ["asset-categories"] });
			setNewCategoryName("");
		},
		onError: () => {
			// Error toast is handled by apiClient;
		},
	});

	// Update category mutation (rename/toggle status)
	const updateMutation = useMutation({
		mutationFn: ({
			categoryId,
			data,
		}: {
			categoryId: string;
			data: { name?: string; status?: "active" | "inactive" };
		}) => assetCategoryService.updateCategory(categoryId, data),
		onSuccess: () => {
			toast.success("Category updated successfully");
			queryClient.invalidateQueries({ queryKey: ["asset-categories"] });
			setRenameModalOpen(false);
			setRenamingCategory(null);
		},
		onError: () => {
			// Error toast is handled by apiClient;
		},
	});

	// Delete category mutation
	const deleteMutation = useMutation({
		mutationFn: (categoryId: string) => assetCategoryService.deleteCategory(categoryId),
		onSuccess: () => {
			toast.success("Category deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["asset-categories"] });
			setDeleteModalOpen(false);
			setDeletingCategory(null);
		},
		onError: () => {
			// Error toast is handled by apiClient;
		},
	});

	const categories = data?.results || [];
	const totalPages = data?.totalPages || 1;

	const handleCreateCategory = () => {
		if (!newCategoryName.trim()) {
			toast.error("Please enter a category name");
			return;
		}
		createMutation.mutate(newCategoryName.trim());
	};

	const handleRenameClick = (category: AssetCategory) => {
		setRenamingCategory(category);
		setNewName(category.name);
		setRenameModalOpen(true);
	};

	const handleRenameSubmit = () => {
		if (!renamingCategory || !newName.trim()) return;
		updateMutation.mutate({ categoryId: renamingCategory.id, data: { name: newName.trim() } });
	};

	const handleToggleStatus = (category: AssetCategory) => {
		const newStatus = category.status === "active" ? "inactive" : "active";
		updateMutation.mutate({ categoryId: category.id, data: { status: newStatus } });
	};

	const handleDeleteClick = (category: AssetCategory) => {
		setDeletingCategory(category);
		setDeleteModalOpen(true);
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "active":
				return <Badge variant="default">Active</Badge>;
			case "inactive":
				return <Badge variant="secondary">Inactive</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Asset Categories</DialogTitle>
						<DialogDescription>Manage categories for organizing your assets</DialogDescription>
					</DialogHeader>

					{/* Add New Category Section */}
					{canWrite && (
						<div className="space-y-3 py-2">
							<Label>Add New Category</Label>
							<div className="flex gap-2">
								<Input
									placeholder="Enter category name..."
									value={newCategoryName}
									onChange={(e) => setNewCategoryName(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") handleCreateCategory();
									}}
								/>
								<Button onClick={handleCreateCategory} disabled={createMutation.isPending}>
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

					{/* Categories Table */}
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-center">Assets Count</TableHead>
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
												<Skeleton className="h-5 w-16" />
											</TableCell>
											<TableCell className="text-center">
												<Skeleton className="h-4 w-8 mx-auto" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-8 w-8" />
											</TableCell>
										</TableRow>
									))
								) : categories.length === 0 ? (
									<TableRow>
										<TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
											No categories found. Create one above.
										</TableCell>
									</TableRow>
								) : (
									categories.map((category) => (
										<TableRow key={category.id}>
											<TableCell className="font-medium">{category.name}</TableCell>
											<TableCell>{getStatusBadge(category.status)}</TableCell>
											<TableCell className="text-center text-muted-foreground">{category.assetCount}</TableCell>
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
																<DropdownMenuItem onClick={() => handleRenameClick(category)}>
																	<Pencil className="h-4 w-4 mr-2" />
																	Rename
																</DropdownMenuItem>
																<DropdownMenuItem onClick={() => handleToggleStatus(category)}>
																	{category.status === "active" ? (
																		<>
																			<PowerOff className="h-4 w-4 mr-2" />
																			Deactivate
																		</>
																	) : (
																		<>
																			<Power className="h-4 w-4 mr-2" />
																			Activate
																		</>
																	)}
																</DropdownMenuItem>
																<DropdownMenuSeparator />
																<DropdownMenuItem
																	onClick={() => handleDeleteClick(category)}
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
						<DialogTitle>Rename Category</DialogTitle>
						<DialogDescription>Enter a new name for the category "{renamingCategory?.name}"</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<Label>New Name</Label>
						<Input
							value={newName}
							onChange={(e) => setNewName(e.target.value)}
							placeholder="Enter new category name..."
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
						<DialogTitle>Delete Category</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete the category <strong>"{deletingCategory?.name}"</strong>?
							{deletingCategory?.assetCount && deletingCategory.assetCount > 0 ? (
								<span className="block mt-2 text-destructive">
									Warning: This category has {deletingCategory.assetCount} asset(s) associated with it.
								</span>
							) : (
								<span className="block mt-2">This action cannot be undone.</span>
							)}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => deletingCategory && deleteMutation.mutate(deletingCategory.id)}
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
