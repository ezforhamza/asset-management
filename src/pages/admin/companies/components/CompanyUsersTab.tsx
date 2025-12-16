import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { UserCircle } from "lucide-react";
import adminService from "@/api/services/adminService";
import { Badge } from "@/ui/badge";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

interface CompanyUsersTabProps {
	companyId: string;
}

const getRoleBadge = (role: string) => {
	switch (role) {
		case "customer_admin":
			return <Badge className="bg-purple-600">Admin</Badge>;
		case "field_user":
			return <Badge variant="secondary">Field User</Badge>;
		default:
			return <Badge variant="outline">{role}</Badge>;
	}
};

export function CompanyUsersTab({ companyId }: CompanyUsersTabProps) {
	const { data, isLoading } = useQuery({
		queryKey: ["admin", "company-users", companyId],
		queryFn: () => adminService.getAdminUsers({ companyId }),
	});

	const users = data?.users || [];

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
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<UserCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
				<h3 className="text-lg font-medium">No users found</h3>
				<p className="text-sm text-muted-foreground">This company has no users yet.</p>
			</div>
		);
	}

	return (
		<div className="rounded-md border overflow-auto">
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
					{users.map((user) => (
						<TableRow key={user.id || user.email}>
							<TableCell className="font-medium">{user.name}</TableCell>
							<TableCell>{user.email}</TableCell>
							<TableCell>{getRoleBadge(user.role)}</TableCell>
							<TableCell className="text-sm text-muted-foreground">
								{user.lastLogin ? format(new Date(user.lastLogin), "MMM d, yyyy") : "Never"}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
