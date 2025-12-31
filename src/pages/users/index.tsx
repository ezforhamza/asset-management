import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Shield, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserInfo } from "#/entity";
import userService from "@/api/services/userService";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { ConfirmModal } from "./components/ConfirmModal";
import { CreateUserModal } from "./components/CreateUserModal";
import { EditUserModal } from "./components/EditUserModal";
import { PasswordResetModal } from "./components/PasswordResetModal";
import { UserTable } from "./components/UserTable";

export default function UsersPage() {
	const queryClient = useQueryClient();
	const [searchQuery, setSearchQuery] = useState("");

	// Modal states
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [editUser, setEditUser] = useState<UserInfo | null>(null);
	const [resetPasswordUser, setResetPasswordUser] = useState<UserInfo | null>(null);
	const [deactivateUser, setDeactivateUser] = useState<UserInfo | null>(null);
	const [passwordResetResult, setPasswordResetResult] = useState<{
		userName: string;
		temporaryPassword: string;
	} | null>(null);

	// Fetch users - request a high limit to get all users
	const { data, isLoading } = useQuery({
		queryKey: ["users"],
		queryFn: () => userService.getUsers({ limit: 100 }),
	});

	const users = data?.results || [];
	const totalResults = data?.totalResults || users.length;

	// Filter users by search
	const filteredUsers = users?.filter((user: UserInfo) => {
		if (!searchQuery) return true;
		const query = searchQuery.toLowerCase();
		return user.name?.toLowerCase().includes(query) || user.email?.toLowerCase().includes(query);
	});

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
			toast.error("Failed to reset password");
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
			toast.error("Failed to deactivate user");
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
					<Button onClick={() => setCreateModalOpen(true)}>
						<UserPlus className="h-4 w-4 mr-2" />
						Add User
					</Button>
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
				</div>
				<div className="flex-1" />
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
		</div>
	);
}
