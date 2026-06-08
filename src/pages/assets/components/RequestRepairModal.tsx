import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Wrench } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Asset } from "#/entity";
import notificationService from "@/api/services/notificationService";
import type { CoolingRepairFormData } from "@/api/services/repairRequestService";
import repairRequestService from "@/api/services/repairRequestService";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Label } from "@/ui/label";
import { Textarea } from "@/ui/textarea";
import { CoolingRepairForm } from "@/components/CoolingRepairForm";

const DEFAULT_COOLING_FORM: CoolingRepairFormData = {
	branchName: "",
	invoiceNumber: "",
	province: "",
	contactPersonOnSite: "",
	contactNumberOnSite: "",
	problem: "",
	generalInformation: "",
	tradingHoursStart: "08:00",
	tradingHoursEnd: "17:00",
	techCallBeforeAttending: false,
	complaints: {
		lightsNotWorking: false,
		fanNotTurning: false,
		coolerTrippingPower: false,
		coolerNotCoolingCompressorRunning: false,
		doorsNotClosing: false,
		coolerLeakingWaterBottom: false,
		coolerLeakingWaterInside: false,
	},
	troubleshooting: {
		doorsNotSlidingClosed: { installedOnLevelSurface: false, doorsMovingFreely: false },
		notCoolingBlowingHotAir: {
			sufficientSpaceBehindCooler: false,
			productBlockingAirflow: false,
			condenserBlocked: false,
		},
		iceBuildingOnEvaporatorCoil: {
			shelvesAtEqualIntervals: false,
			shelvesWithProtectiveLip: false,
			coldAirFlowingFreely: false,
			customerAdjustedThermostat: false,
		},
		coolerTrippingPower: { adequatePowerSupplied: false, pluggedDirectlyIntoWall: false, pluggedIntoMultiPlug: false },
	},
};

interface RequestRepairModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	asset: Asset | null;
}

export function RequestRepairModal({ open, onOpenChange, asset }: RequestRepairModalProps) {
	const queryClient = useQueryClient();
	const [explanation, setExplanation] = useState("");
	const [coolingForm, setCoolingForm] = useState<CoolingRepairFormData>(DEFAULT_COOLING_FORM);

	const isCooling = asset?.category?.name?.toLowerCase() === "cooling equipment";

	const mutation = useMutation({
		mutationFn: async () => {
			if (!asset) return;
			const assetId = asset.id || asset._id || "";

			if (isCooling) {
				return repairRequestService.createRepairRequest(assetId, {
					notes: explanation.trim() || undefined,
					coolingRepairForm: coolingForm,
				});
			}

			return notificationService.requestRepair({
				assetId,
				explanation: explanation.trim() || undefined,
			});
		},
		onSuccess: (data) => {
			if (isCooling && data && "isCoolingEquipment" in data) {
				toast.success("Repair request submitted. Cooling repair PDF sent to recipients.");
			} else {
				toast.success("Repair request submitted successfully");
			}
			queryClient.invalidateQueries({ queryKey: ["assets"] });
			handleClose();
		},
		onError: () => {
			// Error toast is handled by apiClient
		},
	});

	const handleClose = () => {
		setExplanation("");
		setCoolingForm(DEFAULT_COOLING_FORM);
		onOpenChange(false);
	};

	const isCoolingFormValid =
		!isCooling ||
		(coolingForm.branchName.trim() &&
			coolingForm.invoiceNumber.trim() &&
			coolingForm.province.trim() &&
			coolingForm.contactPersonOnSite.trim() &&
			coolingForm.contactNumberOnSite.trim() &&
			coolingForm.problem.trim());

	if (!asset) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className={isCooling ? "sm:max-w-[640px] max-h-[90vh] overflow-y-auto" : "sm:max-w-[480px]"}>
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
						{asset.category?.name && (
							<p className="text-sm text-muted-foreground">
								Category: <span className="font-medium text-foreground">{asset.category.name}</span>
							</p>
						)}
					</div>

					{/* Notes / Explanation */}
					<div className="space-y-2">
						<Label htmlFor="explanation">
							{isCooling ? "Additional Notes (Optional)" : "Repair Explanation (Optional)"}
						</Label>
						<Textarea
							id="explanation"
							placeholder="Describe the issue or reason for repair..."
							value={explanation}
							onChange={(e) => setExplanation(e.target.value)}
							rows={isCooling ? 2 : 4}
						/>
					</div>

					{/* Cooling Equipment extended form */}
					{isCooling && <CoolingRepairForm value={coolingForm} onChange={setCoolingForm} />}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
						Cancel
					</Button>
					<Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !isCoolingFormValid}>
						{mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
						Submit Request
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default RequestRepairModal;
