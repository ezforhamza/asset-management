import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";

import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/ui/alert-dialog";
import { Button } from "@/ui/button";

interface ConfirmModalProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => Promise<void>;
	title: string;
	description: string;
	confirmText?: string;
	variant?: "default" | "destructive";
}

export function ConfirmModal({
	open,
	onClose,
	onConfirm,
	title,
	description,
	confirmText = "Confirm",
	variant = "default",
}: ConfirmModalProps) {
	const [loading, setLoading] = useState(false);

	const handleConfirm = async () => {
		setLoading(true);
		try {
			await onConfirm();
			onClose();
		} finally {
			setLoading(false);
		}
	};

	return (
		<AlertDialog open={open} onOpenChange={onClose}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle className="flex items-center gap-2">
						{variant === "destructive" && <AlertTriangle className="h-5 w-5 text-red-500" />}
						{title}
					</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<Button variant="outline" onClick={onClose} disabled={loading}>
						Cancel
					</Button>
					<Button
						variant={variant === "destructive" ? "destructive" : "default"}
						onClick={handleConfirm}
						disabled={loading}
					>
						{loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
						{confirmText}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export default ConfirmModal;
