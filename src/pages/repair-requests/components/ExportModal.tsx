import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import repairRequestService from "@/api/services/repairRequestService";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group";

interface ExportModalProps {
	open: boolean;
	onClose: () => void;
}

export function ExportModal({ open, onClose }: ExportModalProps) {
	const today = new Date().toISOString().slice(0, 10);
	const firstOfMonth = `${today.slice(0, 7)}-01`;

	const [startDate, setStartDate] = useState(firstOfMonth);
	const [endDate, setEndDate] = useState(today);
	const [format, setFormat] = useState<"xlsx" | "pdf">("xlsx");
	const [isExporting, setIsExporting] = useState(false);

	const handleExport = async () => {
		setIsExporting(true);
		try {
			await repairRequestService.exportRepairRequests({ format, startDate, endDate });
			toast.success(`Exported as ${format.toUpperCase()}`);
			onClose();
		} catch {
			toast.error("Export failed. Please try again.");
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[380px]">
				<DialogHeader>
					<DialogTitle>Export Repair Requests</DialogTitle>
					<DialogDescription>Choose a date range and file format to export.</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-1">
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1.5">
							<Label htmlFor="export-start">Start Date</Label>
							<Input id="export-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="export-end">End Date</Label>
							<Input id="export-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
						</div>
					</div>

					<div className="space-y-2">
						<Label>Format</Label>
						<RadioGroup value={format} onValueChange={(v) => setFormat(v as "xlsx" | "pdf")} className="flex gap-6">
							<div className="flex items-center gap-2">
								<RadioGroupItem value="xlsx" id="fmt-xlsx" />
								<Label htmlFor="fmt-xlsx" className="cursor-pointer font-normal">
									XLSX (Spreadsheet)
								</Label>
							</div>
							<div className="flex items-center gap-2">
								<RadioGroupItem value="pdf" id="fmt-pdf" />
								<Label htmlFor="fmt-pdf" className="cursor-pointer font-normal">
									PDF
								</Label>
							</div>
						</RadioGroup>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose} disabled={isExporting}>
						Cancel
					</Button>
					<Button onClick={handleExport} disabled={isExporting || !startDate || !endDate}>
						{isExporting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
						Export
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
