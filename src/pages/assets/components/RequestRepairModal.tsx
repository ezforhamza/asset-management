import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Wrench } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Asset } from "#/entity";
import notificationService from "@/api/services/notificationService";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Label } from "@/ui/label";
import { Textarea } from "@/ui/textarea";

interface RequestRepairModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	asset: Asset | null;
}

export function RequestRepairModal({ open, onOpenChange, asset }: RequestRepairModalProps) {
	const queryClient = useQueryClient();
	const [explanation, setExplanation] = useState("");

	const mutation = useMutation({
		mutationFn: (data: { assetId: string; explanation?: string }) =>
			notificationService.requestRepair(data),
		onSuccess: () => {
			toast.success("Repair request submitted successfully");
			queryClient.invalidateQueries({ queryKey: ["assets"] });
			handleClose();
		},
		onError: () => {
			// Error toast is handled by apiClient
		},
	});

	const handleClose = () => {
		setExplanation("");
		onOpenChange(false);
	};

	const handleSubmit = () => {
		if (!asset) return;

		const assetId = asset.id || asset._id || "";
		const payload: { assetId: string; explanation?: string } = { assetId };
		
		if (explanation.trim()) {
			payload.explanation = explanation.trim();
		}

		mutation.mutate(payload);
	};

	if (!asset) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Wrench className="h-5 w-5" />
						Request Repair
					</DialogTitle>
					<DialogDescription>
						Submit a repair request for asset <strong>{asset.serialNumber}</strong>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{/* Asset Info */}
					<div className="p-3 bg-muted/50 rounded-md space-y-1">
						<p className="text-sm text-muted-foreground">
							Serial Number: <span className="font-medium text-foreground">{asset.serialNumber}</span>
						</p>
						<p className="text-sm text-muted-foreground">
							Make / Model:{" "}
							<span className="font-medium text-foreground">
								{asset.make} {asset.model}
							</span>
						</p>
					</div>

					{/* Explanation */}
					<div className="space-y-2">
						<Label htmlFor="explanation">Repair Explanation (Optional)</Label>
						<Textarea
							id="explanation"
							placeholder="Describe the issue or reason for repair..."
							value={explanation}
							onChange={(e) => setExplanation(e.target.value)}
							rows={4}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={mutation.isPending}>
						{mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
						Submit Request
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default RequestRepairModal;
