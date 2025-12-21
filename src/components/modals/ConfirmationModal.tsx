import { AlertTriangle } from "lucide-react";
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

interface ConfirmationModalProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	description: string;
	confirmText?: string;
	cancelText?: string;
	variant?: "default" | "destructive";
	isLoading?: boolean;
}

export function ConfirmationModal({
	open,
	onClose,
	onConfirm,
	title,
	description,
	confirmText = "Confirm",
	cancelText = "Cancel",
	variant = "default",
	isLoading = false,
}: ConfirmationModalProps) {
	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen && !isLoading) {
			onClose();
		}
	};

	return (
		<AlertDialog open={open} onOpenChange={handleOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<div className="flex items-center gap-3">
						{variant === "destructive" && (
							<div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
								<AlertTriangle className="h-5 w-5 text-destructive" />
							</div>
						)}
						<AlertDialogTitle>{title}</AlertDialogTitle>
					</div>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isLoading} onClick={onClose}>
						{cancelText}
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={(e) => {
							e.preventDefault();
							if (!isLoading) {
								onConfirm();
							}
						}}
						className={variant === "destructive" ? "bg-destructive hover:bg-destructive/90" : ""}
						disabled={isLoading}
					>
						{isLoading ? "Processing..." : confirmText}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
