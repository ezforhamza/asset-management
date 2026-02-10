import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Asset } from "#/entity";
import assetMovementService, { type CreateAssetMovementReq } from "@/api/services/assetMovementService";
import { Button } from "@/ui/button";
import { Calendar } from "@/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Textarea } from "@/ui/textarea";
import { cn } from "@/utils/index";

interface RequestMovementModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	asset: Asset | null;
}

interface FormState {
	collectionDatetime: Date | undefined;
	collectionTime: string;
	deliveryDestinationText: string;
	destinationType: "warehouse" | "client_location" | "";
	movementInstructions: string;
}

const initialFormState: FormState = {
	collectionDatetime: undefined,
	collectionTime: "09:00",
	deliveryDestinationText: "",
	destinationType: "",
	movementInstructions: "",
};

export function RequestMovementModal({ open, onOpenChange, asset }: RequestMovementModalProps) {
	const queryClient = useQueryClient();
	const [form, setForm] = useState<FormState>(initialFormState);

	const createMutation = useMutation({
		mutationFn: (data: CreateAssetMovementReq) => assetMovementService.createAssetMovement(data),
		onSuccess: () => {
			toast.success("Movement request created successfully");
			queryClient.invalidateQueries({ queryKey: ["asset-movements"] });
			queryClient.invalidateQueries({ queryKey: ["assets"] });
			queryClient.invalidateQueries({ queryKey: ["assets-all-for-filters"] });
			handleClose();
		},
		onError: () => {
			// Error toast is handled by apiClient
		},
	});

	const handleClose = () => {
		setForm(initialFormState);
		onOpenChange(false);
	};

	const handleSubmit = () => {
		if (!asset) return;

		// Validate required fields
		if (!form.collectionDatetime) {
			toast.error("Collection date is required");
			return;
		}
		if (!form.deliveryDestinationText.trim()) {
			toast.error("Delivery destination is required");
			return;
		}
		if (!form.destinationType) {
			toast.error("Destination type is required");
			return;
		}

		// Combine date and time
		const [hours, minutes] = form.collectionTime.split(":").map(Number);
		const collectionDate = new Date(form.collectionDatetime);
		collectionDate.setHours(hours, minutes, 0, 0);

		const requestData: CreateAssetMovementReq = {
			assetId: asset.id || asset._id || "",
			collectionDatetime: collectionDate.toISOString(),
			deliveryDestinationText: form.deliveryDestinationText.trim(),
			destinationType: form.destinationType as "warehouse" | "client_location",
		};

		if (form.movementInstructions.trim()) {
			requestData.movementInstructions = form.movementInstructions.trim();
		}

		createMutation.mutate(requestData);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>Request Asset Movement</DialogTitle>
					<DialogDescription>
						Request movement for asset <strong>{asset?.serialNumber}</strong>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{/* Asset Info */}
					<div className="p-3 bg-muted/50 rounded-md space-y-1">
						<p className="text-sm text-muted-foreground">
							Serial Number: <span className="font-medium text-foreground">{asset?.serialNumber}</span>
						</p>
						<p className="text-sm text-muted-foreground">
							Make / Model:{" "}
							<span className="font-medium text-foreground">
								{asset?.make} {asset?.model}
							</span>
						</p>
						{asset?.location && (
							<p className="text-sm text-muted-foreground">
								Current Location:{" "}
								<span className="font-medium text-foreground">
									{asset.location.latitude.toFixed(4)}, {asset.location.longitude.toFixed(4)}
								</span>
							</p>
						)}
					</div>

					{/* Collection Date & Time */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label>
								Collection Date <span className="text-destructive">*</span>
							</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											"w-full justify-start text-left font-normal",
											!form.collectionDatetime && "text-muted-foreground",
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{form.collectionDatetime ? format(form.collectionDatetime, "PPP") : "Pick a date"}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={form.collectionDatetime}
										onSelect={(date) => setForm({ ...form, collectionDatetime: date })}
										disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
						</div>
						<div className="space-y-2">
							<Label>
								Collection Time <span className="text-destructive">*</span>
							</Label>
							<Input
								type="time"
								value={form.collectionTime}
								onChange={(e) => setForm({ ...form, collectionTime: e.target.value })}
							/>
						</div>
					</div>

					{/* Delivery Destination */}
					<div className="space-y-2">
						<Label>
							Delivery Destination <span className="text-destructive">*</span>
						</Label>
						<Input
							placeholder="123 long street"
							value={form.deliveryDestinationText}
							onChange={(e) => setForm({ ...form, deliveryDestinationText: e.target.value })}
						/>
					</div>

					{/* Destination Type */}
					<div className="space-y-2">
						<Label>
							Destination Type <span className="text-destructive">*</span>
						</Label>
						<Select
							value={form.destinationType}
							onValueChange={(value: "warehouse" | "client_location") => setForm({ ...form, destinationType: value })}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select destination type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="warehouse">Warehouse</SelectItem>
								<SelectItem value="client_location">Client Location</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Movement Instructions */}
					<div className="space-y-2">
						<Label>Movement Instructions</Label>
						<Textarea
							placeholder="e.g., Handle with care. Requires two people to move."
							value={form.movementInstructions}
							onChange={(e) => setForm({ ...form, movementInstructions: e.target.value })}
							rows={3}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={handleClose}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={createMutation.isPending}>
						{createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
						Request Movement
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
