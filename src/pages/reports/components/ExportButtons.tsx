import { Button } from "@/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import reportService from "@/api/services/reportService";

interface ExportButtonsProps {
	startDate?: string;
	endDate?: string;
}

export function ExportButtons({ startDate, endDate }: ExportButtonsProps) {
	const [exporting, setExporting] = useState(false);

	const handleExport = async (format: "csv" | "pdf") => {
		setExporting(true);
		try {
			reportService.exportReport({ format, startDate, endDate });
			toast.success(`Report exported as ${format.toUpperCase()}`);
		} catch {
			toast.error("Failed to export report");
		} finally {
			setExporting(false);
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
