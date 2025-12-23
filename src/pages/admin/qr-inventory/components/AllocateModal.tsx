import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Company } from "#/entity";
import qrService from "@/api/services/qrService";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Textarea } from "@/ui/textarea";

interface AllocateModalProps {
	open: boolean;
	onClose: () => void;
	companies: Company[];
}

export function AllocateModal({ open, onClose, companies }: AllocateModalProps) {
	const queryClient = useQueryClient();
	const [companyId, setCompanyId] = useState("");
	const [qrCodesText, setQrCodesText] = useState("");

	const mutation = useMutation({
		mutationFn: (data: { qrCodes: string[]; companyId: string }) => qrService.allocateQRCodes(data),
		onSuccess: (data) => {
			toast.success(data.message || `Allocated ${data.allocated} QR codes successfully`);
			queryClient.invalidateQueries({ queryKey: ["qr"] });
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
					messages.push(`${notFound.length} QR code(s) not found: ${notFound.slice(0, 3).join(", ")}${notFound.length > 3 ? "..." : ""}`);
				}

				if (alreadyAllocated && alreadyAllocated.length > 0) {
					messages.push(`${alreadyAllocated.length} QR code(s) already allocated: ${alreadyAllocated.slice(0, 3).join(", ")}${alreadyAllocated.length > 3 ? "..." : ""}`);
				}

				if (messages.length > 0) {
					if (allocated === 0) {
						toast.error(messages.join(". "));
					} else {
						toast.warning(messages.join(". "));
						queryClient.invalidateQueries({ queryKey: ["qr"] });
						handleClose();
					}
				} else {
					toast.error(responseData.message || "Failed to allocate QR codes");
				}
			} else {
				toast.error(error.response?.data?.message || "Failed to allocate QR codes");
			}
		},
	});

	const handleClose = () => {
		setCompanyId("");
		setQrCodesText("");
		onClose();
	};

	const handleAllocate = () => {
		const qrCodes = qrCodesText
			.split(/[\n,]/)
			.map((code) => code.trim())
			.filter(Boolean);

		if (qrCodes.length === 0) {
			toast.error("Please enter at least one QR code");
			return;
		}

		if (!companyId) {
			toast.error("Please select a company");
			return;
		}

		mutation.mutate({ qrCodes, companyId });
	};

	const qrCodeCount = qrCodesText
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
