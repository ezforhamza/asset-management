import { format } from "date-fns";
import { MoreHorizontal, Pencil, Shield, User, UserX } from "lucide-react";
import type { Company, UserInfo } from "#/entity";
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

interface AdminUserTableProps {
	users: UserInfo[];
	companies: Company[];
	isLoading: boolean;
	onEdit?: (user: UserInfo) => void;
	onDeactivate?: (user: UserInfo) => void;
}

const getRoleBadge = (role: string) => {
	switch (role) {
		case "system_admin":
			return <Badge variant="destructive">System Admin</Badge>;
		case "customer_admin":
			return <Badge variant="default">Admin</Badge>;
		default:
			return <Badge variant="secondary">Field User</Badge>;
	}
};

export function AdminUserTable({ users, companies, isLoading, onEdit, onDeactivate }: AdminUserTableProps) {
	const getCompanyName = (companyId: string) => {
		const company = companies.find((c) => c._id === companyId);
		return company?.companyName || "Unknown";
	};

	if (isLoading) {
		return (
			<div className="rounded-md border h-full overflow-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>User</TableHead>
							<TableHead>Company</TableHead>
							<TableHead>Role</TableHead>
							<TableHead>Last Login</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="w-[50px]" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{Array.from({ length: 5 }).map((_, i) => (
							<TableRow key={i}>
								<TableCell>
									<Skeleton className="h-5 w-40" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-32" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-20" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-24" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-16" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-8 w-8" />
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
			<div className="flex flex-col items-center justify-center h-full text-center">
				<User className="h-12 w-12 text-muted-foreground/50 mb-4" />
				<h3 className="text-lg font-medium">No users found</h3>
				<p className="text-sm text-muted-foreground">Try adjusting your filters.</p>
			</div>
		);
	}

	return (
		<div className="rounded-md border h-full overflow-auto">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>User</TableHead>
						<TableHead>Company</TableHead>
						<TableHead>Role</TableHead>
						<TableHead>Last Login</TableHead>
						<TableHead>Status</TableHead>
						<TableHead className="w-[50px]" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{users.map((user) => (
						<TableRow key={user.id}>
							<TableCell>
								<div className="flex items-center gap-3">
									<div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
										{user.role === "system_admin" ? (
											<Shield className="h-4 w-4 text-primary" />
										) : (
											<User className="h-4 w-4 text-primary" />
										)}
									</div>
									<div>
										<p className="font-medium">{user.name}</p>
										<p className="text-xs text-muted-foreground">{user.email}</p>
									</div>
								</div>
							</TableCell>
							<TableCell>
								<span className="text-sm">{user.companyId ? getCompanyName(user.companyId) : "—"}</span>
							</TableCell>
							<TableCell>{getRoleBadge(user.role)}</TableCell>
							<TableCell className="text-sm text-muted-foreground">
								{user.lastLogin ? format(new Date(user.lastLogin), "MMM d, yyyy HH:mm") : "Never"}
							</TableCell>
							<TableCell>
								<Badge variant={user.status !== 0 ? "default" : "secondary"}>
									{user.status !== 0 ? "Active" : "Inactive"}
								</Badge>
							</TableCell>
							<TableCell>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon" className="h-8 w-8">
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem onClick={() => onEdit?.(user)}>
											<Pencil className="h-4 w-4 mr-2" />
											Edit
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem onClick={() => onDeactivate?.(user)} className="text-destructive">
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
	);
}
