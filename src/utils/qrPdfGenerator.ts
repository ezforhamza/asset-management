import { jsPDF } from "jspdf";
import QRCode from "qrcode";

export interface QRCodeData {
	id: string;
	qrCode: string;
	label?: string;
}

export interface CompanyInfo {
	name: string;
	code?: string;
	exportDate: Date;
	filters?: string;
}

export type PageSize = "A4" | "A5" | "Letter" | "Legal";

export interface PDFExportConfig {
	pageSize: PageSize;
	orientation: "portrait" | "landscape";
	qrSizeMm: number;
	columns: number;
	rows?: number; // undefined = auto-calculate
	showLabels: boolean;
	showGridLines: boolean;
	companyInfo?: CompanyInfo;
}

// Page dimensions in mm
const PAGE_DIMENSIONS: Record<PageSize, { width: number; height: number }> = {
	A4: { width: 210, height: 297 },
	A5: { width: 148, height: 210 },
	Letter: { width: 216, height: 279 },
	Legal: { width: 216, height: 356 },
};

const MARGIN_MM = 10;
const CELL_PADDING_MM = 5;
const LABEL_HEIGHT_MM = 6;
const GRID_LINE_WIDTH = 0.3;
const HEADER_HEIGHT_MM = 35; // Height reserved for company header on first page

/**
 * Draw company header on the first page of the PDF
 */
function drawCompanyHeader(pdf: jsPDF, companyInfo: CompanyInfo, pageWidth: number, totalQRCount: number): void {
	const startY = MARGIN_MM;

	// Draw header background
	pdf.setFillColor(248, 249, 250);
	pdf.rect(MARGIN_MM, startY, pageWidth - 2 * MARGIN_MM, HEADER_HEIGHT_MM - 5, "F");

	// Draw border
	pdf.setDrawColor(220, 220, 220);
	pdf.setLineWidth(0.5);
	pdf.rect(MARGIN_MM, startY, pageWidth - 2 * MARGIN_MM, HEADER_HEIGHT_MM - 5, "S");

	// Company name (large, bold)
	pdf.setFontSize(14);
	pdf.setTextColor(30, 30, 30);
	pdf.setFont("helvetica", "bold");
	pdf.text(companyInfo.name, MARGIN_MM + 5, startY + 8);

	// Company code if available
	let currentY = startY + 14;
	pdf.setFontSize(9);
	pdf.setFont("helvetica", "normal");
	pdf.setTextColor(80, 80, 80);

	if (companyInfo.code) {
		pdf.text(`Company Code: ${companyInfo.code}`, MARGIN_MM + 5, currentY);
		currentY += 5;
	}

	// Export date and time
	const dateStr = companyInfo.exportDate.toLocaleDateString("en-US", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
	const timeStr = companyInfo.exportDate.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});
	pdf.text(`Export Date: ${dateStr}, ${timeStr}`, MARGIN_MM + 5, currentY);
	currentY += 5;

	// Total QR codes
	pdf.text(`Total QR Codes: ${totalQRCount}`, MARGIN_MM + 5, currentY);

	// Filters if available (right side)
	if (companyInfo.filters) {
		pdf.setFontSize(8);
		pdf.setTextColor(100, 100, 100);
		const filterText = `Filters: ${companyInfo.filters}`;
		const filterWidth = pdf.getTextWidth(filterText);
		pdf.text(filterText, pageWidth - MARGIN_MM - 5 - filterWidth, startY + 8);
	}
}

/**
 * Generate a PDF with QR codes arranged in a grid layout
 */
export async function generateQRCodePDF(qrCodes: QRCodeData[], config: PDFExportConfig): Promise<Blob> {
	const { pageSize, orientation, qrSizeMm, columns, rows, showLabels, showGridLines, companyInfo } = config;

	// Get page dimensions based on orientation
	const baseDimensions = PAGE_DIMENSIONS[pageSize];
	const pageWidth = orientation === "portrait" ? baseDimensions.width : baseDimensions.height;
	const pageHeight = orientation === "portrait" ? baseDimensions.height : baseDimensions.width;

	// Calculate available area
	const availableWidth = pageWidth - 2 * MARGIN_MM;
	const availableHeight = pageHeight - 2 * MARGIN_MM;

	// Calculate cell dimensions
	const cellWidth = availableWidth / columns;
	const labelSpace = showLabels ? LABEL_HEIGHT_MM : 0;
	const cellHeight = qrSizeMm + 2 * CELL_PADDING_MM + labelSpace;

	// Calculate rows per page
	const rowsPerPage = rows || Math.floor(availableHeight / cellHeight);
	const qrCodesPerPage = columns * rowsPerPage;

	// Create PDF
	const pdf = new jsPDF({
		orientation: orientation === "portrait" ? "p" : "l",
		unit: "mm",
		format: pageSize.toLowerCase(),
	});

	// Generate QR code images in parallel (batched to avoid memory issues)
	const batchSize = 50;
	const qrImages: Map<string, string> = new Map();

	for (let i = 0; i < qrCodes.length; i += batchSize) {
		const batch = qrCodes.slice(i, i + batchSize);
		const imagePromises = batch.map(async (qr) => {
			try {
				const dataUrl = await QRCode.toDataURL(qr.qrCode, {
					width: 200,
					margin: 1,
					errorCorrectionLevel: "M",
				});
				return { id: qr.id, dataUrl };
			} catch {
				console.error(`Failed to generate QR for ${qr.qrCode}`);
				return { id: qr.id, dataUrl: null };
			}
		});

		const results = await Promise.all(imagePromises);
		for (const result of results) {
			if (result.dataUrl) {
				qrImages.set(result.id, result.dataUrl);
			}
		}
	}

	// Calculate QR codes per page (first page may have fewer due to header)
	const firstPageHeaderHeight = companyInfo ? HEADER_HEIGHT_MM : 0;
	const firstPageAvailableHeight = availableHeight - firstPageHeaderHeight;
	const firstPageRows = rows || Math.floor(firstPageAvailableHeight / cellHeight);
	const firstPageQRCount = columns * firstPageRows;
	const remainingQRCount = Math.max(0, qrCodes.length - firstPageQRCount);
	const additionalPages = remainingQRCount > 0 ? Math.ceil(remainingQRCount / qrCodesPerPage) : 0;
	const totalPages = 1 + additionalPages;

	// Render each page
	for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
		if (pageIndex > 0) {
			pdf.addPage();
		}

		const isFirstPage = pageIndex === 0;
		const headerHeight = isFirstPage && companyInfo ? HEADER_HEIGHT_MM : 0;
		const pageAvailableHeight = availableHeight - headerHeight;

		// Calculate start and end indices for this page
		let startIndex: number;
		let endIndex: number;
		if (isFirstPage) {
			startIndex = 0;
			endIndex = Math.min(firstPageQRCount, qrCodes.length);
		} else {
			startIndex = firstPageQRCount + (pageIndex - 1) * qrCodesPerPage;
			endIndex = Math.min(startIndex + qrCodesPerPage, qrCodes.length);
		}
		const pageQRCodes = qrCodes.slice(startIndex, endIndex);

		// Draw company header on first page only
		if (isFirstPage && companyInfo) {
			drawCompanyHeader(pdf, companyInfo, pageWidth, qrCodes.length);
		}

		// Calculate actual rows on this page
		const actualRows = Math.ceil(pageQRCodes.length / columns);

		// Calculate starting Y position
		const gridHeight = actualRows * cellHeight;
		const startY = MARGIN_MM + headerHeight + (pageAvailableHeight - gridHeight) / 2;

		// Draw grid lines if enabled
		if (showGridLines) {
			pdf.setDrawColor(200, 200, 200);
			pdf.setLineWidth(GRID_LINE_WIDTH);

			// Horizontal lines
			for (let row = 0; row <= actualRows; row++) {
				const y = startY + row * cellHeight;
				pdf.line(MARGIN_MM, y, MARGIN_MM + availableWidth, y);
			}

			// Vertical lines
			for (let col = 0; col <= columns; col++) {
				const x = MARGIN_MM + col * cellWidth;
				const gridBottom = startY + actualRows * cellHeight;
				pdf.line(x, startY, x, gridBottom);
			}
		}

		// Render QR codes
		for (let i = 0; i < pageQRCodes.length; i++) {
			const qr = pageQRCodes[i];
			const col = i % columns;
			const row = Math.floor(i / columns);

			// Calculate cell position
			const cellX = MARGIN_MM + col * cellWidth;
			const cellY = startY + row * cellHeight;

			// Calculate QR position (centered in cell)
			const qrX = cellX + (cellWidth - qrSizeMm) / 2;
			const qrY = cellY + CELL_PADDING_MM;

			// Draw QR code
			const qrImage = qrImages.get(qr.id);
			if (qrImage) {
				pdf.addImage(qrImage, "PNG", qrX, qrY, qrSizeMm, qrSizeMm);
			}

			// Draw label if enabled
			if (showLabels) {
				const labelY = qrY + qrSizeMm + 2;
				pdf.setFontSize(7);
				pdf.setTextColor(80, 80, 80);

				// Truncate label if too long
				const labelText = qr.label || qr.qrCode;
				const maxLabelWidth = cellWidth - 4;
				let displayLabel = labelText;

				// Simple truncation check
				if (pdf.getTextWidth(displayLabel) > maxLabelWidth) {
					while (pdf.getTextWidth(displayLabel + "...") > maxLabelWidth && displayLabel.length > 0) {
						displayLabel = displayLabel.slice(0, -1);
					}
					displayLabel += "...";
				}

				// Center the label
				const labelWidth = pdf.getTextWidth(displayLabel);
				const labelX = cellX + (cellWidth - labelWidth) / 2;
				pdf.text(displayLabel, labelX, labelY);
			}
		}

		// Add page number
		pdf.setFontSize(8);
		pdf.setTextColor(150, 150, 150);
		const pageText = `Page ${pageIndex + 1} of ${totalPages}`;
		const pageTextWidth = pdf.getTextWidth(pageText);
		pdf.text(pageText, pageWidth - MARGIN_MM - pageTextWidth, pageHeight - 5);
	}

	return pdf.output("blob");
}

/**
 * Calculate the maximum number of columns for a given QR size and page configuration
 */
export function calculateMaxColumns(
	qrSizeMm: number,
	pageSize: PageSize,
	orientation: "portrait" | "landscape",
): number {
	const baseDimensions = PAGE_DIMENSIONS[pageSize];
	const pageWidth = orientation === "portrait" ? baseDimensions.width : baseDimensions.height;
	const availableWidth = pageWidth - 2 * MARGIN_MM;
	const minCellWidth = qrSizeMm + 2 * CELL_PADDING_MM;
	return Math.floor(availableWidth / minCellWidth);
}

/**
 * Calculate the maximum number of rows for a given configuration
 */
export function calculateMaxRows(
	qrSizeMm: number,
	pageSize: PageSize,
	orientation: "portrait" | "landscape",
	showLabels: boolean,
	hasHeader: boolean = false,
): number {
	const baseDimensions = PAGE_DIMENSIONS[pageSize];
	const pageHeight = orientation === "portrait" ? baseDimensions.height : baseDimensions.width;
	const headerSpace = hasHeader ? HEADER_HEIGHT_MM : 0;
	const availableHeight = pageHeight - 2 * MARGIN_MM - headerSpace;
	const labelSpace = showLabels ? LABEL_HEIGHT_MM : 0;
	const cellHeight = qrSizeMm + 2 * CELL_PADDING_MM + labelSpace;
	return Math.floor(availableHeight / cellHeight);
}
