import apiClient from "../apiClient";

// ============================================
// QR Code Types
// ============================================

export enum QRCodeStatus {
	AVAILABLE = "available",
	ALLOCATED = "allocated",
	USED = "used",
	RETIRED = "retired",
}

export interface QRCode {
	_id: string;
	qrCode: string;
	companyId: string | null;
	assetId: string | null;
	status: QRCodeStatus;
	allocatedAt: string | null;
	linkedAt: string | null;
	createdAt: string;
}

export interface QRCodeCheckRes {
	success: boolean;
	qrCode: string;
	status: QRCodeStatus;
	asset: {
		_id: string;
		serialNumber: string;
		make: string;
		model: string;
	} | null;
}

export interface QRCodesListParams {
	status?: QRCodeStatus;
	page?: number;
	limit?: number;
}

export interface QRCodesListRes {
	qrCodes: QRCode[];
	pagination: {
		total: number;
		page: number;
		pages: number;
	};
}

export interface AllocateQRCodesReq {
	qrCodes: string[];
	companyId: string;
}

export interface BulkImportRes {
	success: boolean;
	imported: number;
	duplicates: number;
	errors: string[];
}

// ============================================
// API Endpoints
// ============================================

enum QRApi {
	Check = "/qr",
	Allocate = "/qr/allocate",
	BulkImport = "/qr/bulk-import",
	List = "/qr-codes",
}

// ============================================
// QR Service (Customer Portal - limited access)
// ============================================

const checkQRCode = (qrCode: string) => apiClient.get<QRCodeCheckRes>({ url: `${QRApi.Check}/${qrCode}` });

const getCompanyQRCodes = (params?: QRCodesListParams) => apiClient.get<QRCodesListRes>({ url: QRApi.List, params });

// ============================================
// QR Service (Admin Panel - full access)
// ============================================

const allocateQRCodes = (data: AllocateQRCodesReq) =>
	apiClient.post<{ success: boolean; allocated: number }>({ url: QRApi.Allocate, data });

const bulkImportQRCodes = (file: File) => {
	const formData = new FormData();
	formData.append("file", file);
	return apiClient.post<BulkImportRes>({
		url: QRApi.BulkImport,
		data: formData,
		headers: { "Content-Type": "multipart/form-data" },
	});
};

const getAllQRCodes = (params?: QRCodesListParams & { companyId?: string }) =>
	apiClient.get<QRCodesListRes>({ url: `/admin${QRApi.List}`, params });

const retireQRCode = (qrCodeId: string) =>
	apiClient.put<{ success: boolean; message: string }>({ url: `/admin${QRApi.List}/${qrCodeId}/retire` });

export default {
	// Customer Portal
	checkQRCode,
	getCompanyQRCodes,
	// Admin Panel
	allocateQRCodes,
	bulkImportQRCodes,
	getAllQRCodes,
	retireQRCode,
};
