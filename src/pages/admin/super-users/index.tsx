import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Loader2, Plus, Search, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserInfo } from "#/entity";
import adminService from "@/api/services/adminService";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { ConfirmModal } from "../companies/components/ConfirmModal";
import { CreateSuperUserModal } from "./components/CreateSuperUserModal";
import { ManageCompaniesModal } from "./components/ManageCompaniesModal";
import { NotificationAssignmentModal } from "./components/NotificationAssignmentModal";
import { SuperUserTable } from "./components/SuperUserTable";

export default function AdminSuperUsersPage() {
	const queryClient = useQueryClient();
	const [searchQuery, setSearchQuery] = useState("");
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [notifUser, setNotifUser] = useState<UserInfo | null>(null);
	const [manageCompaniesUser, setManageCompaniesUser] = useState<UserInfo | null>(null);
	const [deleteUser, setDeleteUser] = useState<UserInfo | null>(null);
	const [deactivateUser, setDeactivateUser] = useState<UserInfo | null>(null);
	const [activateUser, setActivateUser] = useState<UserInfo | null>(null);
	const [isStatusLoading, setIsStatusLoading] = useState(false);

	// Change password result modal
	const [changePasswordUser, setChangePasswordUser] = useState<UserInfo | null>(null);
	const [resetPassword, setResetPassword] = useState<string | null>(null);
	const [isResettingPassword, setIsResettingPassword] = useState(false);

	const { data, isLoading } = useQuery({
		queryKey: ["admin", "super-users"],
		queryFn: () => adminService.getSuperUsers({ limit: 100 }),
	});

	const users = data?.results || [];
	const filtered = users.filter((u) => {
		if (!searchQuery) return true;
		const q = searchQuery.toLowerCase();
		return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
	});

	const handleDelete = async () => {
		if (!deleteUser?.id) return;
		try {
			await adminService.deleteUser(deleteUser.id);
			toast.success("Super user deleted");
			setDeleteUser(null);
			queryClient.invalidateQueries({ queryKey: ["admin", "super-users"] });
		} catch {}
	};

	const handleDeactivate = async () => {
		if (!deactivateUser?.id) return;
		setIsStatusLoading(true);
		try {
			await adminService.deactivateUser(deactivateUser.id);
			toast.success("Super user deactivated");
			setDeactivateUser(null);
			queryClient.invalidateQueries({ queryKey: ["admin", "super-users"] });
		} catch {}
		setIsStatusLoading(false);
	};

	const handleActivate = async () => {
		if (!activateUser?.id) return;
		setIsStatusLoading(true);
		try {
			await adminService.activateUser(activateUser.id);
			toast.success("Super user activated");
			setActivateUser(null);
			queryClient.invalidateQueries({ queryKey: ["admin", "super-users"] });
		} catch {}
		setIsStatusLoading(false);
	};

	const handleChangePassword = async (user: UserInfo) => {
		setChangePasswordUser(user);
		setIsResettingPassword(true);
		try {
			const res = await adminService.resetUserPassword(user.id);
			setResetPassword(res.temporaryPassword ?? null);
		} catch {
			setChangePasswordUser(null);
		} finally {
			setIsResettingPassword(false);
		}
	};

	return (
		<div className="h-full flex flex-col overflow-hidden">
			{/* Header */}
			<div className="flex-shrink-0 px-6 py-4 border-b bg-card/50">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
							<Shield className="h-5 w-5 text-primary" />
						</div>
						<div>
							<h1 className="text-xl font-semibold">Support Team</h1>
							<p className="text-sm text-muted-foreground">Manage super users who can view all company data</p>
						</div>
					</div>
					<Button onClick={() => setCreateModalOpen(true)}>
						<Plus className="h-4 w-4 mr-2" />
						Create Super User
					</Button>
				</div>
			</div>

			{/* Search */}
			<div className="flex-shrink-0 px-6 py-4 border-b flex items-center gap-4">
				<div className="relative w-72">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search by name or email..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>
				<span className="text-sm text-muted-foreground">
					{users.length} super user{users.length !== 1 ? "s" : ""}
				</span>
			</div>

			{/* Table */}
			<div className="flex-1 overflow-hidden px-6 py-4">
				<SuperUserTable
					users={filtered}
					isLoading={isLoading}
					onChangePassword={handleChangePassword}
					onDeactivate={setDeactivateUser}
					onActivate={setActivateUser}
					onNotifications={setNotifUser}
					onManageCompanies={setManageCompaniesUser}
					onDelete={setDeleteUser}
				/>
			</div>

			{/* Modals */}
			<CreateSuperUserModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} />

			<NotificationAssignmentModal user={notifUser} open={!!notifUser} onClose={() => setNotifUser(null)} />

			<ManageCompaniesModal
				user={manageCompaniesUser}
				open={!!manageCompaniesUser}
				onClose={() => setManageCompaniesUser(null)}
			/>

			{/* Change password result modal */}
			<Dialog
				open={!!changePasswordUser}
				onOpenChange={() => {
					setChangePasswordUser(null);
					setResetPassword(null);
				}}
			>
				<DialogContent className="sm:max-w-[400px]">
					<DialogHeader>
						<DialogTitle>Password Reset</DialogTitle>
						<DialogDescription>
							{isResettingPassword
								? "Generating new temporary password..."
								: `New temporary password for ${changePasswordUser?.name}. Share it with them directly.`}
						</DialogDescription>
					</DialogHeader>
					{isResettingPassword ? (
						<div className="flex justify-center py-6">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : (
						<div className="py-2 space-y-3">
							{resetPassword ? (
								<div className="p-4 bg-muted rounded-lg flex items-center justify-between gap-2">
									<code className="font-mono text-base">{resetPassword}</code>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => {
											navigator.clipboard.writeText(resetPassword);
											toast.success("Password copied");
										}}
									>
										<Copy className="h-4 w-4" />
									</Button>
								</div>
							) : (
								<p className="text-sm text-muted-foreground">Password reset email has been sent to the user.</p>
							)}
						</div>
					)}
					<DialogFooter>
						<Button
							onClick={() => {
								setChangePasswordUser(null);
								setResetPassword(null);
							}}
							disabled={isResettingPassword}
						>
							<Check className="h-4 w-4 mr-2" />
							Done
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<ConfirmModal
				open={!!deactivateUser}
				onClose={() => setDeactivateUser(null)}
				onConfirm={handleDeactivate}
				isLoading={isStatusLoading}
				title="Deactivate Super User"
				description={`Deactivate ${deactivateUser?.name}? They will lose access immediately.`}
				confirmText="Deactivate"
				variant="destructive"
			/>

			<ConfirmModal
				open={!!activateUser}
				onClose={() => setActivateUser(null)}
				onConfirm={handleActivate}
				isLoading={isStatusLoading}
				title="Activate Super User"
				description={`Restore access for ${activateUser?.name}?`}
				confirmText="Activate"
			/>

			<ConfirmModal
				open={!!deleteUser}
				onClose={() => setDeleteUser(null)}
				onConfirm={handleDelete}
				title="Delete Super User"
				description={`Permanently delete ${deleteUser?.name}? This cannot be undone.`}
				confirmText="Delete"
				variant="destructive"
			/>
		</div>
	);
}
