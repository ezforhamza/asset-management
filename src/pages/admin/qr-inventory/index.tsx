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
import { ViewQRModal } from "./components/ViewQRModal";

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
	const [qrToDelete, setQrToDelete] = useState<QRCodeType | null>(null);
	const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
	const [qrToRetire, setQrToRetire] = useState<QRCodeType | null>(null);
	const [confirmRetireOpen, setConfirmRetireOpen] = useState(false);
	const [exportModalOpen, setExportModalOpen] = useState(false);
	const [selectedQRIds, setSelectedQRIds] = useState<Set<string>>(new Set());
	const [viewModalOpen, setViewModalOpen] = useState(false);
	const [selectedQR, setSelectedQR] = useState<QRCodeType | null>(null);

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
				sortBy: "createdAt:desc",
			}),
	});

	const deleteMutation = useMutation({
		mutationFn: (qrCode: QRCodeType) => qrService.deleteQRCode(qrCode.id || qrCode._id || ""),
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["qr"] });
			setConfirmDeleteOpen(false);
			setQrToDelete(null);
		},
		onSuccess: () => {
			toast.success("QR code deleted successfully");
		},
		onError: () => {
			// Error toast is handled by apiClient;
		},
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
		onError: () => {
			// Error toast is handled by apiClient;
		},
	});

	const handleDelete = (qrCode: QRCodeType) => {
		setQrToDelete(qrCode);
		setConfirmDeleteOpen(true);
	};

	const handleConfirmDelete = () => {
		if (qrToDelete) {
			deleteMutation.mutate(qrToDelete);
		}
	};

	const handleRetire = (qrCode: QRCodeType) => {
		setQrToRetire(qrCode);
		setConfirmRetireOpen(true);
	};

	const handleConfirmRetire = () => {
		if (qrToRetire) {
			retireMutation.mutate(qrToRetire);
		}
	};

	const handleView = (qrCode: QRCodeType) => {
		setSelectedQR(qrCode);
		setViewModalOpen(true);
	};

	// Sort QR codes: primary by createdAt DESC, secondary by qrCode ASC for deterministic ordering
	const qrCodes = [...(data?.results || [])].sort((a, b) => {
		// Primary sort: createdAt DESC (newest first)
		const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
		const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
		if (dateB !== dateA) {
			return dateB - dateA;
		}
		// Secondary sort: qrCode ASC (alphabetical) for stable ordering when timestamps are the same
		return (a.qrCode || "").localeCompare(b.qrCode || "");
	});
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
							{selectedQRIds.size > 0 && (
								<span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
									{selectedQRIds.size}
								</span>
							)}
						</Button>
						<Button variant="outline" onClick={() => setAllocateModalOpen(true)}>
							Allocate to Company
							{selectedQRIds.size > 0 && (
								<span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
									{selectedQRIds.size}
								</span>
							)}
						</Button>
						<Button 
							variant="outline" 
							onClick={() => setImportModalOpen(true)}
							disabled={selectedQRIds.size > 0}
						>
							<Upload className="h-4 w-4 mr-2" />
							CSV Import
						</Button>
						<Button 
							variant="outline" 
							onClick={() => setBulkCreateModalOpen(true)}
							disabled={selectedQRIds.size > 0}
						>
							<Plus className="h-4 w-4 mr-2" />
							Bulk Create
						</Button>
						<Button 
							onClick={() => setCreateModalOpen(true)}
							disabled={selectedQRIds.size > 0}
						>
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
				{selectedQRIds.size > 0 && (
					<div className="flex items-center gap-2 mb-3 px-3 py-2 bg-muted/50 rounded-lg">
						<span className="text-sm text-muted-foreground">
							<strong>{selectedQRIds.size}</strong> QR code{selectedQRIds.size !== 1 ? "s" : ""} selected
						</span>
						<button
							type="button"
							onClick={() => setSelectedQRIds(new Set())}
							className="text-xs text-primary hover:underline"
						>
							Clear selection
						</button>
					</div>
				)}
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
					onDelete={handleDelete}
					onView={handleView}
					onRetire={handleRetire}
					enableSelection={true}
					selectedIds={selectedQRIds}
					onSelectionChange={setSelectedQRIds}
				/>
			</div>

			{/* Modals */}
			<CreateQRModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} companies={companies} />
			<BulkCreateModal open={bulkCreateModalOpen} onClose={() => setBulkCreateModalOpen(false)} companies={companies} />
			<BulkImportModal open={importModalOpen} onClose={() => setImportModalOpen(false)} companies={companies} />
			<AllocateModal
				open={allocateModalOpen}
				onClose={() => setAllocateModalOpen(false)}
				companies={companies}
				selectedQRIds={selectedQRIds}
				qrCodes={qrCodes}
				onClearSelection={() => setSelectedQRIds(new Set())}
			/>
			<ExportPDFModal
				open={exportModalOpen}
				onClose={() => setExportModalOpen(false)}
				companies={companies}
				selectedQRIds={selectedQRIds}
				qrCodes={qrCodes}
				currentFilters={{
					status: statusFilter,
					companyId: companyFilter,
					searchQuery: searchQuery,
				}}
			/>

			{/* View QR Modal */}
			<ViewQRModal
				open={viewModalOpen}
				onClose={() => {
					setViewModalOpen(false);
					setSelectedQR(null);
				}}
				qrCode={selectedQR}
				companies={companies}
			/>

			{/* Delete Confirmation Modal */}
			<ConfirmationModal
				open={confirmDeleteOpen}
				onClose={() => {
					setConfirmDeleteOpen(false);
					setQrToDelete(null);
				}}
				onConfirm={handleConfirmDelete}
				title="Delete QR Code"
				description={`Are you sure you want to delete QR code "${qrToDelete?.qrCode}"? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				variant="destructive"
				isLoading={deleteMutation.isPending}
			/>

			{/* Retire Confirmation Modal */}
			<ConfirmationModal
				open={confirmRetireOpen}
				onClose={() => {
					setConfirmRetireOpen(false);
					setQrToRetire(null);
				}}
				onConfirm={handleConfirmRetire}
				title="Retire QR Code"
				description={`Retiring QR code "${qrToRetire?.qrCode}" will make it permanently unusable. This action cannot be undone. Do you want to continue?`}
				confirmText="Retire"
				cancelText="Cancel"
				variant="destructive"
				isLoading={retireMutation.isPending}
			/>
		</div>
	);
}
