// @ts-nocheck
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Plus, QrCode, Search, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { QRCode as QRCodeType } from "#/entity";
import adminService from "@/api/services/adminService";
import qrService from "@/api/services/qrService";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { AllocateModal } from "./components/AllocateModal";
import { BulkCreateModal } from "./components/BulkCreateModal";
import { BulkImportModal } from "./components/BulkImportModal";
import { CreateQRModal } from "./components/CreateQRModal";
import { ExportPDFModal } from "./components/ExportPDFModal";
import { QRTable } from "./components/QRTable";

export default function AdminQRInventoryPage() {
	const queryClient = useQueryClient();
	const [searchInput, setSearchInput] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
	const [companyFilter, setCompanyFilter] = useState<string | undefined>(undefined);
	const [page, setPage] = useState(1);
	const [limit] = useState(20);
	const [importModalOpen, setImportModalOpen] = useState(false);
	const [allocateModalOpen, setAllocateModalOpen] = useState(false);
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [bulkCreateModalOpen, setBulkCreateModalOpen] = useState(false);
	const [qrToRetire, setQrToRetire] = useState<QRCodeType | null>(null);
	const [confirmRetireOpen, setConfirmRetireOpen] = useState(false);
	const [exportModalOpen, setExportModalOpen] = useState(false);

	// Debounce search input
	useEffect(() => {
		const timer = setTimeout(() => {
			setSearchQuery(searchInput);
			setPage(1);
		}, 500);
		return () => clearTimeout(timer);
	}, [searchInput]);

	const { data: companiesData } = useQuery({
		queryKey: ["admin", "companies"],
		queryFn: () => adminService.getCompanies({ limit: 100 }),
	});

	const { data: statsData } = useQuery({
		queryKey: ["qr", "stats"],
		queryFn: () => qrService.getQRCodeStats(),
	});

	const { data, isLoading } = useQuery({
		queryKey: ["qr", "list", searchQuery, statusFilter, companyFilter, page, limit],
		queryFn: () =>
			qrService.getQRCodes({
				qrCode: searchQuery || undefined,
				status: statusFilter,
				companyId: companyFilter,
				page,
				limit,
			}),
	});

	const retireMutation = useMutation({
		mutationFn: (qrCode: QRCodeType) => qrService.updateQRCode(qrCode.id || qrCode._id || "", { status: "retired" }),
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["qr"] });
			setConfirmRetireOpen(false);
			setQrToRetire(null);
		},
		onSuccess: () => {
			toast.success("QR code retired successfully");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to retire QR code");
		},
	});

	const handleRetire = (qrCode: QRCodeType) => {
		setQrToRetire(qrCode);
		setConfirmRetireOpen(true);
	};

	const handleConfirmRetire = () => {
		if (qrToRetire) {
			if (qrToRetire.companyId) {
				retireMutation.mutate(qrToRetire);
			}
		}
	};

	const qrCodes = data?.results || [];
	const companies = companiesData?.results || [];
	const stats = statsData?.stats || { available: 0, allocated: 0, used: 0, retired: 0, total: 0 };

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
						<Button variant="outline" onClick={() => setExportModalOpen(true)}>
							<Download className="h-4 w-4 mr-2" />
							Export PDF
						</Button>
						<Button variant="outline" onClick={() => setImportModalOpen(true)}>
							<Upload className="h-4 w-4 mr-2" />
							CSV Import
						</Button>
						<Button variant="outline" onClick={() => setBulkCreateModalOpen(true)}>
							<Plus className="h-4 w-4 mr-2" />
							Bulk Create
						</Button>
						<Button variant="outline" onClick={() => setAllocateModalOpen(true)}>
							Allocate to Company
						</Button>
						<Button onClick={() => setCreateModalOpen(true)}>
							<Plus className="h-4 w-4 mr-2" />
							Create QR Code
						</Button>
					</div>
				</div>
			</div>

			{/* Stats & Filters */}
			<div className="flex-shrink-0 px-6 py-4 border-b flex flex-wrap items-center gap-4">
				<div className="flex items-center gap-6">
					<div className="flex items-center gap-2">
						<QrCode className="h-4 w-4 text-muted-foreground" />
						<span className="text-sm">
							<strong>{stats.total}</strong> Total
						</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="h-2 w-2 rounded-full bg-blue-500" />
						<span className="text-sm">
							<strong>{stats.available}</strong> Available
						</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="h-2 w-2 rounded-full bg-orange-500" />
						<span className="text-sm">
							<strong>{stats.allocated}</strong> Allocated
						</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="h-2 w-2 rounded-full bg-green-500" />
						<span className="text-sm">
							<strong>{stats.used}</strong> Used
						</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="h-2 w-2 rounded-full bg-gray-500" />
						<span className="text-sm">
							<strong>{stats.retired}</strong> Retired
						</span>
					</div>
				</div>
				<div className="flex-1" />
				<div className="relative w-64">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search QR codes..."
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						className="pl-9"
					/>
				</div>
				<Select
					value={statusFilter || "all"}
					onValueChange={(value) => setStatusFilter(value === "all" ? undefined : value)}
				>
					<SelectTrigger className="w-[140px]">
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
				<Select
					value={companyFilter || "all"}
					onValueChange={(value) => setCompanyFilter(value === "all" ? undefined : value)}
				>
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
			</div>

			{/* Table */}
			<div className="flex-1 overflow-auto px-6 py-4">
				<QRTable
					qrCodes={qrCodes}
					companies={companies}
					isLoading={isLoading}
					pagination={{
						page: data?.page || 1,
						limit: data?.limit || limit,
						totalPages: data?.totalPages || 1,
						totalResults: data?.totalResults || 0,
					}}
					onPageChange={setPage}
					onRetire={handleRetire}
				/>
			</div>

			{/* Modals */}
			<CreateQRModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} companies={companies} />
			<BulkCreateModal open={bulkCreateModalOpen} onClose={() => setBulkCreateModalOpen(false)} companies={companies} />
			<BulkImportModal open={importModalOpen} onClose={() => setImportModalOpen(false)} companies={companies} />
			<AllocateModal open={allocateModalOpen} onClose={() => setAllocateModalOpen(false)} companies={companies} />
			<ExportPDFModal open={exportModalOpen} onClose={() => setExportModalOpen(false)} companies={companies} />

			{/* Confirmation Modal */}
			<ConfirmationModal
				open={confirmRetireOpen}
				onClose={() => {
					setConfirmRetireOpen(false);
					setQrToRetire(null);
				}}
				onConfirm={handleConfirmRetire}
				title="Retire QR Code"
				description={`Are you sure you want to retire QR code "${qrToRetire?.qrCode}"? This action will mark it as retired and it will no longer be available for allocation.`}
				confirmText="Retire"
				cancelText="Cancel"
				variant="destructive"
				isLoading={retireMutation.isPending}
			/>
		</div>
	);
}
