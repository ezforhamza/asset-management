import type { AuditLog, Company, QRCode, SyncQueueItem, UserInfo } from "./entity";

// ============================================
// Paginated Response (Real API format)
// ============================================

export interface PaginatedResponse<T> {
	results: T[];
	page: number;
	limit: number;
	totalPages: number;
	totalResults: number;
}

// ============================================
// Admin Company Types
// ============================================

export interface CreateCompanyReq {
	companyName: string;
	contactEmail: string;
	settings?: {
		verificationFrequency?: number;
		geofenceThreshold?: number;
		allowGPSOverride?: boolean;
		imageRetentionDays?: number;
		repairNotificationEmails?: string[];
	};
	admin: {
		name: string;
		email: string;
		password: string;
	};
}

export interface UpdateCompanyReq {
	companyName?: string;
	contactEmail?: string;
	logo?: string;
	settings?: {
		verificationFrequency?: number;
		geofenceThreshold?: number;
		allowGPSOverride?: boolean;
		imageRetentionDays?: number;
		repairNotificationEmails?: string[];
	};
	isActive?: boolean;
}

export interface CompaniesListRes extends PaginatedResponse<Company> {}

// ============================================
// Admin User Types
// ============================================

export interface AdminUsersListParams {
	name?: string;
	companyId?: string;
	role?: string;
	status?: string;
	sortBy?: string;
	page?: number;
	limit?: number;
}

export interface AdminUsersListRes extends PaginatedResponse<UserInfo> {}

export interface CreateSuperuserReq {
	name: string;
	email: string;
	password?: string;
	role: "customer_admin" | "field_user";
	companyId?: string;
}

// ============================================
// Admin QR Types
// ============================================

export interface AdminQRCodesListParams {
	qrCode?: string;
	status?: string;
	companyId?: string;
	sortBy?: string;
	page?: number;
	limit?: number;
}

export interface AdminQRCodesListRes extends PaginatedResponse<QRCode> {}

export interface AllocateQRCodesReq {
	qrCodes: string[];
	companyId: string;
}

export interface BulkImportQRRes {
	success: boolean;
	imported: number;
	duplicates: number;
	duplicatesList: string[];
	errors: string[];
}

// ============================================
// Admin Monitoring Types
// ============================================

export interface SyncQueueListRes extends PaginatedResponse<SyncQueueItem> {}

export interface AuditLogListParams {
	entityType?: string;
	entityId?: string;
	action?: string;
	performedBy?: string;
	startDate?: string;
	endDate?: string;
	sortBy?: string;
	page?: number;
	limit?: number;
}

export interface AuditLogListRes extends PaginatedResponse<AuditLog> {}
