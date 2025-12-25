import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import reportService from "@/api/services/reportService";
import { Button } from "@/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";

interface ExportButtonsProps {
	startDate?: string;
	endDate?: string;
	status?: string;
}

export function ExportButtons({ startDate, endDate, status }: ExportButtonsProps) {
	const [exporting, setExporting] = useState(false);

	const handleExport = async (format: "csv" | "pdf") => {
		setExporting(true);
		try {
			const params: any = {
				format,
				reportType: "verifications",
			};

			if (startDate) params.startDate = startDate;
			if (endDate) params.endDate = endDate;
			if (status && status !== "all") params.status = status;

			reportService.exportReport(params);
			toast.success(`Report exported as ${format.toUpperCase()}`);
		} catch {
			toast.error("Failed to export report");
		} finally {
			setTimeout(() => setExporting(false), 1000);
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" disabled={exporting}>
					{exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
					Export
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => handleExport("csv")}>
					<FileSpreadsheet className="h-4 w-4 mr-2" />
					Export as CSV
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => handleExport("pdf")}>
					<FileText className="h-4 w-4 mr-2" />
					Export as PDF
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default ExportButtons;
