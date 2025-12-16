import { useQuery } from "@tanstack/react-query";
import { QrCode, Search, Upload } from "lucide-react";
import { useState } from "react";
import adminService from "@/api/services/adminService";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { AllocateModal } from "./components/AllocateModal";
import { BulkImportModal } from "./components/BulkImportModal";
import { QRTable } from "./components/QRTable";

export default function AdminQRInventoryPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [companyFilter, setCompanyFilter] = useState("all");
	const [importModalOpen, setImportModalOpen] = useState(false);
	const [allocateModalOpen, setAllocateModalOpen] = useState(false);

	const { data: companiesData } = useQuery({
		queryKey: ["admin", "companies"],
		queryFn: () => adminService.getCompanies({ limit: 100 }),
	});

	const { data, isLoading } = useQuery({
		queryKey: ["admin", "qr-codes", statusFilter, companyFilter],
		queryFn: () =>
			adminService.getAdminQRCodes({
				status: statusFilter !== "all" ? statusFilter : undefined,
				companyId: companyFilter !== "all" ? companyFilter : undefined,
			}),
	});

	const qrCodes = data?.qrCodes || [];
	const companies = companiesData?.companies || [];

	// Client-side search filter
	const filteredQRCodes = qrCodes.filter((qr) => {
		if (!searchQuery) return true;
		return qr.qrCode.toLowerCase().includes(searchQuery.toLowerCase());
	});

	// Stats
	const totalQR = data?.pagination?.total || 0;
	const availableCount = qrCodes.filter((q) => q.status === "available").length;
	const allocatedCount = qrCodes.filter((q) => q.status === "allocated").length;
	const usedCount = qrCodes.filter((q) => q.status === "used").length;

	return (
		<div className="h-full flex flex-col overflow-hidden">
			{/* Header */}
			<div className="flex-shrink-0 px-6 py-4 border-b bg-card/50">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
							<QrCode className="h-5 w-5 text-primary" />
						</div>
						<div>
							<h1 className="text-xl font-semibold">QR Code Inventory</h1>
							<p className="text-sm text-muted-foreground">Manage QR codes across all companies</p>
						</div>
					</div>
					<div className="flex gap-2">
						<Button variant="outline" onClick={() => setImportModalOpen(true)}>
							<Upload className="h-4 w-4 mr-2" />
							Bulk Import
						</Button>
						<Button onClick={() => setAllocateModalOpen(true)}>Allocate to Company</Button>
					</div>
				</div>
			</div>

			{/* Stats & Filters */}
			<div className="flex-shrink-0 px-6 py-4 border-b flex flex-wrap items-center gap-4">
				<div className="flex items-center gap-6">
					<div className="flex items-center gap-2">
						<QrCode className="h-4 w-4 text-muted-foreground" />
						<span className="text-sm">
							<strong>{totalQR}</strong> Total
						</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="h-2 w-2 rounded-full bg-blue-500" />
						<span className="text-sm">
							<strong>{availableCount}</strong> Available
						</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="h-2 w-2 rounded-full bg-orange-500" />
						<span className="text-sm">
							<strong>{allocatedCount}</strong> Allocated
						</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="h-2 w-2 rounded-full bg-green-500" />
						<span className="text-sm">
							<strong>{usedCount}</strong> Used
						</span>
					</div>
				</div>
				<div className="flex-1" />
				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger className="w-[150px]">
						<SelectValue placeholder="Status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Status</SelectItem>
						<SelectItem value="available">Available</SelectItem>
						<SelectItem value="allocated">Allocated</SelectItem>
						<SelectItem value="used">Used</SelectItem>
						<SelectItem value="retired">Retired</SelectItem>
					</SelectContent>
				</Select>
				<Select value={companyFilter} onValueChange={setCompanyFilter}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Company" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Companies</SelectItem>
						{companies.map((company) => (
							<SelectItem key={company._id} value={company._id}>
								{company.companyName}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<div className="relative w-64">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search QR codes..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>
			</div>

			{/* Table */}
			<div className="flex-1 overflow-hidden px-6 py-4">
				<QRTable qrCodes={filteredQRCodes} companies={companies} isLoading={isLoading} />
			</div>

			{/* Modals */}
			<BulkImportModal open={importModalOpen} onClose={() => setImportModalOpen(false)} />
			<AllocateModal open={allocateModalOpen} onClose={() => setAllocateModalOpen(false)} />
		</div>
	);
}
