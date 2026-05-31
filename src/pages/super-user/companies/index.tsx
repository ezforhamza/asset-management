import { useQuery } from "@tanstack/react-query";
import { Building2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import adminService from "@/api/services/adminService";
import { CompanyTable } from "@/pages/admin/companies/components/CompanyTable";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

export default function SuperUserCompaniesPage() {
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);
	const [sortBy, setSortBy] = useState("createdAt:desc");

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchQuery);
		}, 300);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	const { data, isLoading } = useQuery({
		queryKey: ["super-user", "companies-list", debouncedSearch, statusFilter, sortBy],
		queryFn: () =>
			adminService.getCompanies({
				search: debouncedSearch || undefined,
				isActive: statusFilter,
				sortBy,
				limit: 100,
			}),
	});

	const companies = data?.results || [];
	const totalCompanies = data?.totalResults || 0;
	const activeCompanies = companies.filter((c) => c.isActive).length;

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
						<p className="text-sm text-muted-foreground">View all registered companies</p>
					</div>
				</div>
			</div>

			{/* Stats & Filters */}
			<div className="flex-shrink-0 px-6 py-4 border-b">
				<div className="flex flex-wrap items-center gap-4 mb-4">
					<div className="flex items-center gap-6">
						<div className="flex items-center gap-2">
							<Building2 className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm">
								<strong>{totalCompanies}</strong> Total
							</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="h-2 w-2 rounded-full bg-green-500" />
							<span className="text-sm">
								<strong>{activeCompanies}</strong> Active
							</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="h-2 w-2 rounded-full bg-gray-400" />
							<span className="text-sm">
								<strong>{totalCompanies - activeCompanies}</strong> Inactive
							</span>
						</div>
					</div>
				</div>
				<div className="flex flex-wrap items-center gap-3">
					<div className="relative flex-1 min-w-[200px]">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search companies..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
						/>
					</div>
					<Select
						value={statusFilter === undefined ? "all" : statusFilter ? "active" : "inactive"}
						onValueChange={(value) => setStatusFilter(value === "all" ? undefined : value === "active")}
					>
						<SelectTrigger className="w-[140px]">
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Status</SelectItem>
							<SelectItem value="active">Active</SelectItem>
							<SelectItem value="inactive">Inactive</SelectItem>
						</SelectContent>
					</Select>
					<Select value={sortBy} onValueChange={setSortBy}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Sort by" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="createdAt:desc">Newest First</SelectItem>
							<SelectItem value="createdAt:asc">Oldest First</SelectItem>
							<SelectItem value="companyName:asc">Name (A-Z)</SelectItem>
							<SelectItem value="companyName:desc">Name (Z-A)</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Table */}
			<div className="flex-1 min-h-0 overflow-hidden px-6 py-4 flex flex-col">
				<CompanyTable
					companies={companies}
					isLoading={isLoading}
					onRowClick={(id) => navigate(`/super-user/companies/${id}/assets`)}
				/>
			</div>
		</div>
	);
}
