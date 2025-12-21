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

// Re-export types for consumers
export type {
	QRCodesListParams,
	QRCodesListRes,
	CreateQRCodeReq,
	BulkCreateQRCodesReq,
	AllocateQRCodesReq,
	UpdateQRCodeReq,
	BulkImportRes,
	QRCodeStatsRes,
	QRCodeCheckRes,
};

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
};
