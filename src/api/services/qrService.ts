// @ts-nocheck
import type { QRCode } from "#/entity";
import apiClient from "../apiClient";
import API_ENDPOINTS from "../endpoints";

// ============================================
// QR Code Types
// ============================================

export interface QRCodesListParams {
	qrCode?: string;
	status?: string;
	companyId?: string;
	sortBy?: string;
	page?: number;
	limit?: number;
}

export interface QRCodesListRes {
	results: QRCode[];
	page: number;
	limit: number;
	totalPages: number;
	totalResults: number;
}

export interface CreateQRCodeReq {
	qrCode: string;
	companyId?: string;
}

export interface BulkCreateQRCodesReq {
	qrCodes: string[];
	companyId?: string;
}

export interface AllocateQRCodesReq {
	qrCodes: string[];
	companyId: string;
}

export interface UpdateQRCodeReq {
	status?: string;
	companyId?: string;
}

export interface BulkImportRes {
	success: boolean;
	imported: number;
	duplicates: number;
	duplicatesList: string[];
	errors: string[];
}

export interface QRCodeStatsRes {
	success: boolean;
	stats: {
		available: number;
		allocated: number;
		used: number;
		retired: number;
		total: number;
	};
}

export interface QRCodeCheckRes {
	success: boolean;
	qrCode: string;
	status: string;
	asset: {
		id: string;
		serialNumber: string;
		make: string;
		model: string;
	} | null;
}

export interface ExportPDFConfig {
	pageSize: "A4";
	orientation: "portrait" | "landscape";
	qrSize: number; // in mm
	columns: number;
	rows?: number; // undefined = auto
	showLabels: boolean;
	showGridLines: boolean;
	selectedIds?: string[];
}

// Types are already exported via their interface declarations above

// ============================================
// QR Service Methods
// ============================================

// Get paginated list of QR codes with filters
const getQRCodes = (params?: QRCodesListParams) =>
	apiClient.get<QRCodesListRes>({ url: API_ENDPOINTS.QR_CODES.BASE, params });

// Get QR code statistics
const getQRCodeStats = () => apiClient.get<QRCodeStatsRes>({ url: `${API_ENDPOINTS.QR_CODES.BASE}/stats` });

// Get single QR code by ID
const getQRCodeById = (id: string) => apiClient.get<QRCode>({ url: API_ENDPOINTS.QR_CODES.BY_ID(id) });

// Check QR code status (for mobile scanning)
const checkQRCode = (qrCode: string) =>
	apiClient.get<QRCodeCheckRes>({ url: `${API_ENDPOINTS.QR_CODES.BASE}/check/${qrCode}` });

// Create single QR code
const createQRCode = (data: CreateQRCodeReq) => apiClient.post<QRCode>({ url: API_ENDPOINTS.QR_CODES.BASE, data });

// Bulk create QR codes (JSON)
const bulkCreateQRCodes = (data: BulkCreateQRCodesReq) =>
	apiClient.post<{ created: number; duplicates: number }>({ url: API_ENDPOINTS.QR_CODES.BULK, data });

// Bulk import QR codes from CSV
const bulkImportQRCodes = (file: File, companyId?: string) => {
	const formData = new FormData();
	formData.append("file", file);
	const url = companyId
		? `${API_ENDPOINTS.QR_CODES.BULK_IMPORT}?companyId=${companyId}`
		: API_ENDPOINTS.QR_CODES.BULK_IMPORT;
	return apiClient.post<BulkImportRes>({ url, data: formData, headers: { "Content-Type": "multipart/form-data" } });
};

// Allocate QR codes to company
const allocateQRCodes = (data: AllocateQRCodesReq) =>
	apiClient.post<{ allocated: number; message: string }>({ url: `${API_ENDPOINTS.QR_CODES.BASE}/allocate`, data });

// Update QR code
const updateQRCode = (id: string, data: UpdateQRCodeReq) =>
	apiClient.patch<QRCode>({ url: API_ENDPOINTS.QR_CODES.BY_ID(id), data });

// Delete QR code
const deleteQRCode = (id: string) => apiClient.delete<void>({ url: API_ENDPOINTS.QR_CODES.BY_ID(id) });

// Export QR codes to PDF (legacy)
const exportQRCodesPDF = async (companyId: string, status?: string): Promise<Blob> => {
	const url = status
		? `${API_ENDPOINTS.QR_CODES.BASE}/export/${companyId}/pdf?status=${status}`
		: `${API_ENDPOINTS.QR_CODES.BASE}/export/${companyId}/pdf`;
	const response = await apiClient.get<Blob>({ url, responseType: "blob" });
	return response;
};

// Export QR codes to PDF with advanced configuration
const exportQRCodesPDFAdvanced = async (
	companyId?: string,
	status?: string,
	config?: ExportPDFConfig,
): Promise<Blob> => {
	const params = new URLSearchParams();
	if (companyId) params.append("companyId", companyId);
	if (status) params.append("status", status);
	if (config) {
		params.append("pageSize", config.pageSize);
		params.append("orientation", config.orientation);
		params.append("qrSize", config.qrSize.toString());
		params.append("columns", config.columns.toString());
		if (config.rows) params.append("rows", config.rows.toString());
		params.append("showLabels", config.showLabels.toString());
		params.append("showGridLines", config.showGridLines.toString());
		if (config.selectedIds?.length) {
			params.append("selectedIds", config.selectedIds.join(","));
		}
	}
	const queryString = params.toString();
	const url = `${API_ENDPOINTS.QR_CODES.BASE}/export/pdf${queryString ? `?${queryString}` : ""}`;
	const response = await apiClient.get<Blob>({ url, responseType: "blob" });
	return response;
};

export default {
	getQRCodes,
	getQRCodeStats,
	getQRCodeById,
	checkQRCode,
	createQRCode,
	bulkCreateQRCodes,
	bulkImportQRCodes,
	allocateQRCodes,
	updateQRCode,
	deleteQRCode,
	exportQRCodesPDF,
	exportQRCodesPDFAdvanced,
};
