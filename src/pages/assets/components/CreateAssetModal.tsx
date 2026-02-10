import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import assetCategoryService from "@/api/services/assetCategoryService";
import assetService, { type CreateAssetReq } from "@/api/services/assetService";
import siteNameService from "@/api/services/siteNameService";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Textarea } from "@/ui/textarea";

interface CreateAssetModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const initialFormState: CreateAssetReq = {
	serialNumber: "",
	make: "",
	model: "",
	category: "",
	condition: "",
	verificationFrequency: undefined,
	locationDescription: "",
	notes: "",
	channel: "",
	siteName: "",
	siteNameId: "",
	client: "",
	geofenceThreshold: undefined,
};

export function CreateAssetModal({ open, onOpenChange }: CreateAssetModalProps) {
	const queryClient = useQueryClient();
	const [form, setForm] = useState<CreateAssetReq>(initialFormState);

	// Fetch categories for dropdown
	const { data: categoriesData } = useQuery({
		queryKey: ["asset-categories", 1, 100],
		queryFn: () => assetCategoryService.getCategories({ page: 1, limit: 100 }),
		enabled: open,
	});

	// Fetch site names for dropdown
	const { data: siteNamesData } = useQuery({
		queryKey: ["site-names", 1, 100],
		queryFn: () => siteNameService.getSiteNames({ page: 1, limit: 100, sortBy: "name:asc" }),
		enabled: open,
	});

	const createMutation = useMutation({
		mutationFn: (data: CreateAssetReq) => assetService.createAsset(data),
		onSuccess: () => {
			toast.success("Asset created successfully");
			queryClient.invalidateQueries({ queryKey: ["assets"] });
			handleClose();
		},
		onError: () => {
			// Error toast is handled by apiClient;
		},
	});

	const handleClose = () => {
		setForm(initialFormState);
		onOpenChange(false);
	};

	const handleSubmit = () => {
		// Validate required fields
		if (!form.serialNumber.trim()) {
			toast.error("Serial number is required");
			return;
		}
		if (!form.make.trim()) {
			toast.error("Make is required");
			return;
		}
		if (!form.model.trim()) {
			toast.error("Model is required");
			return;
		}
		if (!form.category) {
			toast.error("Category is required");
			return;
		}

		// Build request data, only include optional fields if they have values
		const requestData: CreateAssetReq = {
			serialNumber: form.serialNumber.trim(),
			make: form.make.trim(),
			model: form.model.trim(),
			category: form.category,
		};

		if (form.condition?.trim()) {
			requestData.condition = form.condition.trim();
		}
		if (form.verificationFrequency) {
			requestData.verificationFrequency = form.verificationFrequency;
		}
		if (form.locationDescription?.trim()) {
			requestData.locationDescription = form.locationDescription.trim();
		}
		if (form.notes?.trim()) {
			requestData.notes = form.notes.trim();
		}
		if (form.channel?.trim()) {
			requestData.channel = form.channel.trim();
		}
		if (form.siteNameId?.trim()) {
			requestData.siteNameId = form.siteNameId.trim();
		}
		if (form.client?.trim()) {
			requestData.client = form.client.trim();
		}
		if (form.geofenceThreshold) {
			requestData.geofenceThreshold = form.geofenceThreshold;
		}

		createMutation.mutate(requestData);
	};

	const activeCategories = categoriesData?.results?.filter((c) => c.status === "active") || [];

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>Create New Asset</DialogTitle>
					<DialogDescription>Fill in the details to create a new asset</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
					{/* Serial Number - Required */}
					<div className="space-y-2">
						<Label>
							Serial Number <span className="text-destructive">*</span>
						</Label>
						<Input
							placeholder="e.g., SN-GEN-001"
							value={form.serialNumber}
							onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
						/>
					</div>

					{/* Make & Model - Required */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label>
								Make <span className="text-destructive">*</span>
							</Label>
							<Input
								placeholder="e.g., Caterpillar"
								value={form.make}
								onChange={(e) => setForm({ ...form, make: e.target.value })}
							/>
						</div>
						<div className="space-y-2">
							<Label>
								Model <span className="text-destructive">*</span>
							</Label>
							<Input
								placeholder="e.g., C15"
								value={form.model}
								onChange={(e) => setForm({ ...form, model: e.target.value })}
							/>
						</div>
					</div>

					{/* Category - Required */}
					<div className="space-y-2">
						<Label>
							Category <span className="text-destructive">*</span>
						</Label>
						<Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
							<SelectTrigger>
								<SelectValue placeholder="Select a category" />
							</SelectTrigger>
							<SelectContent>
								{activeCategories.map((category) => (
									<SelectItem key={category.id} value={category.name}>
										{category.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Condition & Verification Frequency - Optional */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label>Condition</Label>
							<Select value={form.condition || ""} onValueChange={(value) => setForm({ ...form, condition: value })}>
								<SelectTrigger>
									<SelectValue placeholder="Select condition" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="good">Good</SelectItem>
									<SelectItem value="fair">Fair</SelectItem>
									<SelectItem value="poor">Poor</SelectItem>
									<SelectItem value="unknown">Unknown</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Verification Frequency (days)</Label>
							<Input
								type="number"
								min={1}
								placeholder="e.g., 30"
								value={form.verificationFrequency || ""}
								onChange={(e) =>
									setForm({
										...form,
										verificationFrequency: e.target.value ? parseInt(e.target.value) : undefined,
									})
								}
							/>
						</div>
					</div>

					{/* Location - Optional */}
					<div className="space-y-2">
						<Label>Location Description</Label>
						<Input
							placeholder="e.g., Main Building - Floor 2"
							value={form.locationDescription || ""}
							onChange={(e) => setForm({ ...form, locationDescription: e.target.value })}
						/>
					</div>

					{/* Notes - Optional */}
					<div className="space-y-2">
						<Label>Notes</Label>
						<Textarea
							placeholder="Additional notes about the asset..."
							value={form.notes || ""}
							onChange={(e) => setForm({ ...form, notes: e.target.value })}
							rows={3}
						/>
					</div>

					{/* Channel & Client - Optional */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label>Channel</Label>
							<Input
								placeholder="e.g., retail"
								value={form.channel || ""}
								onChange={(e) => setForm({ ...form, channel: e.target.value })}
							/>
						</div>
						<div className="space-y-2">
							<Label>Client</Label>
							<Input
								placeholder="e.g., ABC Corporation"
								value={form.client || ""}
								onChange={(e) => setForm({ ...form, client: e.target.value })}
							/>
						</div>
					</div>

					{/* Site Name & Geofence Threshold - Optional */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label>Site Name</Label>
							<Select value={form.siteNameId || ""} onValueChange={(value) => setForm({ ...form, siteNameId: value })}>
								<SelectTrigger>
									<SelectValue placeholder="Select a site name" />
								</SelectTrigger>
								<SelectContent>
									{siteNamesData?.results?.map((sn) => (
										<SelectItem key={sn.id} value={sn.id}>
											{sn.name}
										</SelectItem>
									))}
									{(!siteNamesData?.results || siteNamesData.results.length === 0) && (
										<div className="px-2 py-1.5 text-sm text-muted-foreground">No site names available</div>
									)}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Geofence Threshold (meters)</Label>
							<Input
								type="number"
								min={1}
								placeholder="e.g., 100"
								value={form.geofenceThreshold || ""}
								onChange={(e) =>
									setForm({
										...form,
										geofenceThreshold: e.target.value ? parseInt(e.target.value) : undefined,
									})
								}
							/>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={handleClose}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={createMutation.isPending}>
						{createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
						Create Asset
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
