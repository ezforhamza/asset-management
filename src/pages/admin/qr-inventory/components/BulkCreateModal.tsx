import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import type { Company } from "#/entity";
import qrService from "@/api/services/qrService";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Textarea } from "@/ui/textarea";

interface BulkCreateModalProps {
	open: boolean;
	onClose: () => void;
	companies: Company[];
}

export function BulkCreateModal({ open, onClose, companies }: BulkCreateModalProps) {
	const queryClient = useQueryClient();
	const [qrCodes, setQrCodes] = useState("");
	const [companyId, setCompanyId] = useState("none");

	const mutation = useMutation({
		mutationFn: (data: { qrCodes: string[]; companyId?: string }) =>
			qrService.bulkCreateQRCodes({
				qrCodes: data.qrCodes,
				companyId: data.companyId || undefined,
			}),
		onSuccess: (data) => {
			toast.success(
				`Successfully created ${data.created} QR codes${data.duplicates > 0 ? `, ${data.duplicates} duplicates skipped` : ""}`,
			);
			queryClient.invalidateQueries({ queryKey: ["qr"] });
			setQrCodes("");
			setCompanyId("none");
			onClose();
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to create QR codes");
		},
	});

	const handleSubmit = () => {
		const codes = qrCodes
			.split("\n")
			.map((code) => code.trim())
			.filter((code) => code.length > 0);

		if (codes.length === 0) {
			toast.error("Please enter at least one QR code");
			return;
		}

		if (codes.length > 1000) {
			toast.error("Maximum 1000 QR codes allowed");
			return;
		}

		mutation.mutate({ qrCodes: codes, companyId: companyId === "none" ? undefined : companyId });
	};

	const qrCodeCount = qrCodes
		.split("\n")
		.map((code) => code.trim())
		.filter((code) => code.length > 0).length;

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Bulk Create QR Codes</DialogTitle>
					<DialogDescription>
						Create multiple QR codes at once. Enter one QR code per line (max 1000).
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label>Company (Optional)</Label>
						<Select value={companyId} onValueChange={setCompanyId}>
							<SelectTrigger>
								<SelectValue placeholder="Select company to allocate" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">No Company (Available)</SelectItem>
								{companies.map((company) => (
									<SelectItem key={company._id} value={company._id}>
										{company.companyName}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label>QR Codes (one per line)</Label>
							<span className="text-sm text-muted-foreground">{qrCodeCount} / 1000 codes</span>
						</div>
						<Textarea
							placeholder="QR-2024-001&#10;QR-2024-002&#10;QR-2024-003"
							value={qrCodes}
							onChange={(e) => setQrCodes(e.target.value)}
							className="min-h-[300px] font-mono text-sm"
						/>
					</div>
				</div>

				<DialogFooter>
					<Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={mutation.isPending || qrCodeCount === 0}>
						{mutation.isPending ? "Creating..." : `Create ${qrCodeCount} QR Code${qrCodeCount !== 1 ? "s" : ""}`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
