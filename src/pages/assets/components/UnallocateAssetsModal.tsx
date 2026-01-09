import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import allocationService, {
	type AllocationOperationRes,
	type UnallocateAssetsReq,
} from "@/api/services/allocationService";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";

interface UnallocateAssetsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	assetIds: string[];
}

export function UnallocateAssetsModal({ open, onOpenChange, assetIds }: UnallocateAssetsModalProps) {
	const queryClient = useQueryClient();

	const unallocateMutation = useMutation({
		mutationFn: (data: UnallocateAssetsReq) => allocationService.unallocateAssets(data),
		onSuccess: (response: AllocationOperationRes) => {
			const { unallocated = [], notAllocated = [], notFound = [], wrongCompany = [] } = response;

			if (unallocated.length > 0) {
				toast.success(`Successfully unallocated ${unallocated.length} asset${unallocated.length !== 1 ? "s" : ""}`);
			}

			if (notAllocated.length > 0) {
				toast.warning(`${notAllocated.length} asset(s) were not allocated`);
			}

			if (notFound.length > 0) {
				toast.error(`${notFound.length} asset(s) not found`);
			}

			if (wrongCompany.length > 0) {
				toast.error(`${wrongCompany.length} asset(s) belong to different company`);
			}

			queryClient.invalidateQueries({ queryKey: ["assets"] });
			queryClient.invalidateQueries({ queryKey: ["allocation-summary"] });
			onOpenChange(false);
		},
		onError: () => {
			toast.error("Failed to unallocate assets");
		},
	});

	const handleConfirm = () => {
		unallocateMutation.mutate({ assetIds });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5 text-destructive" />
						Unallocate Assets
					</DialogTitle>
					<DialogDescription>
						Are you sure you want to unallocate {assetIds.length} asset{assetIds.length !== 1 ? "s" : ""}? They will no
						longer be assigned to any field worker.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={unallocateMutation.isPending}>
						Cancel
					</Button>
					<Button variant="destructive" onClick={handleConfirm} disabled={unallocateMutation.isPending}>
						{unallocateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
						Unallocate
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
