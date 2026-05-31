import { useQuery } from "@tanstack/react-query";
import { Building2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import adminService from "@/api/services/adminService";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { getCompanyStatusBadge } from "@/utils/badge-styles";
import { format } from "date-fns";

export default function SuperUserDashboardPage() {
	const navigate = useNavigate();
	const [page, setPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const limit = 20;

	useEffect(() => {
		const t = setTimeout(() => {
			setDebouncedSearch(searchQuery);
			setPage(1);
		}, 300);
		return () => clearTimeout(t);
	}, [searchQuery]);

	const { data, isLoading } = useQuery({
		queryKey: ["super-user", "companies", page, debouncedSearch],
		queryFn: () => adminService.getCompanies({ page, limit, search: debouncedSearch || undefined }),
	});

	const companies = data?.results || [];
	const totalPages = Math.ceil((data?.totalResults || 0) / limit) || 1;

	return (
		<div className="h-full flex flex-col overflow-hidden">
			{/* Header */}
			<div className="flex-shrink-0 px-6 py-4 border-b bg-card/50">
				<div className="flex items-center gap-3">
					<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
						<Building2 className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h1 className="text-xl font-semibold">Companies</h1>
						<p className="text-sm text-muted-foreground">Select a company to view their assets</p>
					</div>
				</div>
			</div>

			{/* Search */}
			<div className="flex-shrink-0 px-6 py-4 border-b">
				<div className="relative max-w-sm">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search companies..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>
			</div>

			{/* Table */}
			<div className="flex-1 min-h-0 overflow-hidden px-6 py-4">
				<div className="rounded-md border flex flex-col h-full overflow-hidden">
					<div className="flex-1 min-h-0 overflow-auto">
						<Table>
							<TableHeader className="sticky top-0 bg-background z-10">
								<TableRow>
									<TableHead>Company Name</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Created At</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									Array.from({ length: 8 }).map((_, i) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
										<TableRow key={i}>
											<TableCell>
												<Skeleton className="h-4 w-40" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-5 w-16" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-24" />
											</TableCell>
										</TableRow>
									))
								) : companies.length === 0 ? (
									<TableRow>
										<TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
											No companies found
										</TableCell>
									</TableRow>
								) : (
									companies.map((company) => (
										<TableRow
											key={company._id}
											className="cursor-pointer hover:bg-muted/50"
											onClick={() => navigate(`/super-user/companies/${company._id}/assets`)}
										>
											<TableCell className="font-medium">{company.companyName}</TableCell>
											<TableCell>{getCompanyStatusBadge(company.isActive ? "active" : "inactive")}</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{company.createdAt ? format(new Date(company.createdAt), "MMM d, yyyy") : "—"}
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>

					{/* Pagination */}
					<div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-t bg-muted/30">
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
								disabled={page >= totalPages}
							>
								Next
								<ChevronRight className="h-4 w-4 ml-1" />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
