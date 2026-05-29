import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserInfo } from "#/entity";
import adminService from "@/api/services/adminService";
import { useUserInfo } from "@/store/userStore";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { ConfirmModal } from "../companies/components/ConfirmModal";
import { AdminUserTable } from "./components/AdminUserTable";
import { CreateSuperuserModal } from "./components/CreateSuperuserModal";

export default function AdminUsersPage() {
	const queryClient = useQueryClient();
	const currentUser = useUserInfo();
	const [searchQuery, setSearchQuery] = useState("");
	const [companyFilter, setCompanyFilter] = useState("all");
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [deleteUser, setDeleteUser] = useState<UserInfo | null>(null);
	const [deactivateUser, setDeactivateUser] = useState<UserInfo | null>(null);
	const [activateUser, setActivateUser] = useState<UserInfo | null>(null);
	const [isStatusLoading, setIsStatusLoading] = useState(false);

	const { data: companiesData } = useQuery({
		queryKey: ["admin", "companies"],
		queryFn: () => adminService.getCompanies({ limit: 100 }),
	});

	const { data, isLoading } = useQuery({
		queryKey: ["admin", "users", companyFilter],
		queryFn: () =>
			adminService.getAdminUsers({
				companyId: companyFilter !== "all" ? companyFilter : undefined,
			}),
	});

	const users = data?.results || [];
	const companies = companiesData?.results || [];

	// Client-side search filter
	const filteredUsers = users.filter((user) => {
		if (!searchQuery) return true;
		const query = searchQuery.toLowerCase();
		return user.name?.toLowerCase().includes(query) || user.email?.toLowerCase().includes(query);
	});

	const totalUsers = data?.totalResults || 0;
	const adminCount = users.filter((u) => u.role === "customer_admin" || u.role === "system_admin").length;

	const handleDelete = async () => {
		if (!deleteUser?.id) return;
		try {
			await adminService.deleteUser(deleteUser.id);
			toast.success("User deleted successfully");
			setDeleteUser(null);
			queryClient.invalidateQueries({ queryKey: ["admin", "users", companyFilter] });
		} catch {
			// Error toast is handled by apiClient
		}
	};

	const handleDeactivate = async () => {
		if (!deactivateUser?.id) return;
		setIsStatusLoading(true);
		try {
			await adminService.deactivateUser(deactivateUser.id);
			toast.success("User deactivated successfully");
			setDeactivateUser(null);
			queryClient.invalidateQueries({ queryKey: ["admin", "users", companyFilter] });
		} catch {
			// Error toast is handled by apiClient
		} finally {
			setIsStatusLoading(false);
		}
	};

	const handleActivate = async () => {
		if (!activateUser?.id) return;
		setIsStatusLoading(true);
		try {
			await adminService.activateUser(activateUser.id);
			toast.success("User activated successfully");
			setActivateUser(null);
			queryClient.invalidateQueries({ queryKey: ["admin", "users", companyFilter] });
		} catch {
			// Error toast is handled by apiClient
		} finally {
			setIsStatusLoading(false);
		}
	};

	return (
		<div className="h-full flex flex-col overflow-hidden">
			{/* Header */}
			<div className="flex-shrink-0 px-6 py-4 border-b bg-card/50">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
							<Users className="h-5 w-5 text-primary" />
						</div>
						<div>
							<h1 className="text-xl font-semibold">User Management</h1>
							<p className="text-sm text-muted-foreground">Manage users across all companies</p>
						</div>
					</div>
					<Button onClick={() => setCreateModalOpen(true)}>
						<UserPlus className="h-4 w-4 mr-2" />
						Create Superuser
					</Button>
				</div>
			</div>

			{/* Stats & Filters */}
			<div className="flex-shrink-0 px-6 py-4 border-b flex flex-wrap items-center gap-4">
				<div className="flex items-center gap-6">
					<div className="flex items-center gap-2">
						<Users className="h-4 w-4 text-muted-foreground" />
						<span className="text-sm">
							<strong>{totalUsers}</strong> Total Users
						</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="h-2 w-2 rounded-full bg-purple-500" />
						<span className="text-sm">
							<strong>{adminCount}</strong> Admins
						</span>
					</div>
				</div>
				<div className="flex-1" />
				<Select value={companyFilter} onValueChange={setCompanyFilter}>
					<SelectTrigger className="w-[200px]">
						<SelectValue placeholder="Filter by company" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Companies</SelectItem>
						{companies.map((company) => (
							<SelectItem key={company._id} value={company._id}>
								{company.companyName}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<div className="relative w-64">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search users..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>
			</div>

			{/* Table */}
			<div className="flex-1 overflow-hidden px-6 py-4">
				<AdminUserTable
					users={filteredUsers}
					companies={companies}
					isLoading={isLoading}
					currentUserId={currentUser.id}
					onDeactivate={setDeactivateUser}
					onActivate={setActivateUser}
					onDelete={setDeleteUser}
				/>
			</div>

			{/* Modals */}
			<CreateSuperuserModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} />

			<ConfirmModal
				open={!!deactivateUser}
				onClose={() => setDeactivateUser(null)}
				onConfirm={handleDeactivate}
				isLoading={isStatusLoading}
				title="Deactivate User"
				description={`Are you sure you want to deactivate ${deactivateUser?.name}? They will no longer be able to access the system.`}
				confirmText="Deactivate"
				variant="destructive"
			/>

			<ConfirmModal
				open={!!activateUser}
				onClose={() => setActivateUser(null)}
				onConfirm={handleActivate}
				isLoading={isStatusLoading}
				title="Activate User"
				description={`Are you sure you want to activate ${activateUser?.name}? They will regain access to the system.`}
				confirmText="Activate"
			/>

			<ConfirmModal
				open={!!deleteUser}
				onClose={() => setDeleteUser(null)}
				onConfirm={handleDelete}
				title="Delete User"
				description={`Are you sure you want to delete ${deleteUser?.name}? This action cannot be undone.`}
				confirmText="Delete"
				variant="destructive"
			/>
		</div>
	);
}
