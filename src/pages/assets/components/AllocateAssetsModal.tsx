import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, UserCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import allocationService, {
	type AllocateAssetsReq,
	type AllocationOperationRes,
} from "@/api/services/allocationService";
import userService from "@/api/services/userService";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

interface AllocateAssetsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	assetIds: string[];
	mode: "allocate" | "reassign";
}

export function AllocateAssetsModal({ open, onOpenChange, assetIds, mode }: AllocateAssetsModalProps) {
	const queryClient = useQueryClient();
	const [selectedFieldWorker, setSelectedFieldWorker] = useState<string>("");

	// Fetch field workers
	const { data: usersData, isLoading: isLoadingUsers } = useQuery({
		queryKey: ["users", 1, 1000],
		queryFn: () => userService.getUsers({ page: 1, limit: 1000 }),
		enabled: open,
	});

	const fieldWorkers = usersData?.results?.filter((u) => u.role === "field_user") || [];

	const allocateMutation = useMutation({
		mutationFn: (data: AllocateAssetsReq | { assetIds: string[]; newFieldWorkerId: string }) =>
			mode === "allocate"
				? allocationService.allocateAssets(data as AllocateAssetsReq)
				: allocationService.reassignAssets(data as { assetIds: string[]; newFieldWorkerId: string }),
		onSuccess: (response: AllocationOperationRes) => {
			const { allocated = [], reassigned = [], alreadyAllocated = [], notFound = [], wrongCompany = [] } = response;

			const successCount = mode === "allocate" ? allocated.length : reassigned.length;

			if (successCount > 0) {
				toast.success(
					`Successfully ${mode === "allocate" ? "allocated" : "reassigned"} ${successCount} asset${successCount !== 1 ? "s" : ""}`,
				);
			}

			if (alreadyAllocated.length > 0) {
				toast.warning(`${alreadyAllocated.length} asset(s) already allocated`);
			}

			if (notFound.length > 0) {
				toast.error(`${notFound.length} asset(s) not found`);
			}

			if (wrongCompany.length > 0) {
				toast.error(`${wrongCompany.length} asset(s) belong to different company`);
			}

			queryClient.invalidateQueries({ queryKey: ["assets"] });
			queryClient.invalidateQueries({ queryKey: ["allocation-summary"] });
			handleClose();
		},
		onError: () => {
			toast.error(`Failed to ${mode} assets`);
		},
	});

	const handleSubmit = () => {
		if (!selectedFieldWorker) {
			toast.error("Please select a field worker");
			return;
		}

		if (mode === "allocate") {
			allocateMutation.mutate({
				assetIds,
				fieldWorkerId: selectedFieldWorker,
			});
		} else {
			allocateMutation.mutate({
				assetIds,
				newFieldWorkerId: selectedFieldWorker,
			});
		}
	};

	const handleClose = () => {
		setSelectedFieldWorker("");
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<UserCheck className="h-5 w-5" />
						{mode === "allocate" ? "Allocate Assets" : "Reassign Assets"}
					</DialogTitle>
					<DialogDescription>
						{mode === "allocate"
							? `Allocate ${assetIds.length} asset${assetIds.length !== 1 ? "s" : ""} to a field worker.`
							: `Reassign ${assetIds.length} asset${assetIds.length !== 1 ? "s" : ""} to a different field worker.`}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label>Select Field Worker</Label>
						{isLoadingUsers ? (
							<div className="flex items-center justify-center py-8">
								<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
							</div>
						) : fieldWorkers.length === 0 ? (
							<p className="text-sm text-muted-foreground py-4 text-center">
								No field workers available in your company
							</p>
						) : (
							<Select value={selectedFieldWorker} onValueChange={setSelectedFieldWorker}>
								<SelectTrigger>
									<SelectValue placeholder="Choose a field worker" />
								</SelectTrigger>
								<SelectContent>
									{fieldWorkers.map((worker) => (
										<SelectItem key={worker.id} value={worker.id}>
											<div className="flex flex-col">
												<span>{worker.name}</span>
												<span className="text-xs text-muted-foreground">{worker.email}</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={handleClose} disabled={allocateMutation.isPending}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={allocateMutation.isPending || !selectedFieldWorker}>
						{allocateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
						{mode === "allocate" ? "Allocate" : "Reassign"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
