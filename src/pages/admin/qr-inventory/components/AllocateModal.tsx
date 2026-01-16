import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Company, QRCode as QRCodeType } from "#/entity";
import qrService from "@/api/services/qrService";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Textarea } from "@/ui/textarea";

interface AllocateModalProps {
	open: boolean;
	onClose: () => void;
	companies: Company[];
	selectedQRIds?: Set<string>;
	qrCodes?: QRCodeType[];
	onClearSelection?: () => void;
}

export function AllocateModal({
	open,
	onClose,
	companies,
	selectedQRIds = new Set(),
	qrCodes = [],
	onClearSelection,
}: AllocateModalProps) {
	const queryClient = useQueryClient();
	const [companyId, setCompanyId] = useState("");
	const [qrCodesText, setQrCodesText] = useState("");

	// Check if we have selected QR codes from the table
	const hasSelectedQRs = selectedQRIds.size > 0;

	// Get selected QR codes that are available for allocation
	const selectedQRCodesInfo = useMemo(() => {
		if (!hasSelectedQRs) return { available: [], nonAvailable: [], all: [] };

		const selectedQRs = qrCodes.filter((qr) => {
			const id = qr.id || qr._id || "";
			return selectedQRIds.has(id);
		});

		const available = selectedQRs.filter((qr) => qr.status === "available");
		const nonAvailable = selectedQRs.filter((qr) => qr.status !== "available");

		return { available, nonAvailable, all: selectedQRs };
	}, [hasSelectedQRs, selectedQRIds, qrCodes]);

	const mutation = useMutation({
		mutationFn: (data: { qrCodes: string[]; companyId: string }) => qrService.allocateQRCodes(data),
		onSuccess: (data) => {
			toast.success(data.message || `Allocated ${data.allocated} QR codes successfully`);
			queryClient.invalidateQueries({ queryKey: ["qr"] });
			onClearSelection?.();
			handleClose();
		},
		onError: (error: any) => {
			const responseData = error.response?.data;

			// Check if response contains detailed error info
			if (responseData && !responseData.success) {
				const { allocated, notFound, alreadyAllocated } = responseData;
				const messages: string[] = [];

				if (allocated > 0) {
					messages.push(`${allocated} QR code(s) allocated successfully`);
				}

				if (notFound && notFound.length > 0) {
					messages.push(
						`${notFound.length} QR code(s) not found: ${notFound.slice(0, 3).join(", ")}${notFound.length > 3 ? "..." : ""}`,
					);
				}

				if (alreadyAllocated && alreadyAllocated.length > 0) {
					messages.push(
						`${alreadyAllocated.length} QR code(s) already allocated: ${alreadyAllocated.slice(0, 3).join(", ")}${alreadyAllocated.length > 3 ? "..." : ""}`,
					);
				}

				if (messages.length > 0) {
					if (allocated === 0) {
						toast.error(messages.join(". "), { position: "top-center" });
					} else {
						toast.warning(messages.join(". "), { position: "top-center" });
						queryClient.invalidateQueries({ queryKey: ["qr"] });
						handleClose();
					}
				}
				// Fallback error is handled by apiClient
			}
			// Fallback error is handled by apiClient
		},
	});

	const handleClose = () => {
		setCompanyId("");
		setQrCodesText("");
		onClose();
	};

	const handleAllocate = () => {
		if (!companyId) {
			toast.error("Please select a company");
			return;
		}

		// If we have selected QR codes from the table, use those
		if (hasSelectedQRs) {
			const availableQRCodes = selectedQRCodesInfo.available.map((qr) => qr.qrCode);
			if (availableQRCodes.length === 0) {
				toast.error("No available QR codes selected for allocation");
				return;
			}
			mutation.mutate({ qrCodes: availableQRCodes, companyId });
		} else {
			// Otherwise, use the manually entered QR codes
			const manualQRCodes = qrCodesText
				.split(/[\n,]/)
				.map((code) => code.trim())
				.filter(Boolean);

			if (manualQRCodes.length === 0) {
				toast.error("Please enter at least one QR code");
				return;
			}
			mutation.mutate({ qrCodes: manualQRCodes, companyId });
		}
	};

	const qrCodeCount = hasSelectedQRs
		? selectedQRCodesInfo.available.length
		: qrCodesText
				.split(/[\n,]/)
				.map((code) => code.trim())
				.filter(Boolean).length;

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Allocate QR Codes</DialogTitle>
					<DialogDescription>Assign QR codes to a company.</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{/* Selected QR Codes Info */}
					{hasSelectedQRs && (
						<div className="space-y-3">
							<div className="rounded-lg border bg-muted/50 p-3">
								<div className="flex items-center justify-between mb-2">
									<p className="text-sm font-medium">Selected QR Codes</p>
									<Badge variant="secondary">{selectedQRIds.size} selected</Badge>
								</div>
								<div className="flex items-center gap-2 text-xs">
									<span className="text-green-600">{selectedQRCodesInfo.available.length} available</span>
									{selectedQRCodesInfo.nonAvailable.length > 0 && (
										<span className="text-muted-foreground">
											• {selectedQRCodesInfo.nonAvailable.length} not available
										</span>
									)}
								</div>
							</div>

							{selectedQRCodesInfo.nonAvailable.length > 0 && (
								<div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
									<AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
									<div className="text-xs text-amber-700 dark:text-amber-400">
										<p className="font-medium">Some QR codes cannot be allocated</p>
										<p className="mt-1">
											Only QR codes with "available" status can be allocated.
											{selectedQRCodesInfo.nonAvailable.length} selected QR code(s) will be skipped.
										</p>
									</div>
								</div>
							)}

							{selectedQRCodesInfo.available.length === 0 && (
								<div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
									<AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
									<div className="text-xs text-red-700 dark:text-red-400">
										<p className="font-medium">No available QR codes selected</p>
										<p className="mt-1">
											None of the selected QR codes have "available" status. Please select QR codes that are available
											for allocation.
										</p>
									</div>
								</div>
							)}
						</div>
					)}

					<div className="space-y-2">
						<Label>Company *</Label>
						<Select value={companyId} onValueChange={setCompanyId}>
							<SelectTrigger>
								<SelectValue placeholder="Select a company" />
							</SelectTrigger>
							<SelectContent>
								{companies.map((company) => (
									<SelectItem key={company._id} value={company._id}>
										{company.companyName}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Manual QR Code Entry (only when no selection) */}
					{!hasSelectedQRs && (
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label>QR Codes *</Label>
								{qrCodeCount > 0 && <span className="text-xs text-muted-foreground">{qrCodeCount} codes</span>}
							</div>
							<Textarea
								placeholder="Enter QR codes (one per line or comma-separated)"
								value={qrCodesText}
								onChange={(e) => setQrCodesText(e.target.value)}
								rows={6}
								className="font-mono text-sm"
							/>
							<p className="text-xs text-muted-foreground">Enter QR codes separated by new lines or commas</p>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={handleClose}>
						Cancel
					</Button>
					<Button onClick={handleAllocate} disabled={!companyId || qrCodeCount === 0 || mutation.isPending}>
						{mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
						Allocate {qrCodeCount > 0 && `(${qrCodeCount})`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
