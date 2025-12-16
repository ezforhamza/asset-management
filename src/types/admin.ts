import type { Company, QRCode, SyncQueueItem, AuditLog, UserInfo } from "./entity";

// ============================================
// Admin Company Types
// ============================================

export interface CreateCompanyReq {
	companyName: string;
	contactEmail: string;
	phone?: string;
	address?: string;
	settings?: {
		verificationFrequency?: number;
		geofenceThreshold?: number;
		allowGPSOverride?: boolean;
		imageRetentionDays?: number;
		repairNotificationEmails?: string[];
	};
}

export interface UpdateCompanyReq {
	companyName?: string;
	contactEmail?: string;
	phone?: string;
	address?: string;
	settings?: {
		verificationFrequency?: number;
		geofenceThreshold?: number;
		allowGPSOverride?: boolean;
		imageRetentionDays?: number;
		repairNotificationEmails?: string[];
	};
}

export interface CompaniesListRes {
	companies: Company[];
	pagination: {
		total: number;
		page: number;
		pages: number;
	};
}

// ============================================
// Admin User Types
// ============================================

export interface AdminUsersListParams {
	companyId?: string;
	role?: string;
	status?: string;
	page?: number;
	limit?: number;
}

export interface AdminUsersListRes {
	users: UserInfo[];
	pagination: {
		total: number;
		page: number;
		pages: number;
	};
}

export interface CreateSuperuserReq {
	name: string;
	email: string;
	companyId: string;
}

// ============================================
// Admin QR Types
// ============================================

export interface AdminQRCodesListParams {
	status?: string;
	companyId?: string;
	page?: number;
	limit?: number;
}

export interface AdminQRCodesListRes {
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

export interface BulkImportQRRes {
	success: boolean;
	imported: number;
	duplicates: number;
	errors: string[];
}

// ============================================
// Admin Monitoring Types
// ============================================

export interface SyncQueueListRes {
	items: SyncQueueItem[];
	pagination: {
		total: number;
		page: number;
		pages: number;
	};
}

export interface AuditLogListParams {
	entityType?: string;
	entityId?: string;
	performedBy?: string;
	startDate?: string;
	endDate?: string;
	page?: number;
	limit?: number;
}

export interface AuditLogListRes {
	logs: AuditLog[];
	pagination: {
		total: number;
		page: number;
		pages: number;
	};
}
