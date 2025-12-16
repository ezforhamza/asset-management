import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Company } from "#/entity";
import adminService from "@/api/services/adminService";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { CompanyTable } from "./components/CompanyTable";
import { ConfirmModal } from "./components/ConfirmModal";
import { CreateCompanyModal } from "./components/CreateCompanyModal";
import { EditCompanyModal } from "./components/EditCompanyModal";

export default function AdminCompaniesPage() {
	const queryClient = useQueryClient();
	const [searchQuery, setSearchQuery] = useState("");
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [editCompany, setEditCompany] = useState<Company | null>(null);
	const [toggleCompany, setToggleCompany] = useState<Company | null>(null);

	const { data, isLoading } = useQuery({
		queryKey: ["admin", "companies", searchQuery],
		queryFn: () => adminService.getCompanies({ search: searchQuery || undefined }),
	});

	const toggleMutation = useMutation({
		mutationFn: (company: Company) =>
			company.isActive ? adminService.deactivateCompany(company._id) : adminService.activateCompany(company._id),
		onSuccess: () => {
			toast.success(`Company ${toggleCompany?.isActive ? "deactivated" : "activated"}`);
			queryClient.invalidateQueries({ queryKey: ["admin", "companies"] });
			setToggleCompany(null);
		},
		onError: () => {
			toast.error("Failed to update company status");
		},
	});

	const companies = data?.companies || [];
	const totalCompanies = data?.pagination?.total || 0;
	const activeCompanies = companies.filter((c) => c.isActive).length;

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

			{/* Stats & Search */}
			<div className="flex-shrink-0 px-6 py-4 border-b flex flex-wrap items-center gap-4">
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
				<div className="flex-1" />
				<div className="relative w-64">
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
				onConfirm={() => toggleCompany && toggleMutation.mutate(toggleCompany)}
				title={toggleCompany?.isActive ? "Deactivate Company" : "Activate Company"}
				description={`Are you sure you want to ${toggleCompany?.isActive ? "deactivate" : "activate"} ${toggleCompany?.companyName}?`}
				confirmText={toggleCompany?.isActive ? "Deactivate" : "Activate"}
				variant={toggleCompany?.isActive ? "destructive" : "default"}
				isLoading={toggleMutation.isPending}
			/>
		</div>
	);
}
