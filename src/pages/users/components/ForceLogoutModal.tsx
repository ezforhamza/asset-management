import { Loader2, LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserInfo } from "#/entity";
import sessionService from "@/api/services/sessionService";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/ui/alert-dialog";

interface ForceLogoutModalProps {
	user: UserInfo | null;
	open: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

export function ForceLogoutModal({ user, open, onClose, onSuccess }: ForceLogoutModalProps) {
	const [isLoading, setIsLoading] = useState(false);

	const handleForceLogout = async () => {
		if (!user?.id) return;

		setIsLoading(true);
		try {
			await sessionService.terminateAllUserSessions(user.id);
			toast.success(`All sessions for ${user.name} have been terminated`);
			onSuccess();
			onClose();
		} catch {
			// Error toast is handled by apiClient;
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle className="flex items-center gap-2">
						<LogOut className="h-5 w-5 text-destructive" />
						Force Logout User
					</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to force logout <strong>{user?.name}</strong>? This will terminate all their active
						sessions and they will be required to log in again.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleForceLogout}
						disabled={isLoading}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{isLoading ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Logging out...
							</>
						) : (
							<>
								<LogOut className="h-4 w-4 mr-2" />
								Force Logout
							</>
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export default ForceLogoutModal;
