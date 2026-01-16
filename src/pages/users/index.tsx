import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Filter, Search, Shield, UserPlus, Users, Wifi } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import type { UserInfo } from "#/entity";
import sessionService from "@/api/services/sessionService";
import userService from "@/api/services/userService";
import { useCanWrite } from "@/store/userStore";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { ConfirmModal } from "./components/ConfirmModal";
import { CreateUserModal } from "./components/CreateUserModal";
import { EditUserModal } from "./components/EditUserModal";
import { ForceLogoutModal } from "./components/ForceLogoutModal";
import { PasswordResetModal } from "./components/PasswordResetModal";
import { UserTable } from "./components/UserTable";
import { ViewSessionsModal } from "./components/ViewSessionsModal";

export default function UsersPage() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const canWrite = useCanWrite();
	const [searchQuery, setSearchQuery] = useState("");

	// Filter states
	const [roleFilter, setRoleFilter] = useState<string>("all");
	const [adminTypeFilter, setAdminTypeFilter] = useState<string>("all");
	const [statusFilter, setStatusFilter] = useState<string>("all");

	// Modal states
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [editUser, setEditUser] = useState<UserInfo | null>(null);
	const [resetPasswordUser, setResetPasswordUser] = useState<UserInfo | null>(null);
	const [deactivateUser, setDeactivateUser] = useState<UserInfo | null>(null);
	const [viewSessionsUser, setViewSessionsUser] = useState<UserInfo | null>(null);
	const [forceLogoutUser, setForceLogoutUser] = useState<UserInfo | null>(null);
	const [passwordResetResult, setPasswordResetResult] = useState<{
		userName: string;
		temporaryPassword: string;
	} | null>(null);

	// Fetch users - request a high limit to get all users
	const { data, isLoading } = useQuery({
		queryKey: ["users"],
		queryFn: () => userService.getUsers({ limit: 100 }),
	});

	// Fetch session data to get online status
	const { data: sessionData } = useQuery({
		queryKey: ["session-users"],
		queryFn: () => sessionService.getSessionUsers({ limit: 100 }),
		refetchInterval: 30000, // Refetch every 30 seconds for online status
	});

	const users = data?.results || [];
	const sessionUsers = sessionData?.results || [];
	const totalResults = data?.totalResults || users.length;

	// Merge user data with session summary data
	// Match on userId from session API to id from users API
	const usersWithSessionData = useMemo(() => {
		return users.map((user: UserInfo) => {
			const sessionUser = sessionUsers.find((su) => su.userId === user.id);
			return {
				...user,
				// Use hasActiveSession from session API for online status
				hasActiveSession: sessionUser?.hasActiveSession ?? false,
				activeSessionCount: sessionUser?.activeSessionCount ?? 0,
				lastActivityAt: sessionUser?.lastActivityAt ?? null,
				// Use lastSessionCreatedAt as lastLogin if available
				lastLogin: sessionUser?.lastSessionCreatedAt ?? user.lastLogin,
			};
		});
	}, [users, sessionUsers]);

	// Filter users by search and filters
	const filteredUsers = useMemo(() => {
		return usersWithSessionData.filter((user) => {
			// Search filter
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				if (!user.name?.toLowerCase().includes(query) && !user.email?.toLowerCase().includes(query)) {
					return false;
				}
			}

			// Role filter
			if (roleFilter !== "all" && user.role !== roleFilter) {
				return false;
			}

			// Admin type filter (only applies to customer_admin)
			if (adminTypeFilter !== "all") {
				if (user.role !== "customer_admin") return false;
				if (user.adminType !== adminTypeFilter) return false;
			}

			// Status filter
			if (statusFilter !== "all") {
				if (statusFilter === "pending_setup" && !user.mustChangePassword) return false;
				if (statusFilter === "active" && user.mustChangePassword) return false;
			}

			return true;
		});
	}, [usersWithSessionData, searchQuery, roleFilter, adminTypeFilter, statusFilter]);

	const handleRefresh = () => {
		queryClient.invalidateQueries({ queryKey: ["users"] });
	};

	const handleResetPassword = async () => {
		if (!resetPasswordUser?.id) return;
		try {
			const result = await userService.resetUserPassword(resetPasswordUser.id);
			setPasswordResetResult({
				userName: resetPasswordUser.name || "",
				temporaryPassword: result.temporaryPassword,
			});
			setResetPasswordUser(null);
			handleRefresh();
		} catch {
			// Error toast is handled by apiClient;
		}
	};

	const handleDeactivate = async () => {
		if (!deactivateUser?.id) return;
		try {
			await userService.deactivateUser(deactivateUser.id);
			toast.success("User deactivated successfully");
			setDeactivateUser(null);
			handleRefresh();
		} catch {
			// Error toast is handled by apiClient;
		}
	};

	// Stats - use totalResults from API for accurate count
	const totalUsers = totalResults;
	const adminCount = users?.filter((u: UserInfo) => u.role === "customer_admin").length || 0;
	const fieldUserCount = users?.filter((u: UserInfo) => u.role === "field_user").length || 0;

	return (
		<div className="h-full flex flex-col overflow-hidden">
			{/* Header */}
			<div className="flex-shrink-0 px-6 py-4 border-b bg-card/50">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h1 className="text-xl font-semibold">User Management</h1>
						<p className="text-sm text-muted-foreground">Manage your team and field workers</p>
					</div>
					{canWrite && (
						<Button onClick={() => setCreateModalOpen(true)}>
							<UserPlus className="h-4 w-4 mr-2" />
							Add User
						</Button>
					)}
				</div>
			</div>

			{/* Stats & Search Bar */}
			<div className="flex-shrink-0 px-6 py-4 border-b flex flex-wrap items-center gap-4">
				<div className="flex items-center gap-6">
					<div className="flex items-center gap-2">
						<Users className="h-4 w-4 text-muted-foreground" />
						<span className="text-sm">
							<strong>{totalUsers}</strong> Total
						</span>
					</div>
					<div className="flex items-center gap-2">
						<Shield className="h-4 w-4 text-purple-500" />
						<span className="text-sm">
							<strong>{adminCount}</strong> Admins
						</span>
					</div>
					<div className="flex items-center gap-2">
						<Users className="h-4 w-4 text-blue-500" />
						<span className="text-sm">
							<strong>{fieldUserCount}</strong> Field
						</span>
					</div>
					<div className="flex items-center gap-2">
						<Wifi className="h-4 w-4 text-emerald-500" />
						<span className="text-sm">
							<strong>{usersWithSessionData.filter((u) => u.hasActiveSession).length}</strong> Online
						</span>
					</div>
				</div>
				<div className="flex-1" />

				{/* Filters */}
				<div className="flex items-center gap-2">
					<Filter className="h-4 w-4 text-muted-foreground" />
					<Select value={roleFilter} onValueChange={setRoleFilter}>
						<SelectTrigger className="w-[140px] h-9">
							<SelectValue placeholder="Role" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Roles</SelectItem>
							<SelectItem value="field_user">Field User</SelectItem>
							<SelectItem value="customer_admin">Admin</SelectItem>
						</SelectContent>
					</Select>

					<Select value={adminTypeFilter} onValueChange={setAdminTypeFilter}>
						<SelectTrigger className="w-[140px] h-9">
							<SelectValue placeholder="Admin Type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Types</SelectItem>
							<SelectItem value="full">Full Admin</SelectItem>
							<SelectItem value="read_only">Read-Only</SelectItem>
						</SelectContent>
					</Select>

					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-[140px] h-9">
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Status</SelectItem>
							<SelectItem value="pending_setup">Pending Setup</SelectItem>
							<SelectItem value="active">Active</SelectItem>
						</SelectContent>
					</Select>
				</div>

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

			{/* Table - Scrollable with max height */}
			<div className="flex-1 min-h-0 overflow-hidden px-6 py-4">
				<UserTable
					users={filteredUsers || []}
					isLoading={isLoading}
					onEdit={setEditUser}
					onResetPassword={setResetPasswordUser}
					onDeactivate={setDeactivateUser}
					onViewSessions={setViewSessionsUser}
					onForceLogout={setForceLogoutUser}
					onRowClick={(user) => navigate(`/users/${user.id}`)}
					canWrite={canWrite}
				/>
			</div>

			{/* Modals */}
			<CreateUserModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} onSuccess={handleRefresh} />

			<EditUserModal user={editUser} open={!!editUser} onClose={() => setEditUser(null)} onSuccess={handleRefresh} />

			<ConfirmModal
				open={!!resetPasswordUser}
				onClose={() => setResetPasswordUser(null)}
				onConfirm={handleResetPassword}
				title="Reset Password"
				description={`This will generate a new temporary password for ${resetPasswordUser?.name}. They will be required to change it on their next login.`}
				confirmText="Reset Password"
			/>

			<ConfirmModal
				open={!!deactivateUser}
				onClose={() => setDeactivateUser(null)}
				onConfirm={handleDeactivate}
				title="Deactivate User"
				description={`Are you sure you want to deactivate ${deactivateUser?.name}? They will no longer be able to access the system.`}
				confirmText="Deactivate"
				variant="destructive"
			/>

			<PasswordResetModal
				open={!!passwordResetResult}
				onClose={() => setPasswordResetResult(null)}
				userName={passwordResetResult?.userName || ""}
				temporaryPassword={passwordResetResult?.temporaryPassword || ""}
			/>

			<ViewSessionsModal user={viewSessionsUser} open={!!viewSessionsUser} onClose={() => setViewSessionsUser(null)} />

			<ForceLogoutModal
				user={forceLogoutUser}
				open={!!forceLogoutUser}
				onClose={() => setForceLogoutUser(null)}
				onSuccess={() => {
					queryClient.invalidateQueries({ queryKey: ["session-users"] });
					queryClient.invalidateQueries({ queryKey: ["users"] });
				}}
			/>
		</div>
	);
}
