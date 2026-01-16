import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
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
	onConfirm: () => void;
	title: string;
	description: string;
	confirmText?: string;
	variant?: "default" | "destructive";
	isLoading?: boolean;
	/** Called after modal exit animation completes and overlay is fully unmounted */
	onExitComplete?: () => void;
}

// Animation duration matches AlertDialogContent's duration-200 class
const MODAL_ANIMATION_DURATION = 250;

export function ConfirmModal({
	open,
	onClose,
	onConfirm,
	title,
	description,
	confirmText = "Confirm",
	variant = "default",
	isLoading = false,
	onExitComplete,
}: ConfirmModalProps) {
	const wasOpen = useRef<boolean>(open);
	const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	// Stabilize callback ref to prevent effect re-runs
	const onExitCompleteRef = useRef(onExitComplete);
	onExitCompleteRef.current = onExitComplete;

	// Track when modal closes and call onExitComplete after animation
	useEffect(() => {
		if (wasOpen.current && !open) {
			// Modal is closing - wait for animation to complete
			exitTimeoutRef.current = setTimeout(() => {
				onExitCompleteRef.current?.();
			}, MODAL_ANIMATION_DURATION);
		}
		wasOpen.current = open;

		return () => {
			if (exitTimeoutRef.current) {
				clearTimeout(exitTimeoutRef.current);
			}
		};
	}, [open]); // Removed onExitComplete from deps - using ref instead

	// Defensive cleanup: Reset body-level locks that Radix might leave behind
	// This addresses the root cause of UI freeze: orphaned pointer-events/overflow locks
	useEffect(() => {
		if (!open) {
			const cleanupTimeout = setTimeout(() => {
				// Reset pointer-events that Radix may have set
				if (document.body.style.pointerEvents === "none") {
					document.body.style.pointerEvents = "";
				}
				// Reset overflow lock
				if (document.body.style.overflow === "hidden") {
					document.body.style.overflow = "";
				}
				// Remove aria-hidden from sibling elements (focus trap side effect)
				[...document.body.children].forEach((child) => {
					if (child instanceof HTMLElement && child.getAttribute("aria-hidden") === "true") {
						child.removeAttribute("aria-hidden");
					}
				});
			}, MODAL_ANIMATION_DURATION + 50); // After animation completes

			return () => clearTimeout(cleanupTimeout);
		}
	}, [open]);

	// Prevent closing during loading state (ESC key and outside click)
	const handleOpenChange = useCallback(
		(isOpen: boolean) => {
			if (!isOpen && !isLoading) {
				onClose();
			}
		},
		[isLoading, onClose],
	);

	// Handle cancel button click
	const handleCancel = useCallback(() => {
		if (!isLoading) {
			onClose();
		}
	}, [isLoading, onClose]);

	return (
		<AlertDialog open={open} onOpenChange={handleOpenChange}>
			<AlertDialogContent
				// Prevent ESC key from closing during loading
				onEscapeKeyDown={(e) => {
					if (isLoading) {
						e.preventDefault();
					}
				}}
			>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<Button variant="outline" onClick={handleCancel} disabled={isLoading}>
						Cancel
					</Button>
					<Button variant={variant} onClick={onConfirm} disabled={isLoading}>
						{isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
						{confirmText}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
