import { Check, Copy, KeyRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";

interface PasswordResetModalProps {
	open: boolean;
	onClose: () => void;
	userName: string;
	temporaryPassword: string;
}

export function PasswordResetModal({ open, onClose, userName, temporaryPassword }: PasswordResetModalProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(temporaryPassword);
			setCopied(true);
			toast.success("Password copied to clipboard");
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Failed to copy password");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<div className="flex items-center gap-3 mb-2">
						<div className="rounded-full bg-green-500/10 p-2">
							<KeyRound className="h-5 w-5 text-green-500" />
						</div>
						<DialogTitle>Password Reset Successful</DialogTitle>
					</div>
					<DialogDescription>
						A temporary password has been generated for <strong>{userName}</strong>. They will be required to change it
						on their next login.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">Temporary Password</label>
						<div className="flex gap-2">
							<Input value={temporaryPassword} readOnly className="font-mono" />
							<Button onClick={handleCopy} variant="outline" size="icon" className="shrink-0">
								{copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
							</Button>
						</div>
					</div>

					<div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
						<p className="text-sm text-amber-600 dark:text-amber-500">
							<strong>Important:</strong> Make sure to copy this password now. For security reasons, it won't be shown
							again.
						</p>
					</div>
				</div>

				<DialogFooter>
					<Button onClick={onClose} className="w-full">
						Done
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
