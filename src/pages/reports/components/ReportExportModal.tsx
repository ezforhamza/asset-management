import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { ExportReportParams } from "#/report";
import adminService from "@/api/services/adminService";
import assetCategoryService from "@/api/services/assetCategoryService";
import reportService from "@/api/services/reportService";
import { useUserInfo } from "@/store/userStore";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

interface ReportExportModalProps {
	open: boolean;
	onClose: () => void;
}

export function ReportExportModal({ open, onClose }: ReportExportModalProps) {
	const userInfo = useUserInfo();
	const isSuperUser = userInfo.role === "super_user";

	const today = new Date().toISOString().slice(0, 10);
	const firstOfMonth = `${today.slice(0, 7)}-01`;

	const [companyId, setCompanyId] = useState("all");
	const [startDate, setStartDate] = useState(firstOfMonth);
	const [endDate, setEndDate] = useState(today);
	const [status, setStatus] = useState("all");
	const [condition, setCondition] = useState("all");
	const [gpsFilter, setGpsFilter] = useState("all");
	const [categoryId, setCategoryId] = useState("all");
	const [operationalStatus, setOperationalStatus] = useState("all");
	const [region, setRegion] = useState("all");
	const [format, setFormat] = useState<"xlsx" | "pdf">("xlsx");
	const [isExporting, setIsExporting] = useState(false);

	const { data: categoriesData } = useQuery({
		queryKey: ["export-report-categories"],
		queryFn: () => assetCategoryService.getCategories({ limit: 100 }),
		enabled: open,
	});

	const { data: companiesData } = useQuery({
		queryKey: ["super-user", "companies-for-export"],
		queryFn: () => adminService.getCompanies({ limit: 100 }),
		enabled: open && isSuperUser,
	});

	// Lightweight sample fetch purely to derive available Region options for the dropdown
	const { data: regionSampleData } = useQuery({
		queryKey: ["export-report-regions", isSuperUser ? companyId : undefined],
		queryFn: () =>
			reportService.getVerificationReport({ limit: 500, ...(isSuperUser && companyId !== "all" ? { companyId } : {}) }),
		enabled: open,
	});

	const categories = categoriesData?.results?.filter((c) => c.status === "active") || [];
	const companies = companiesData?.results || [];
	const regionOptions = [
		...new Set((regionSampleData?.results || []).map((v) => v.region).filter(Boolean)),
	] as string[];

	const handleExport = async () => {
		setIsExporting(true);
		try {
			const params: ExportReportParams = {
				format,
				reportType: "verifications",
			};

			if (startDate) params.startDate = startDate;
			if (endDate) params.endDate = endDate;
			if (status !== "all") params.status = status as ExportReportParams["status"];
			if (condition !== "all") params.condition = condition as ExportReportParams["condition"];
			if (gpsFilter !== "all") params.gpsCheckPassed = gpsFilter === "true";
			if (categoryId !== "all") params.categoryId = categoryId;
			if (operationalStatus !== "all")
				params.operationalStatus = operationalStatus as ExportReportParams["operationalStatus"];
			if (region !== "all") params.region = region;
			if (isSuperUser && companyId !== "all") params.companyId = companyId;

			await reportService.exportReport(params);
			toast.success(`Report exported as ${format.toUpperCase()}`);
			onClose();
		} catch {
			// apiClient handles error toast
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[460px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Export Verification Report</DialogTitle>
					<DialogDescription>
						All filters are optional — leaving them blank exports everything in scope.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-1">
					{/* Company selector — super-user only */}
					{isSuperUser && (
						<div className="space-y-1.5">
							<Label>Company</Label>
							<Select value={companyId} onValueChange={setCompanyId}>
								<SelectTrigger>
									<SelectValue placeholder="All assigned companies" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All assigned companies</SelectItem>
									{companies.map((c) => (
										<SelectItem key={c._id} value={c._id}>
											{c.companyName}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}

					{/* Date Range */}
					<div>
						<Label className="mb-2 block">Date Range</Label>
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label htmlFor="exp-start" className="text-xs text-muted-foreground">
									Start Date
								</Label>
								<Input id="exp-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="exp-end" className="text-xs text-muted-foreground">
									End Date
								</Label>
								<Input id="exp-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
							</div>
						</div>
					</div>

					{/* Status */}
					<div className="space-y-1.5">
						<Label>Verification Status</Label>
						<Select value={status} onValueChange={setStatus}>
							<SelectTrigger>
								<SelectValue placeholder="All" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All</SelectItem>
								<SelectItem value="on_time">On Time</SelectItem>
								<SelectItem value="due_soon">Due Soon</SelectItem>
								<SelectItem value="overdue">Overdue</SelectItem>
								<SelectItem value="registered">Registered</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Condition */}
					<div className="space-y-1.5">
						<Label>Condition</Label>
						<Select value={condition} onValueChange={setCondition}>
							<SelectTrigger>
								<SelectValue placeholder="All" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All</SelectItem>
								<SelectItem value="good">Good</SelectItem>
								<SelectItem value="fair">Fair</SelectItem>
								<SelectItem value="poor">Poor</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* GPS */}
					<div className="space-y-1.5">
						<Label>GPS Check</Label>
						<Select value={gpsFilter} onValueChange={setGpsFilter}>
							<SelectTrigger>
								<SelectValue placeholder="All" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All</SelectItem>
								<SelectItem value="true">Passed</SelectItem>
								<SelectItem value="false">Failed</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Operational Status */}
					<div className="space-y-1.5">
						<Label>Operational Status</Label>
						<Select value={operationalStatus} onValueChange={setOperationalStatus}>
							<SelectTrigger>
								<SelectValue placeholder="All" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All</SelectItem>
								<SelectItem value="operational">Operational</SelectItem>
								<SelectItem value="needsRepair">Needs Repair</SelectItem>
								<SelectItem value="nonOperational">Non-Operational</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Category */}
					<div className="space-y-1.5">
						<Label>Category</Label>
						<Select value={categoryId} onValueChange={setCategoryId}>
							<SelectTrigger>
								<SelectValue placeholder="All categories" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All</SelectItem>
								{categories.map((c) => (
									<SelectItem key={c.id} value={c.id}>
										{c.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Region */}
					<div className="space-y-1.5">
						<Label>Region</Label>
						<Select value={region} onValueChange={setRegion}>
							<SelectTrigger>
								<SelectValue placeholder="All regions" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All</SelectItem>
								{regionOptions.map((r) => (
									<SelectItem key={r} value={r}>
										{r}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Format */}
					<div className="space-y-2">
						<Label>Format</Label>
						<RadioGroup value={format} onValueChange={(v) => setFormat(v as "xlsx" | "pdf")} className="flex gap-6">
							<div className="flex items-center gap-2">
								<RadioGroupItem value="xlsx" id="rep-xlsx" />
								<Label htmlFor="rep-xlsx" className="cursor-pointer font-normal">
									XLSX (Spreadsheet)
								</Label>
							</div>
							<div className="flex items-center gap-2">
								<RadioGroupItem value="pdf" id="rep-pdf" />
								<Label htmlFor="rep-pdf" className="cursor-pointer font-normal">
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
					<Button onClick={handleExport} disabled={isExporting}>
						{isExporting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
						Export
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
