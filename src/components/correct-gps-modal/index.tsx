import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Asset } from "#/entity";
import assetService from "@/api/services/assetService";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";

interface CorrectGpsModalProps {
	asset: Asset | null;
	open: boolean;
	onClose: () => void;
	queryKeysToInvalidate?: unknown[][];
}

export function CorrectGpsModal({ asset, open, onClose, queryKeysToInvalidate = [["assets"]] }: CorrectGpsModalProps) {
	const queryClient = useQueryClient();
	const [latitude, setLatitude] = useState("");
	const [longitude, setLongitude] = useState("");

	const assetId = asset?.id || asset?._id || "";

	const mutation = useMutation({
		mutationFn: () =>
			assetService.correctGps(assetId, {
				location: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
			}),
		onSuccess: () => {
			toast.success("GPS coordinates updated successfully");
			for (const key of queryKeysToInvalidate) {
				queryClient.invalidateQueries({ queryKey: key });
			}
			handleClose();
		},
		onError: () => {
			// handled by apiClient
		},
	});

	const handleClose = () => {
		setLatitude("");
		setLongitude("");
		onClose();
	};

	const handleSubmit = () => {
		const lat = parseFloat(latitude);
		const lng = parseFloat(longitude);
		if (Number.isNaN(lat) || lat < -90 || lat > 90) {
			toast.error("Latitude must be between -90 and 90");
			return;
		}
		if (Number.isNaN(lng) || lng < -180 || lng > 180) {
			toast.error("Longitude must be between -180 and 180");
			return;
		}
		mutation.mutate();
	};

	const currentLat = asset?.location?.latitude;
	const currentLng = asset?.location?.longitude;

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[420px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<MapPin className="h-5 w-5 text-primary" />
						Correct GPS Coordinates
					</DialogTitle>
					<DialogDescription>
						Update the registered GPS location for <strong>{asset?.serialNumber}</strong>. Verification history and all
						other data remain unchanged.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-2">
					{(currentLat != null || currentLng != null) && (
						<div className="p-3 bg-muted/50 rounded-md text-sm text-muted-foreground">
							Current: Lat <span className="font-mono text-foreground">{currentLat ?? "—"}</span> | Long{" "}
							<span className="font-mono text-foreground">{currentLng ?? "—"}</span>
						</div>
					)}

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="latitude">Latitude *</Label>
							<Input
								id="latitude"
								type="number"
								step="any"
								placeholder="-26.2041"
								value={latitude}
								onChange={(e) => setLatitude(e.target.value)}
							/>
							<p className="text-xs text-muted-foreground">-90 to 90</p>
						</div>
						<div className="space-y-2">
							<Label htmlFor="longitude">Longitude *</Label>
							<Input
								id="longitude"
								type="number"
								step="any"
								placeholder="28.0473"
								value={longitude}
								onChange={(e) => setLongitude(e.target.value)}
							/>
							<p className="text-xs text-muted-foreground">-180 to 180</p>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={mutation.isPending || !latitude || !longitude}>
						{mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
						Save Coordinates
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
