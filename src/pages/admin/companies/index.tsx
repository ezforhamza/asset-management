import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Filter, Plus, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Company } from "#/entity";
import adminService from "@/api/services/adminService";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { CompanyTable } from "./components/CompanyTable";
import { ConfirmModal } from "./components/ConfirmModal";
import { CreateCompanyModal } from "./components/CreateCompanyModal";
import { EditCompanyModal } from "./components/EditCompanyModal";

export default function AdminCompaniesPage() {
	const queryClient = useQueryClient();
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);
	const [sortBy, setSortBy] = useState("createdAt:desc");
	const [page, setPage] = useState(1);
	const [limit] = useState(10);
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [editCompany, setEditCompany] = useState<Company | null>(null);
	const [toggleCompany, setToggleCompany] = useState<Company | null>(null);

	const { data, isLoading } = useQuery({
		queryKey: ["admin", "companies", searchQuery, statusFilter, sortBy, page, limit],
		queryFn: () =>
			adminService.getCompanies({
				companyName: searchQuery || undefined,
				isActive: statusFilter,
				sortBy,
				page,
				limit,
			}),
	});

	const toggleCompanyMutation = useMutation({
		mutationFn: (company: Company) => adminService.updateCompany(company._id, { isActive: !company.isActive }),
		onSuccess: (data, variables) => {
			toast.success(`Company ${variables.isActive ? "deactivated" : "activated"} successfully`);
			queryClient.invalidateQueries({ queryKey: ["admin", "companies"] });
		},
		onError: (error) => {
			console.error("Toggle company error:", error);
			toast.error("Failed to update company status");
		},
		onSettled: () => {
			setToggleCompany(null);
		},
	});

	const companies = data?.results || [];
	const totalCompanies = data?.totalResults || 0;
	const activeCompanies = companies.filter((c: Company) => c.isActive).length;

	return (
		<div className="h-full flex flex-col overflow-hidden">
			{/* Header */}
			<div className="flex-shrink-0 px-6 py-4 border-b bg-card/50">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
							<Building2 className="h-5 w-5 text-primary" />
						</div>
						<div>
							<h1 className="text-xl font-semibold">Company Management</h1>
							<p className="text-sm text-muted-foreground">Manage all registered companies</p>
						</div>
					</div>
					<Button onClick={() => setCreateModalOpen(true)}>
						<Plus className="h-4 w-4 mr-2" />
						Add Company
					</Button>
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
					{(searchQuery || statusFilter !== undefined || sortBy !== "createdAt:desc") && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								setSearchQuery("");
								setStatusFilter(undefined);
								setSortBy("createdAt:desc");
								setPage(1);
							}}
						>
							Clear Filters
						</Button>
					)}
				</div>
			</div>

			{/* Table */}
			<div className="flex-1 overflow-hidden px-6 py-4">
				<CompanyTable
					companies={companies}
					isLoading={isLoading}
					onEdit={setEditCompany}
					onToggleStatus={setToggleCompany}
				/>
			</div>

			{/* Modals */}
			<CreateCompanyModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} />

			<EditCompanyModal company={editCompany} open={!!editCompany} onClose={() => setEditCompany(null)} />

			<ConfirmModal
				open={!!toggleCompany}
				onClose={() => setToggleCompany(null)}
				onConfirm={() => toggleCompany && toggleCompanyMutation.mutate(toggleCompany)}
				title={toggleCompany?.isActive ? "Deactivate Company" : "Activate Company"}
				description={`Are you sure you want to ${toggleCompany?.isActive ? "deactivate" : "activate"} ${toggleCompany?.companyName}?`}
				confirmText={toggleCompany?.isActive ? "Deactivate" : "Activate"}
				variant={toggleCompany?.isActive ? "destructive" : "default"}
				isLoading={toggleCompanyMutation.isPending}
			/>
		</div>
	);
}
