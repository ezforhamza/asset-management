import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { MoreHorizontal, Plus, Trash2, UserCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserInfo } from "#/entity";
import adminService from "@/api/services/adminService";
import { useUserInfo } from "@/store/userStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Button } from "@/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { StyledBadge } from "@/utils/badge-styles";
import { formatLabel } from "@/utils/formatLabel";
import { AddUserModal } from "./AddUserModal";
import { ConfirmModal } from "./ConfirmModal";

interface CompanyUsersTabProps {
	companyId: string;
	debouncedSearch: string;
}

const getRoleBadge = (role: string) => {
	switch (role) {
		case "customer_admin":
			return <StyledBadge color="purple">Admin</StyledBadge>;
		case "field_user":
			return <StyledBadge color="blue">Field User</StyledBadge>;
		default:
			return <StyledBadge color="gray">{formatLabel(role)}</StyledBadge>;
	}
};

const ROWS_PER_PAGE = 6;

export function CompanyUsersTab({ companyId, debouncedSearch }: CompanyUsersTabProps) {
	const queryClient = useQueryClient();
	const currentUser = useUserInfo();
	const [addUserOpen, setAddUserOpen] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [deleteUser, setDeleteUser] = useState<UserInfo | null>(null);

	const { data, isLoading } = useQuery({
		queryKey: ["admin", "company-users", companyId, currentPage, debouncedSearch],
		queryFn: () =>
			adminService.getAdminUsers({
				companyId,
				page: currentPage,
				limit: ROWS_PER_PAGE,
				search: debouncedSearch || undefined,
			}),
	});

	const users = data?.results || [];
	const totalResults = data?.totalResults || 0;
	const totalPages = data?.totalPages || 1;
	const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
	const endIndex = Math.min(startIndex + ROWS_PER_PAGE, totalResults);

	const handleDelete = async () => {
		if (!deleteUser?.id) return;
		try {
			await adminService.deleteUser(deleteUser.id);
			toast.success("User deleted successfully");
			setDeleteUser(null);
			queryClient.invalidateQueries({ queryKey: ["admin", "company-users", companyId] });
		} catch {
			// Error toast is handled by apiClient
		}
	};

	return (
		<>
			<div className="flex justify-end mb-3">
				<Button onClick={() => setAddUserOpen(true)}>
					<Plus className="h-4 w-4 mr-2" />
					Add User
				</Button>
			</div>

			{isLoading ? (
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>User</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Last Login</TableHead>
								<TableHead className="w-[50px]" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{["sk1", "sk2", "sk3"].map((k) => (
								<TableRow key={k}>
									<TableCell>
										<Skeleton className="h-5 w-40" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-20" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-8 w-8" />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			) : users.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
					<UserCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
					<h3 className="text-lg font-medium">{debouncedSearch ? "No users match your search" : "No users found"}</h3>
					<p className="text-sm text-muted-foreground mb-4">
						{debouncedSearch ? "Try a different name or email." : "This company has no users yet."}
					</p>
					{!debouncedSearch && (
						<Button onClick={() => setAddUserOpen(true)}>
							<Plus className="h-4 w-4 mr-2" />
							Add First User
						</Button>
					)}
				</div>
			) : (
				<div className="rounded-md border flex flex-col">
					<div className="overflow-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>User</TableHead>
									<TableHead>Role</TableHead>
									<TableHead>Last Login</TableHead>
									<TableHead className="w-[50px]" />
								</TableRow>
							</TableHeader>
							<TableBody>
								{users.map((user) => (
									<TableRow key={user.id || user.email}>
										<TableCell>
											<div className="flex items-center gap-3">
												<Avatar className="h-9 w-9">
													<AvatarImage src={user.profilePic || undefined} alt={user.name} />
													<AvatarFallback className="bg-primary/10 text-primary text-sm">
														{user.name?.charAt(0).toUpperCase()}
													</AvatarFallback>
												</Avatar>
												<div>
													<p className="font-medium">{user.name}</p>
													<p className="text-xs text-muted-foreground">{user.email}</p>
												</div>
											</div>
										</TableCell>
										<TableCell>{getRoleBadge(user.role)}</TableCell>
										<TableCell className="text-sm text-muted-foreground">
											{user.lastLogin ? (
												<div>
													<p>{format(new Date(user.lastLogin), "MMM d, yyyy")}</p>
													<p className="text-xs">{format(new Date(user.lastLogin), "h:mm a")}</p>
												</div>
											) : (
												"Never"
											)}
										</TableCell>
										<TableCell>
											{user.role !== "system_admin" && user.id !== currentUser.id && (
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon" className="h-8 w-8">
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem
															onClick={() => setDeleteUser(user)}
															className="text-red-500 focus:text-red-500"
														>
															<Trash2 className="h-4 w-4 mr-2" />
															Delete User
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
					{totalPages > 1 && (
						<div className="flex items-center justify-between px-4 py-3 border-t">
							<div className="text-sm text-muted-foreground">
								Showing {startIndex + 1} to {Math.min(endIndex, totalResults)} of {totalResults} results
							</div>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setCurrentPage((prev) => prev - 1)}
									disabled={currentPage === 1}
								>
									Previous
								</Button>
								<span className="text-sm">
									Page {currentPage} of {totalPages}
								</span>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setCurrentPage((prev) => prev + 1)}
									disabled={currentPage === totalPages}
								>
									Next
								</Button>
							</div>
						</div>
					)}
				</div>
			)}

			<AddUserModal open={addUserOpen} onClose={() => setAddUserOpen(false)} companyId={companyId} />

			<ConfirmModal
				open={!!deleteUser}
				onClose={() => setDeleteUser(null)}
				onConfirm={handleDelete}
				title="Delete User"
				description={`Are you sure you want to delete ${deleteUser?.name}? This action cannot be undone.`}
				confirmText="Delete"
				variant="destructive"
			/>
		</>
	);
}
