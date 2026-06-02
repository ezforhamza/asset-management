import { Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/ui/button";
import { ReportExportModal } from "./ReportExportModal";

// companyId prop kept for API compatibility but modal handles it internally via role detection
interface ExportButtonsProps {
	startDate?: string;
	endDate?: string;
	status?: string;
	companyId?: string;
}

export function ExportButtons(_props: ExportButtonsProps) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button variant="outline" onClick={() => setOpen(true)}>
				<Download className="h-4 w-4 mr-2" />
				Export
			</Button>
			<ReportExportModal open={open} onClose={() => setOpen(false)} />
		</>
	);
}

export default ExportButtons;
