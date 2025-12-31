import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Company } from "#/entity";
import qrService from "@/api/services/qrService";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

interface ExportPDFModalProps {
	open: boolean;
	onClose: () => void;
	companies: Company[];
}

type QRStatus = "allocated" | "used" | "retired";

export function ExportPDFModal({ open, onClose, companies }: ExportPDFModalProps) {
	const [companyId, setCompanyId] = useState<string>("");
	const [status, setStatus] = useState<QRStatus | "all">("all");
	const [isExporting, setIsExporting] = useState(false);

	const handleClose = () => {
		setCompanyId("");
		setStatus("all");
		onClose();
	};

	const handleExport = async () => {
		if (!companyId) {
			toast.error("Please select a company");
			return;
		}

		setIsExporting(true);
		try {
			const blob = await qrService.exportQRCodesPDF(companyId, status === "all" ? undefined : status);

			// Create download link
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;

			// Get company name for filename
			const company = companies.find((c) => c._id === companyId);
			const companyName = company?.companyName?.replace(/\s+/g, "_") || "company";
			const statusSuffix = status !== "all" ? `_${status}` : "";
			link.download = `qr_codes_${companyName}${statusSuffix}.pdf`;

			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);

			toast.success("PDF exported successfully");
			handleClose();
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to export PDF");
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[450px]">
				<DialogHeader>
					<DialogTitle>Export QR Codes to PDF</DialogTitle>
					<DialogDescription>
						Select a company and optionally filter by status to export QR codes as a PDF file.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label>
							Company <span className="text-destructive">*</span>
						</Label>
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
						<Label>Status (Optional)</Label>
						<Select value={status} onValueChange={(value) => setStatus(value as QRStatus | "all")}>
							<SelectTrigger>
								<SelectValue placeholder="All statuses" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Statuses</SelectItem>
								<SelectItem value="allocated">Allocated</SelectItem>
								<SelectItem value="used">Used</SelectItem>
								<SelectItem value="retired">Retired</SelectItem>
							</SelectContent>
						</Select>
						<p className="text-xs text-muted-foreground">Filter QR codes by their current status</p>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={handleClose}>
						Cancel
					</Button>
					<Button onClick={handleExport} disabled={!companyId || isExporting}>
						{isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
						Export PDF
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
