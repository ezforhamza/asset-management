import { AlertTriangle, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
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
	const previousOpenRef = useRef(open);

	// Ensure body scroll is restored when modal closes
	useEffect(() => {
		if (previousOpenRef.current && !open) {
			// Modal just closed - ensure body is interactive
			document.body.style.pointerEvents = "";
			document.body.style.overflow = "";
		}
		previousOpenRef.current = open;
	}, [open]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			document.body.style.pointerEvents = "";
			document.body.style.overflow = "";
		};
	}, []);

	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen && !isLoading) {
			onClose();
		}
	};

	const handleConfirm = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (!isLoading) {
			onConfirm();
		}
	};

	const handleCancel = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (!isLoading) {
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
					<AlertDialogCancel disabled={isLoading} onClick={handleCancel}>
						{cancelText}
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleConfirm}
						className={variant === "destructive" ? "bg-destructive hover:bg-destructive/90" : ""}
						disabled={isLoading}
					>
						{isLoading ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Processing...
							</>
						) : (
							confirmText
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
