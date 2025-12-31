import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Edit, KeyRound, Mail, MoreHorizontal, UserX } from "lucide-react";
import { useMemo, useState } from "react";
import type { UserInfo } from "#/entity";
import { UserRole } from "#/enum";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

interface UserTableProps {
	users: UserInfo[];
	isLoading: boolean;
	onEdit: (user: UserInfo) => void;
	onResetPassword: (user: UserInfo) => void;
	onDeactivate: (user: UserInfo) => void;
}

const ITEMS_PER_PAGE = 8;

const getRoleBadge = (role?: UserRole) => {
	if (role === UserRole.CUSTOMER_ADMIN) {
		return (
			<Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
				Admin
			</Badge>
		);
	}
	return (
		<Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
			Field User
		</Badge>
	);
};

const getInitials = (name?: string) => {
	if (!name) return "U";
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
};

export function UserTable({ users, isLoading, onEdit, onResetPassword, onDeactivate }: UserTableProps) {
	const [page, setPage] = useState(1);

	// Calculate pagination
	const totalPages = Math.ceil((users?.length || 0) / ITEMS_PER_PAGE);
	const paginatedUsers = useMemo(() => {
		if (!users) return [];
		const startIndex = (page - 1) * ITEMS_PER_PAGE;
		return users.slice(startIndex, startIndex + ITEMS_PER_PAGE);
	}, [users, page]);

	// Reset to page 1 when users list changes significantly
	useMemo(() => {
		if (page > totalPages && totalPages > 0) {
			setPage(1);
		}
	}, [totalPages, page]);

	if (isLoading) {
		return (
			<div className="space-y-3">
				{Array.from({ length: 5 }).map((_, i) => (
					<Skeleton key={i} className="h-16 w-full" />
				))}
			</div>
		);
	}

	if (!users || users.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<div className="rounded-full bg-muted p-4 mb-4">
					<Mail className="h-8 w-8 text-muted-foreground" />
				</div>
				<h3 className="font-semibold text-lg">No users found</h3>
				<p className="text-muted-foreground mt-1">Add your first team member to get started</p>
			</div>
		);
	}

	return (
		<div className="rounded-xl border overflow-hidden flex flex-col h-full max-h-full">
			{/* Scrollable Table Container */}
			<div className="flex-1 min-h-0 overflow-auto">
				<Table>
					<TableHeader className="sticky top-0 bg-muted/50 z-10">
						<TableRow>
							<TableHead>User</TableHead>
							<TableHead>Role</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Last Login</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{paginatedUsers.map((user) => (
							<TableRow key={user.id} className="hover:bg-muted/30">
								<TableCell>
									<div className="flex items-center gap-3">
										<Avatar className="h-10 w-10">
											<AvatarImage src={user.profilePic || undefined} alt={user.name} />
											<AvatarFallback className="bg-primary/10 text-primary font-medium">
												{getInitials(user.name)}
											</AvatarFallback>
										</Avatar>
										<div>
											<p className="font-medium">{user.name}</p>
											<p className="text-sm text-muted-foreground">{user.email}</p>
										</div>
									</div>
								</TableCell>
								<TableCell>{getRoleBadge(user.role)}</TableCell>
								<TableCell>
									{user.mustChangePassword ? (
										<Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
											Pending Setup
										</Badge>
									) : (
										<Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
											Active
										</Badge>
									)}
								</TableCell>
								<TableCell className="text-muted-foreground">
									{user.lastLogin ? format(new Date(user.lastLogin), "MMM dd, yyyy") : "Never"}
								</TableCell>
								<TableCell className="text-right">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon" className="h-8 w-8">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem onClick={() => onEdit(user)}>
												<Edit className="h-4 w-4 mr-2" />
												Edit User
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => onResetPassword(user)}>
												<KeyRound className="h-4 w-4 mr-2" />
												Reset Password
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem onClick={() => onDeactivate(user)} className="text-red-500 focus:text-red-500">
												<UserX className="h-4 w-4 mr-2" />
												Deactivate
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Pagination Footer - Always visible */}
			<div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-t bg-muted/30">
				<p className="text-sm text-muted-foreground">
					Showing {(page - 1) * ITEMS_PER_PAGE + 1} - {Math.min(page * ITEMS_PER_PAGE, users.length)} of {users.length}{" "}
					users
				</p>
				{totalPages > 1 && (
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
						<span className="text-sm text-muted-foreground px-2">
							{page} / {totalPages}
						</span>
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
				)}
			</div>
		</div>
	);
}

export default UserTable;
