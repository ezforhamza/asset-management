import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, UserCircle } from "lucide-react";
import { useState } from "react";
import adminService from "@/api/services/adminService";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Button } from "@/ui/button";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { StyledBadge } from "@/utils/badge-styles";
import { AddUserModal } from "./AddUserModal";

interface CompanyUsersTabProps {
	companyId: string;
}

const getRoleBadge = (role: string) => {
	switch (role) {
		case "customer_admin":
			return <StyledBadge color="purple">Admin</StyledBadge>;
		case "field_user":
			return <StyledBadge color="blue">Field User</StyledBadge>;
		default:
			return <StyledBadge color="gray">{role}</StyledBadge>;
	}
};

const ROWS_PER_PAGE = 6;

export function CompanyUsersTab({ companyId }: CompanyUsersTabProps) {
	const [addUserOpen, setAddUserOpen] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);

	const { data, isLoading } = useQuery({
		queryKey: ["admin", "company-users", companyId],
		queryFn: () => adminService.getAdminUsers({ companyId }),
	});

	const users = data?.results || [];

	// Pagination calculations
	const totalResults = users.length;
	const totalPages = Math.ceil(totalResults / ROWS_PER_PAGE);
	const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
	const endIndex = startIndex + ROWS_PER_PAGE;
	const paginatedUsers = users.slice(startIndex, endIndex);

	if (isLoading) {
		return (
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Role</TableHead>
							<TableHead>Last Login</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{Array.from({ length: 3 }).map((_, i) => (
							<TableRow key={i}>
								<TableCell>
									<Skeleton className="h-5 w-32" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-40" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-20" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-24" />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		);
	}

	if (users.length === 0) {
		return (
			<>
				<div className="flex justify-end -mt-12 mb-4">
					<Button onClick={() => setAddUserOpen(true)}>
						<Plus className="h-4 w-4 mr-2" />
						Add User
					</Button>
				</div>
				<div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
					<UserCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
					<h3 className="text-lg font-medium">No users found</h3>
					<p className="text-sm text-muted-foreground mb-4">This company has no users yet.</p>
					<Button onClick={() => setAddUserOpen(true)}>
						<Plus className="h-4 w-4 mr-2" />
						Add First User
					</Button>
				</div>
				<AddUserModal open={addUserOpen} onClose={() => setAddUserOpen(false)} companyId={companyId} />
			</>
		);
	}

	return (
		<>
			<div className="flex justify-end -mt-12 mb-4">
				<Button onClick={() => setAddUserOpen(true)}>
					<Plus className="h-4 w-4 mr-2" />
					Add User
				</Button>
			</div>
			<div className="rounded-md border flex flex-col">
				<div className="overflow-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>User</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Last Login</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{paginatedUsers.map((user) => (
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
										{user.lastLogin ? format(new Date(user.lastLogin), "MMM d, yyyy") : "Never"}
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
			<AddUserModal open={addUserOpen} onClose={() => setAddUserOpen(false)} companyId={companyId} />
		</>
	);
}
