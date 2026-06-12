import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { LayoutGrid, Phone, Users, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import type { UserInfo } from "#/entity";
import adminService from "@/api/services/adminService";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { StyledBadge } from "@/utils/badge-styles";
import { formatLabel } from "@/utils/formatLabel";

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

const ROWS_PER_PAGE = 10;

export default function SuperUserCompanyUsersPage() {
	const { companyId } = useParams<{ companyId: string }>();
	const navigate = useNavigate();
	const [currentPage, setCurrentPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	useEffect(() => {
		const t = setTimeout(() => {
			setDebouncedSearch(searchQuery);
			setCurrentPage(1);
		}, 300);
		return () => clearTimeout(t);
	}, [searchQuery]);

	const { data: companiesData } = useQuery({
		queryKey: ["super-user", "companies-list"],
		queryFn: () => adminService.getCompanies({ limit: 100 }),
	});
	const company = companiesData?.results?.find((c) => c._id === companyId || c.id === companyId);

	const { data, isLoading } = useQuery({
		queryKey: ["super-user", "company-users", companyId, currentPage, debouncedSearch],
		queryFn: () =>
			adminService.getAdminUsers({
				companyId: companyId ?? "",
				page: currentPage,
				limit: ROWS_PER_PAGE,
				search: debouncedSearch || undefined,
			}),
		enabled: !!companyId,
	});

	const users: UserInfo[] = data?.results || [];
	const totalResults = data?.totalResults || 0;
	const totalPages = data?.totalPages || 1;
	const startIndex = (currentPage - 1) * ROWS_PER_PAGE;

	return (
		<div className="h-full flex flex-col overflow-hidden">
			{/* Header */}
			<div className="flex-shrink-0 px-6 py-4 border-b bg-card/50">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
							<Users className="h-5 w-5 text-primary" />
						</div>
						<div>
							<h1 className="text-xl font-semibold">Company Users</h1>
							{company && <p className="text-sm text-muted-foreground">{company.companyName}</p>}
						</div>
					</div>
					{/* Tab navigation: Assets / Users */}
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm" onClick={() => navigate(`/super-user/companies/${companyId}/assets`)}>
							<LayoutGrid className="h-4 w-4 mr-2" />
							Assets
						</Button>
						<Button variant="default" size="sm" disabled>
							<Users className="h-4 w-4 mr-2" />
							Users
						</Button>
					</div>
				</div>
			</div>

			{/* Search */}
			<div className="flex-shrink-0 px-6 py-3 border-b">
				<Input
					placeholder="Search by name or email..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="max-w-sm"
				/>
			</div>

			{/* Table */}
			<div className="flex-1 min-h-0 overflow-hidden px-6 py-4 flex flex-col">
				{isLoading ? (
					<div className="space-y-2">
						{[1, 2, 3, 4, 5].map((k) => (
							<Skeleton key={k} className="h-12 w-full" />
						))}
					</div>
				) : users.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg">
						<UserCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
						<h3 className="text-lg font-medium">{debouncedSearch ? "No users match your search" : "No users found"}</h3>
						<p className="text-sm text-muted-foreground">
							{debouncedSearch ? "Try a different name or email." : "This company has no users yet."}
						</p>
					</div>
				) : (
					<div className="rounded-md border flex flex-col flex-1 min-h-0">
						<div className="overflow-auto flex-1">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>User</TableHead>
										<TableHead>Role</TableHead>
										<TableHead>Phone</TableHead>
										<TableHead>App Version</TableHead>
										<TableHead>Platform</TableHead>
										<TableHead>App Last Seen</TableHead>
										<TableHead>Last Login</TableHead>
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
												{user.phone ? (
													<div className="flex items-center gap-1">
														<Phone className="h-3 w-3" />
														{user.phone}
													</div>
												) : (
													"—"
												)}
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{user.role === "field_user" ? (user.appVersion ?? "—") : "—"}
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{user.role === "field_user" && user.appPlatform
													? user.appPlatform.charAt(0).toUpperCase() + user.appPlatform.slice(1)
													: "—"}
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{user.role === "field_user" && user.appVersionLastSeenAt
													? format(new Date(user.appVersionLastSeenAt), "MMM d, yyyy")
													: "—"}
											</TableCell>
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
									Showing {startIndex + 1}–{Math.min(startIndex + ROWS_PER_PAGE, totalResults)} of {totalResults}
								</div>
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setCurrentPage((p) => p - 1)}
										disabled={currentPage === 1}
									>
										Previous
									</Button>
									<span className="text-sm">
										{currentPage} / {totalPages}
									</span>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setCurrentPage((p) => p + 1)}
										disabled={currentPage === totalPages}
									>
										Next
									</Button>
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
