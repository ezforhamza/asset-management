import { Download, FileText, Grid3X3, Loader2, Settings2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Company, QRCode as QRCodeType } from "#/entity";
import qrService from "@/api/services/qrService";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Separator } from "@/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import {
	type CompanyInfo,
	generateQRCodePDF,
	type PageSize,
	type PDFExportConfig,
	type QRCodeData,
} from "@/utils/qrPdfGenerator";

interface ExportPDFModalProps {
	open: boolean;
	onClose: () => void;
	companies: Company[];
	selectedQRIds?: Set<string>;
	qrCodes?: QRCodeType[];
	currentFilters?: {
		status?: string;
		companyId?: string;
		searchQuery?: string;
	};
}

type QRStatus = "available" | "allocated" | "used" | "retired";
type Orientation = "portrait" | "landscape";
type QRSize = "small" | "medium" | "large";

const PAGE_SIZES: { value: PageSize; label: string }[] = [
	{ value: "A4", label: "A4 (210 × 297 mm)" },
	{ value: "A5", label: "A5 (148 × 210 mm)" },
	{ value: "Letter", label: "Letter (8.5 × 11 in)" },
	{ value: "Legal", label: "Legal (8.5 × 14 in)" },
];

const ORIENTATIONS: { value: Orientation; label: string }[] = [
	{ value: "portrait", label: "Portrait" },
	{ value: "landscape", label: "Landscape" },
];

const QR_SIZES: { value: QRSize; label: string; sizeMm: number }[] = [
	{ value: "small", label: "Small (20mm)", sizeMm: 20 },
	{ value: "medium", label: "Medium (30mm)", sizeMm: 30 },
	{ value: "large", label: "Large (40mm)", sizeMm: 40 },
];

const COLUMNS_OPTIONS = [2, 3, 4, 5, 6];
const ROWS_OPTIONS = ["auto", 2, 3, 4, 5, 6, 7, 8] as const;

export function ExportPDFModal({
	open,
	onClose,
	companies,
	selectedQRIds = new Set(),
	qrCodes = [],
	currentFilters,
}: ExportPDFModalProps) {
	const [companyId, setCompanyId] = useState<string>(currentFilters?.companyId || "");
	const [status, setStatus] = useState<QRStatus | "all">((currentFilters?.status as QRStatus) || "all");
	const [isExporting, setIsExporting] = useState(false);

	// Layout configuration
	const [pageSize, setPageSize] = useState<PageSize>("A4");
	const [orientation, setOrientation] = useState<Orientation>("portrait");
	const [qrSize, setQrSize] = useState<QRSize>("medium");
	const [columns, setColumns] = useState<number>(3);
	const [rows, setRows] = useState<number | "auto">("auto");
	const [showLabels, setShowLabels] = useState(true);
	const [showGridLines, setShowGridLines] = useState(true);

	const hasSelectedQRs = selectedQRIds.size > 0;

	// Page dimensions in mm
	const pageDimensions: Record<PageSize, { width: number; height: number }> = {
		A4: { width: 210, height: 297 },
		A5: { width: 148, height: 210 },
		Letter: { width: 216, height: 279 },
		Legal: { width: 216, height: 356 },
	};

	// Calculate max columns based on QR size, page size, and orientation
	const maxColumns = useMemo(() => {
		const qrSizeMm = QR_SIZES.find((s) => s.value === qrSize)?.sizeMm || 30;
		const dims = pageDimensions[pageSize];
		const pageWidth = orientation === "portrait" ? dims.width : dims.height;
		const margins = 20; // 10mm on each side
		const availableWidth = pageWidth - margins;
		const cellWidth = qrSizeMm + 10; // QR size + padding
		return Math.floor(availableWidth / cellWidth);
	}, [qrSize, orientation, pageSize]);

	// Validate and adjust columns if needed
	const effectiveColumns = Math.min(columns, maxColumns);

	// Generate preview description
	const previewDescription = useMemo(() => {
		const sizeName = QR_SIZES.find((s) => s.value === qrSize)?.label.split(" ")[0] || "Medium";
		const rowsText = rows === "auto" ? "Auto rows" : `${rows} rows`;
		const pageSizeLabel = PAGE_SIZES.find((p) => p.value === pageSize)?.label.split(" ")[0] || pageSize;
		return `${pageSizeLabel} • ${orientation === "portrait" ? "Portrait" : "Landscape"} • ${effectiveColumns} per row • ${sizeName} size • ${rowsText}`;
	}, [pageSize, orientation, effectiveColumns, qrSize, rows]);

	const handleClose = () => {
		setCompanyId(currentFilters?.companyId || "");
		setStatus((currentFilters?.status as QRStatus) || "all");
		setPageSize("A4");
		setOrientation("portrait");
		setQrSize("medium");
		setColumns(3);
		setRows("auto");
		setShowLabels(true);
		setShowGridLines(true);
		onClose();
	};

	const handleExport = async () => {
		// If no selected QRs and no company selected, require company
		if (!hasSelectedQRs && !companyId) {
			toast.error("Please select a company or select specific QR codes from the table");
			return;
		}

		setIsExporting(true);
		try {
			let qrDataToExport: QRCodeData[] = [];

			if (hasSelectedQRs) {
				// Use selected QR codes from the provided qrCodes array
				const selectedQRCodes = qrCodes.filter((qr) => {
					const id = qr.id || qr._id || "";
					return selectedQRIds.has(id);
				});

				if (selectedQRCodes.length === 0) {
					// If selected QRs are not in current page, fetch them from API
					const response = await qrService.getQRCodes({ limit: 1000 });
					const allQRs = response.results || [];
					const filteredQRs = allQRs.filter((qr) => {
						const id = qr.id || qr._id || "";
						return selectedQRIds.has(id);
					});
					qrDataToExport = filteredQRs.map((qr) => ({
						id: qr.id || qr._id || "",
						qrCode: qr.qrCode,
						label: qr.qrCode,
					}));
				} else {
					qrDataToExport = selectedQRCodes.map((qr) => ({
						id: qr.id || qr._id || "",
						qrCode: qr.qrCode,
						label: qr.qrCode,
					}));
				}
			} else {
				// Fetch QR codes by company and status filter
				const response = await qrService.getQRCodes({
					companyId,
					status: status === "all" ? undefined : status,
					limit: 1000,
				});
				const fetchedQRs = response.results || [];
				qrDataToExport = fetchedQRs.map((qr) => ({
					id: qr.id || qr._id || "",
					qrCode: qr.qrCode,
					label: qr.qrCode,
				}));
			}

			if (qrDataToExport.length === 0) {
				toast.error("No QR codes found to export");
				return;
			}

			// Build company info for PDF header
			let companyInfoForPdf: CompanyInfo | undefined;
			if (companyId || hasSelectedQRs) {
				const company = companies.find((c) => c._id === companyId);
				const filterParts: string[] = [];
				if (status !== "all") filterParts.push(`Status: ${status}`);
				if (currentFilters?.searchQuery) filterParts.push(`Search: ${currentFilters.searchQuery}`);

				companyInfoForPdf = {
					name: company?.companyName || (hasSelectedQRs ? "Selected QR Codes" : "All Companies"),
					code: company?._id ? `ID: ${company._id.slice(-8).toUpperCase()}` : undefined,
					exportDate: new Date(),
					filters: filterParts.length > 0 ? filterParts.join(", ") : undefined,
				};
			}

			// Generate PDF using client-side generator
			const pdfConfig: PDFExportConfig = {
				pageSize,
				orientation,
				qrSizeMm: QR_SIZES.find((s) => s.value === qrSize)?.sizeMm || 30,
				columns: effectiveColumns,
				rows: rows === "auto" ? undefined : rows,
				showLabels,
				showGridLines,
				companyInfo: companyInfoForPdf,
			};

			const blob = await generateQRCodePDF(qrDataToExport, pdfConfig);

			// Create download link
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;

			// Generate filename
			let filename = "qr_codes";
			if (hasSelectedQRs) {
				filename += `_selected_${selectedQRIds.size}`;
			} else {
				const company = companies.find((c) => c._id === companyId);
				const companyName = company?.companyName?.replace(/\s+/g, "_") || "company";
				filename += `_${companyName}`;
			}
			if (status !== "all") {
				filename += `_${status}`;
			}
			filename += ".pdf";
			link.download = filename;

			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);

			toast.success(`PDF exported successfully (${qrDataToExport.length} QR codes)`);
			handleClose();
		} catch (error) {
			console.error("PDF export error:", error);
			toast.error("Failed to generate PDF. Please try again.");
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[550px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						Export QR Codes to PDF
					</DialogTitle>
					<DialogDescription>
						{hasSelectedQRs ? (
							<span className="flex items-center gap-2">
								Exporting <Badge variant="secondary">{selectedQRIds.size} selected</Badge> QR codes
							</span>
						) : (
							"Configure layout and select QR codes to export as a PDF file."
						)}
					</DialogDescription>
				</DialogHeader>

				<Tabs defaultValue="source" className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="source" className="flex items-center gap-2">
							<Grid3X3 className="h-4 w-4" />
							Source
						</TabsTrigger>
						<TabsTrigger value="layout" className="flex items-center gap-2">
							<Settings2 className="h-4 w-4" />
							Layout
						</TabsTrigger>
					</TabsList>

					<TabsContent value="source" className="space-y-4 mt-4">
						{hasSelectedQRs && (
							<div className="rounded-lg border bg-muted/50 p-3">
								<p className="text-sm font-medium">Selected QR Codes</p>
								<p className="text-xs text-muted-foreground mt-1">
									{selectedQRIds.size} QR code{selectedQRIds.size !== 1 ? "s" : ""} selected from the table will be
									exported.
								</p>
							</div>
						)}

						{!hasSelectedQRs && (
							<>
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
									<Label>Status Filter</Label>
									<Select value={status} onValueChange={(value) => setStatus(value as QRStatus | "all")}>
										<SelectTrigger>
											<SelectValue placeholder="All statuses" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">All Statuses</SelectItem>
											<SelectItem value="available">Available</SelectItem>
											<SelectItem value="allocated">Allocated</SelectItem>
											<SelectItem value="used">Used</SelectItem>
											<SelectItem value="retired">Retired</SelectItem>
										</SelectContent>
									</Select>
									<p className="text-xs text-muted-foreground">Filter QR codes by their current status</p>
								</div>
							</>
						)}
					</TabsContent>

					<TabsContent value="layout" className="space-y-4 mt-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>Page Size</Label>
								<Select value={pageSize} onValueChange={(v) => setPageSize(v as PageSize)}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{PAGE_SIZES.map((size) => (
											<SelectItem key={size.value} value={size.value}>
												{size.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label>Orientation</Label>
								<Select value={orientation} onValueChange={(v) => setOrientation(v as Orientation)}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{ORIENTATIONS.map((o) => (
											<SelectItem key={o.value} value={o.value}>
												{o.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>QR Code Size</Label>
								<Select value={qrSize} onValueChange={(v) => setQrSize(v as QRSize)}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{QR_SIZES.map((size) => (
											<SelectItem key={size.value} value={size.value}>
												{size.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label>QR Codes per Row</Label>
								<Select value={columns.toString()} onValueChange={(v) => setColumns(Number.parseInt(v))}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{COLUMNS_OPTIONS.filter((c) => c <= maxColumns).map((col) => (
											<SelectItem key={col} value={col.toString()}>
												{col} per row
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{columns > maxColumns && (
									<p className="text-xs text-amber-600">Adjusted to {maxColumns} (max for selected size)</p>
								)}
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>Rows per Page</Label>
								<Select
									value={rows.toString()}
									onValueChange={(v) => setRows(v === "auto" ? "auto" : Number.parseInt(v))}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{ROWS_OPTIONS.map((row) => (
											<SelectItem key={row.toString()} value={row.toString()}>
												{row === "auto" ? "Auto (fill page)" : `${row} rows`}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label>Options</Label>
								<div className="space-y-2 pt-1">
									<label className="flex items-center gap-2 text-sm cursor-pointer">
										<input
											type="checkbox"
											checked={showLabels}
											onChange={(e) => setShowLabels(e.target.checked)}
											className="rounded border-input"
										/>
										Show QR labels
									</label>
									<label className="flex items-center gap-2 text-sm cursor-pointer">
										<input
											type="checkbox"
											checked={showGridLines}
											onChange={(e) => setShowGridLines(e.target.checked)}
											className="rounded border-input"
										/>
										Show grid lines
									</label>
								</div>
							</div>
						</div>
					</TabsContent>
				</Tabs>

				<Separator />

				{/* Preview Description */}
				<div className="rounded-lg bg-muted/50 px-3 py-2">
					<p className="text-xs text-muted-foreground">Preview:</p>
					<p className="text-sm font-medium">{previewDescription}</p>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={handleClose}>
						Cancel
					</Button>
					<Button onClick={handleExport} disabled={(!hasSelectedQRs && !companyId) || isExporting}>
						{isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
						Export PDF
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
