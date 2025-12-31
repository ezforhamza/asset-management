import type {
	AdminQRCodesListParams,
	AdminQRCodesListRes,
	AdminUsersListParams,
	AdminUsersListRes,
	AllocateQRCodesReq,
	AuditLogListParams,
	AuditLogListRes,
	BulkImportQRRes,
	CompaniesListRes,
	CreateCompanyReq,
	CreateSuperuserReq,
	SyncQueueListRes,
	UpdateCompanyReq,
} from "#/admin";
import type { UserInfo } from "#/entity";
import apiClient from "../apiClient";
import API_ENDPOINTS from "../endpoints";

// Re-export types for consumers
export type {
	CreateCompanyReq,
	UpdateCompanyReq,
	CompaniesListRes,
	AdminUsersListParams,
	AdminUsersListRes,
	CreateSuperuserReq,
	AdminQRCodesListParams,
	AdminQRCodesListRes,
	SyncQueueListRes,
	AuditLogListParams,
	AuditLogListRes,
};

// ============================================
// Monitoring Response Types
// ============================================

interface MonitoringResponse {
	timestamp: string;
	sync: {
		pending: number;
		failed: number;
		last24Hours: number;
		byStatus: Record<string, number>;
	};
	verifications: {
		flaggedForInvestigation: number;
		needsRepair: number;
		last24Hours: number;
		last7Days: number;
	};
	assets: {
		total: number;
		overdue: number;
		dueSoon: number;
		byStatus: Record<string, number>;
	};
	companies: {
		total: number;
		active: number;
	};
	users: {
		total: number;
		active: number;
		byRole: Record<string, number>;
	};
	qrCodes: {
		total: number;
		byStatus: Record<string, number>;
	};
}

interface HealthResponse {
	status: string;
	timestamp: string;
	services: {
		mongodb: { status: string; readyState: number };
		redis: { status: string };
	};
}

interface CompanySummary {
	_id: string;
	isActive: boolean;
	companyName: string;
	createdAt: string;
	assetCount: number;
	userCount: number;
	verificationCount: number;
}

interface CompanyWithDetails {
	id: string;
	companyName: string;
	contactEmail: string;
	settings: {
		verificationFrequency: number;
		geofenceThreshold: number;
		allowGPSOverride: boolean;
		imageRetentionDays: number;
		repairNotificationEmails: string[];
	};
	isActive: boolean;
	stats?: {
		totalUsers: number;
		totalAssets: number;
		totalQRCodes: number;
		totalVerifications: number;
	};
	users?: UserInfo[];
	assets?: Array<{
		id: string;
		serialNumber: string;
		make: string;
		model: string;
		status: string;
	}>;
}

// ============================================
// Health & Monitoring
// ============================================

const getHealth = () => apiClient.get<HealthResponse>({ url: API_ENDPOINTS.ADMIN.HEALTH });

const getMonitoring = () =>
	apiClient.get<{ success: boolean; data: MonitoringResponse }>({ url: API_ENDPOINTS.ADMIN.MONITORING });

// ============================================
// Company Management Service
// ============================================

const getCompanies = (params?: {
	companyName?: string;
	isActive?: boolean;
	sortBy?: string;
	page?: number;
	limit?: number;
}) => apiClient.get<CompaniesListRes>({ url: API_ENDPOINTS.COMPANIES.BASE, params });

const getCompany = (companyId: string) =>
	apiClient.get<CompanyWithDetails>({ url: API_ENDPOINTS.COMPANIES.BY_ID(companyId) });

const getCompanySummary = () =>
	apiClient.get<{ success: boolean; companies: CompanySummary[] }>({
		url: "/companies/summary",
	});

const createCompany = (data: CreateCompanyReq) =>
	apiClient.post<{ company: CompanyWithDetails; admin: UserInfo }>({ url: API_ENDPOINTS.COMPANIES.BASE, data });

const updateCompany = (companyId: string, data: UpdateCompanyReq) =>
	apiClient.patch<CompanyWithDetails>({ url: API_ENDPOINTS.COMPANIES.BY_ID(companyId), data });

const deleteCompany = (companyId: string) => apiClient.delete<void>({ url: API_ENDPOINTS.COMPANIES.BY_ID(companyId) });

const getCompanySettings = (companyId: string) =>
	apiClient.get<{
		verificationFrequency: number;
		geofenceThreshold: number;
		allowGPSOverride: boolean;
		imageRetentionDays: number;
		repairNotificationEmails: string[];
	}>({
		url: API_ENDPOINTS.COMPANIES.SETTINGS(companyId),
	});

// ============================================
// Admin User Management Service
// ============================================

const getAdminUsers = (params?: AdminUsersListParams) =>
	apiClient.get<AdminUsersListRes>({ url: API_ENDPOINTS.USERS.BASE, params });

const getAdminUser = (userId: string) => apiClient.get<UserInfo>({ url: API_ENDPOINTS.USERS.BY_ID(userId) });

const createUser = (data: CreateSuperuserReq) =>
	apiClient.post<{ user: UserInfo; message: string; temporaryPassword?: string }>({
		url: API_ENDPOINTS.USERS.BASE,
		data,
	});

const updateUser = (userId: string, data: { name?: string; email?: string; role?: string; status?: string }) =>
	apiClient.patch<UserInfo>({ url: API_ENDPOINTS.USERS.BY_ID(userId), data });

const deleteUser = (userId: string) => apiClient.delete<void>({ url: API_ENDPOINTS.USERS.BY_ID(userId) });

const deactivateUser = (userId: string) => apiClient.put<UserInfo>({ url: API_ENDPOINTS.USERS.DEACTIVATE(userId) });

const resetUserPassword = (userId: string) =>
	apiClient.post<{ success: boolean; temporaryPassword?: string; message: string }>({
		url: API_ENDPOINTS.USERS.RESET_PASSWORD(userId),
	});

// ============================================
// Admin QR Code Management Service
// ============================================

const getAdminQRCodes = (params?: AdminQRCodesListParams) =>
	apiClient.get<AdminQRCodesListRes>({ url: API_ENDPOINTS.QR_CODES.BASE, params });

const getQRCodeStats = () =>
	apiClient.get<{ available: number; allocated: number; used: number; retired: number }>({
		url: `${API_ENDPOINTS.QR_CODES.BASE}/stats`,
	});

const createQRCode = (data: { qrCode: string; companyId?: string }) =>
	apiClient.post<{ id: string; qrCode: string; status: string }>({ url: API_ENDPOINTS.QR_CODES.BASE, data });

const bulkCreateQRCodes = (data: { qrCodes: string[]; companyId?: string }) =>
	apiClient.post<{ created: number; duplicates: number }>({ url: API_ENDPOINTS.QR_CODES.BULK, data });

const allocateQRCodes = (data: AllocateQRCodesReq) =>
	apiClient.post<{ allocated: number; message: string }>({ url: `${API_ENDPOINTS.QR_CODES.BASE}/allocate`, data });

const bulkImportQRCodes = (file: File, companyId?: string) => {
	const formData = new FormData();
	formData.append("file", file);
	const url = companyId
		? `${API_ENDPOINTS.QR_CODES.BULK_IMPORT}?companyId=${companyId}`
		: API_ENDPOINTS.QR_CODES.BULK_IMPORT;
	return apiClient.post<BulkImportQRRes>({ url, data: formData, headers: { "Content-Type": "multipart/form-data" } });
};

const updateQRCode = (qrCodeId: string, data: { status?: string; companyId?: string }) =>
	apiClient.patch<{ id: string; qrCode: string; status: string }>({
		url: API_ENDPOINTS.QR_CODES.BY_ID(qrCodeId),
		data,
	});

const deleteQRCode = (qrCodeId: string) => apiClient.delete<void>({ url: API_ENDPOINTS.QR_CODES.BY_ID(qrCodeId) });

// ============================================
// Flagged Verifications & Sync
// ============================================

const getFlaggedVerifications = (params?: { investigationStatus?: string; page?: number; limit?: number }) =>
	apiClient.get<AdminUsersListRes>({ url: API_ENDPOINTS.VERIFICATIONS.FLAGGED, params });

const getFailedSyncs = (params?: { page?: number; limit?: number }) =>
	apiClient.get<SyncQueueListRes>({ url: "/admin/failed-syncs", params });

const getOverdueAssets = (params?: { page?: number; limit?: number }) =>
	apiClient.get<{
		success: boolean;
		results: unknown[];
		page: number;
		limit: number;
		totalPages: number;
		totalResults: number;
	}>({
		url: "/admin/overdue-assets",
		params,
	});

// ============================================
// Audit Log Service
// ============================================

const getAuditLogs = (params?: AuditLogListParams) =>
	apiClient.get<AuditLogListRes>({ url: API_ENDPOINTS.AUDIT_LOGS.BASE, params });

const getMyAuditLogs = () =>
	apiClient.get<{ success: boolean; results: unknown[] }>({ url: `${API_ENDPOINTS.AUDIT_LOGS.BASE}/me` });

const getEntityAuditLogs = (entityType: string, entityId: string, params?: { page?: number; limit?: number }) =>
	apiClient.get<AuditLogListRes>({ url: `${API_ENDPOINTS.AUDIT_LOGS.BASE}/entity/${entityType}/${entityId}`, params });

// ============================================
// Dashboard Reports
// ============================================

const getDashboardStats = (params?: { startDate?: string; endDate?: string }) =>
	apiClient.get<unknown>({ url: API_ENDPOINTS.REPORTS.DASHBOARD, params });

// ============================================
// Global Settings (System Admin only)
// ============================================

interface GlobalSettings {
	defaultVerificationFrequency: number;
	geofenceThreshold: number;
	allowOverride: boolean;
	imageRetentionDays: number;
	maxImageSize: number;
	requirePhotoOnVerification: boolean;
	enableOfflineMode: boolean;
	offlineSyncInterval: number;
}

const getGlobalSettings = () => apiClient.get<GlobalSettings>({ url: "/admin/settings" });

const updateGlobalSettings = (data: Partial<GlobalSettings>) =>
	apiClient.patch<GlobalSettings>({ url: "/admin/settings", data });

// ============================================
// Monitoring Stats (for dashboard cards)
// ============================================

interface MonitoringStats {
	queuedUploads: number;
	failedSyncs: number;
	flaggedVerifications: number;
	apiResponseTime: number;
	dbConnections: number;
}

const getMonitoringStats = async (): Promise<MonitoringStats> => {
	const response = await apiClient.get<{ success: boolean; data: MonitoringResponse }>({
		url: API_ENDPOINTS.ADMIN.MONITORING,
	});
	const data = response.data;
	return {
		queuedUploads: data.sync.pending,
		failedSyncs: data.sync.failed,
		flaggedVerifications: data.verifications.flaggedForInvestigation,
		apiResponseTime: 45, // Default value as this may not be in API
		dbConnections: 5, // Default value as this may not be in API
	};
};

const getSyncQueue = (params?: { page?: number; limit?: number }) =>
	apiClient.get<{ items: SyncQueueListRes["results"]; total: number }>({ url: "/admin/sync-queue", params });

const createSuperuser = (data: CreateSuperuserReq) =>
	apiClient.post<{ user: UserInfo; message: string; temporaryPassword?: string }>({
		url: API_ENDPOINTS.USERS.BASE,
		data,
	});

export default {
	// Health & Monitoring
	getHealth,
	getMonitoring,
	getMonitoringStats,
	getSyncQueue,
	// Companies
	getCompanies,
	getCompany,
	getCompanySummary,
	createCompany,
	updateCompany,
	deleteCompany,
	getCompanySettings,
	// Users
	getAdminUsers,
	getAdminUser,
	createUser,
	createSuperuser,
	updateUser,
	deleteUser,
	deactivateUser,
	resetUserPassword,
	// QR Codes
	getAdminQRCodes,
	getQRCodeStats,
	createQRCode,
	bulkCreateQRCodes,
	allocateQRCodes,
	bulkImportQRCodes,
	updateQRCode,
	deleteQRCode,
	// Flagged & Sync
	getFlaggedVerifications,
	getFailedSyncs,
	getOverdueAssets,
	// Audit Logs
	getAuditLogs,
	getMyAuditLogs,
	getEntityAuditLogs,
	// Dashboard
	getDashboardStats,
	// Global Settings
	getGlobalSettings,
	updateGlobalSettings,
};
