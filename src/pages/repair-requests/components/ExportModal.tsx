import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import adminService from "@/api/services/adminService";
import assetCategoryService from "@/api/services/assetCategoryService";
import repairRequestService from "@/api/services/repairRequestService";
import { useUserInfo } from "@/store/userStore";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

interface ExportModalProps {
	open: boolean;
	onClose: () => void;
	companyId?: string;
}

export function ExportModal({ open, onClose, companyId: preselectedCompanyId }: ExportModalProps) {
	const userInfo = useUserInfo();
	const isSuperUser = userInfo.role === "super_user";

	const today = new Date().toISOString().slice(0, 10);
	const firstOfMonth = `${today.slice(0, 7)}-01`;

	const [selectedCompanyId, setSelectedCompanyId] = useState(preselectedCompanyId || "all");
	const [startDate, setStartDate] = useState(firstOfMonth);
	const [endDate, setEndDate] = useState(today);
	const [status, setStatus] = useState("all");
	const [source, setSource] = useState("all");
	const [categoryName, setCategoryName] = useState("all");
	const [format, setFormat] = useState<"xlsx" | "pdf">("xlsx");
	const [isExporting, setIsExporting] = useState(false);

	const { data: categoriesData } = useQuery({
		queryKey: ["export-categories"],
		queryFn: () => assetCategoryService.getCategories({ page: 1, limit: 100 }),
		enabled: open,
	});

	const { data: companiesData } = useQuery({
		queryKey: ["super-user", "companies-for-export"],
		queryFn: () => adminService.getCompanies({ limit: 100 }),
		enabled: open && isSuperUser,
	});

	const categories = categoriesData?.results?.filter((c) => c.status === "active") || [];
	const companies = companiesData?.results || [];

	const handleExport = async () => {
		setIsExporting(true);
		try {
			await repairRequestService.exportRepairRequests({
				format,
				startDate,
				endDate,
				status: status === "all" ? undefined : status || undefined,
				source: source === "all" ? undefined : source || undefined,
				categoryName: categoryName === "all" ? undefined : categoryName || undefined,
				companyId: isSuperUser && selectedCompanyId !== "all" ? selectedCompanyId : undefined,
			});
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
			<DialogContent className="sm:max-w-[420px]">
				<DialogHeader>
					<DialogTitle>Export Repair Requests</DialogTitle>
					<DialogDescription>All filters are optional — leaving them blank exports everything.</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-1">
					{/* Company selector — super-user only */}
					{isSuperUser && (
						<div className="space-y-1.5">
							<Label>Company</Label>
							<Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
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
								<Label htmlFor="export-start" className="text-xs text-muted-foreground">
									Start Date
								</Label>
								<Input id="export-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="export-end" className="text-xs text-muted-foreground">
									End Date
								</Label>
								<Input id="export-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
							</div>
						</div>
					</div>

					{/* Status */}
					<div className="space-y-1.5">
						<Label>Status</Label>
						<Select value={status} onValueChange={setStatus}>
							<SelectTrigger>
								<SelectValue placeholder="All statuses" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All</SelectItem>
								<SelectItem value="open">Open</SelectItem>
								<SelectItem value="acknowledged">Acknowledged</SelectItem>
								<SelectItem value="resolved">Resolved</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Source */}
					<div className="space-y-1.5">
						<Label>Source</Label>
						<Select value={source} onValueChange={setSource}>
							<SelectTrigger>
								<SelectValue placeholder="All sources" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All</SelectItem>
								<SelectItem value="field_worker">Field Worker</SelectItem>
								<SelectItem value="customer_admin">Customer Admin</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Category */}
					<div className="space-y-1.5">
						<Label>Category</Label>
						<Select value={categoryName} onValueChange={setCategoryName}>
							<SelectTrigger>
								<SelectValue placeholder="All categories" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All</SelectItem>
								{categories.map((c) => (
									<SelectItem key={c.id} value={c.name}>
										{c.name}
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
					<Button onClick={handleExport} disabled={isExporting}>
						{isExporting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
						Export
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
