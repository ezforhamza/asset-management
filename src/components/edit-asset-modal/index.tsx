import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { Asset } from "#/entity";
import assetService, { type UpdateAssetReq } from "@/api/services/assetService";
import companyService from "@/api/services/companyService";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Textarea } from "@/ui/textarea";
import { getRegionOptions } from "@/utils/countryRegion";

interface EditAssetModalProps {
	asset: Asset | null;
	open: boolean;
	onClose: () => void;
	queryKeysToInvalidate?: unknown[][];
}

type FormValues = Pick<
	UpdateAssetReq,
	| "make"
	| "model"
	| "condition"
	| "notes"
	| "client"
	| "channel"
	| "siteName"
	| "region"
	| "verificationFrequency"
	| "geofenceThreshold"
>;

export function EditAssetModal({ asset, open, onClose, queryKeysToInvalidate = [] }: EditAssetModalProps) {
	const queryClient = useQueryClient();

	// The asset may belong to a different company than the logged-in super-user's own,
	// so resolve region options from the asset's own company rather than "my company".
	const { data: assetCompany } = useQuery({
		queryKey: ["company", asset?.companyId],
		queryFn: () => companyService.getCompanyById(asset?.companyId as string),
		enabled: !!asset?.companyId && open,
	});
	const regionOptions = getRegionOptions(assetCompany?.country);

	const form = useForm<FormValues>({
		defaultValues: {
			make: "",
			model: "",
			condition: "",
			notes: "",
			client: "",
			channel: "",
			siteName: "",
			region: "",
			verificationFrequency: undefined,
			geofenceThreshold: undefined,
		},
	});

	useEffect(() => {
		if (asset && open) {
			form.reset({
				make: asset.make || "",
				model: asset.model || "",
				condition: asset.condition || "",
				notes: asset.notes || "",
				client: asset.client || "",
				channel: asset.channel || "",
				siteName: asset.siteName || "",
				region: asset.region || "",
				verificationFrequency: asset.verificationFrequency ?? undefined,
				geofenceThreshold: asset.geofenceThreshold ?? undefined,
			});
		}
	}, [asset, open, form]);

	const mutation = useMutation({
		mutationFn: (data: FormValues) => {
			const assetId = asset?.id || asset?._id || "";
			const payload: UpdateAssetReq = { ...data };
			if (payload.verificationFrequency === undefined || Number.isNaN(Number(payload.verificationFrequency))) {
				delete payload.verificationFrequency;
			}
			if (payload.geofenceThreshold === undefined || Number.isNaN(Number(payload.geofenceThreshold))) {
				delete payload.geofenceThreshold;
			}
			return assetService.updateAsset(assetId, payload);
		},
		onSuccess: () => {
			for (const key of queryKeysToInvalidate) {
				queryClient.invalidateQueries({ queryKey: key });
			}
			toast.success("Asset updated successfully");
			onClose();
		},
		onError: () => {},
	});

	const handleClose = () => {
		form.reset();
		onClose();
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Edit Asset — {asset?.serialNumber}</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="make"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Make</FormLabel>
										<FormControl>
											<Input placeholder="e.g. Toyota" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="model"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Model</FormLabel>
										<FormControl>
											<Input placeholder="e.g. Hilux" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="condition"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Condition</FormLabel>
									<Select value={field.value || ""} onValueChange={field.onChange}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select condition" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="good">Good</SelectItem>
											<SelectItem value="fair">Fair</SelectItem>
											<SelectItem value="poor">Poor</SelectItem>
											<SelectItem value="damaged">Damaged</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="client"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Client</FormLabel>
										<FormControl>
											<Input placeholder="Client name" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="channel"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Channel</FormLabel>
										<FormControl>
											<Input placeholder="Channel" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="siteName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Site Name</FormLabel>
									<FormControl>
										<Input placeholder="Site name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="region"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Region</FormLabel>
									<Select
										value={field.value || ""}
										onValueChange={field.onChange}
										disabled={regionOptions.length === 0}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue
													placeholder={
														regionOptions.length === 0 ? "Set a country on the company first" : "Select a region"
													}
												/>
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{regionOptions.map((r) => (
												<SelectItem key={r.value} value={r.value}>
													{r.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="verificationFrequency"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Verification Frequency (days)</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={1}
												placeholder="e.g. 30"
												{...field}
												value={field.value ?? ""}
												onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="geofenceThreshold"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Geofence Threshold (m)</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={0}
												placeholder="e.g. 100"
												{...field}
												value={field.value ?? ""}
												onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="notes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Notes</FormLabel>
									<FormControl>
										<Textarea placeholder="Any additional notes..." rows={3} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={handleClose}>
								Cancel
							</Button>
							<Button type="submit" disabled={mutation.isPending}>
								{mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
								Save Changes
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
