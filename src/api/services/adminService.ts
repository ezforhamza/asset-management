import apiClient from "../apiClient";
import type { Company, SystemMonitoringStats } from "#/entity";
import type {
	CreateCompanyReq,
	UpdateCompanyReq,
	CompaniesListRes,
	AdminUsersListParams,
	AdminUsersListRes,
	CreateSuperuserReq,
	AdminQRCodesListParams,
	AdminQRCodesListRes,
	AllocateQRCodesReq,
	BulkImportQRRes,
	SyncQueueListRes,
	AuditLogListParams,
	AuditLogListRes,
} from "#/admin";

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
	AllocateQRCodesReq,
	BulkImportQRRes,
	SyncQueueListRes,
	AuditLogListParams,
	AuditLogListRes,
};

enum AdminApi {
	Stats = "/admin/stats",
	Settings = "/admin/settings",
	Companies = "/admin/companies",
	Users = "/admin/users",
	QRCodes = "/admin/qr-codes",
	Monitoring = "/admin/monitoring",
	SyncQueue = "/admin/sync-queue",
	FlaggedVerifications = "/admin/flagged-verifications",
	AuditLogs = "/admin/audit-logs",
}

// Global Settings Types
interface GlobalSettingsResponse {
	defaultVerificationFrequency: number;
	geofenceThreshold: number;
	allowOverride: boolean;
	imageRetentionDays: number;
	maxImageSize: number;
	requirePhotoOnVerification: boolean;
	enableOfflineMode: boolean;
	offlineSyncInterval: number;
}

// Admin Dashboard Stats Response
interface AdminStatsResponse {
	totalCompanies: number;
	activeCompanies: number;
	totalUsers: number;
	totalAssets: number;
	totalQRCodes: number;
	availableQRCodes: number;
	totalVerifications: number;
}

// ============================================
// Admin Dashboard Stats
// ============================================

const getAdminStats = () => apiClient.get<AdminStatsResponse>({ url: AdminApi.Stats });

// ============================================
// Company Management Service
// ============================================

const getCompanies = (params?: { page?: number; limit?: number; search?: string }) =>
	apiClient.get<CompaniesListRes>({ url: AdminApi.Companies, params });

const getCompany = (companyId: string) =>
	apiClient.get<
		Company & { userCount?: number; assetCount?: number; qrCodeCount?: number; verificationCount?: number }
	>({
		url: `${AdminApi.Companies}/${companyId}`,
	});

const getCompanyAssets = (companyId: string) =>
	apiClient.get<{
		assets: Array<{
			_id: string;
			serialNumber: string;
			make: string;
			model: string;
			verificationStatus: string;
			lastVerifiedAt?: string;
		}>;
	}>({
		url: `${AdminApi.Companies}/${companyId}/assets`,
	});

const createCompany = (data: CreateCompanyReq) =>
	apiClient.post<{ success: boolean; companyId: string; message: string; temporaryPassword?: string }>({
		url: AdminApi.Companies,
		data,
	});

const updateCompany = (companyId: string, data: UpdateCompanyReq) =>
	apiClient.put<{ success: boolean; message: string }>({
		url: `${AdminApi.Companies}/${companyId}`,
		data,
	});

const deactivateCompany = (companyId: string) =>
	apiClient.put<{ success: boolean; message: string }>({
		url: `${AdminApi.Companies}/${companyId}/deactivate`,
	});

const activateCompany = (companyId: string) =>
	apiClient.put<{ success: boolean; message: string }>({
		url: `${AdminApi.Companies}/${companyId}/activate`,
	});

// ============================================
// Admin User Management Service
// ============================================

const getAdminUsers = (params?: AdminUsersListParams) =>
	apiClient.get<AdminUsersListRes>({ url: AdminApi.Users, params });

const createSuperuser = (data: CreateSuperuserReq) =>
	apiClient.post<{ success: boolean; userId: string; temporaryPassword: string; message: string }>({
		url: `${AdminApi.Users}/create-superuser`,
		data,
	});

const assignUserToCompany = (userId: string, companyId: string) =>
	apiClient.put<{ success: boolean; message: string }>({
		url: `${AdminApi.Users}/${userId}/assign-company`,
		data: { companyId },
	});

// ============================================
// Admin QR Code Management Service
// ============================================

const getAdminQRCodes = (params?: AdminQRCodesListParams) =>
	apiClient.get<AdminQRCodesListRes>({ url: AdminApi.QRCodes, params });

const allocateQRCodes = (data: AllocateQRCodesReq) =>
	apiClient.post<{ success: boolean; allocated: number }>({
		url: "/qr/allocate",
		data,
	});

const bulkImportQRCodes = (file: File) => {
	const formData = new FormData();
	formData.append("file", file);
	return apiClient.post<BulkImportQRRes>({
		url: "/qr/bulk-import",
		data: formData,
		headers: { "Content-Type": "multipart/form-data" },
	});
};

const retireQRCode = (qrCodeId: string) =>
	apiClient.put<{ success: boolean; message: string }>({
		url: `${AdminApi.QRCodes}/${qrCodeId}/retire`,
	});

// ============================================
// System Monitoring Service
// ============================================

const getMonitoringStats = () => apiClient.get<SystemMonitoringStats>({ url: AdminApi.Monitoring });

const getSyncQueue = (params?: { status?: string; page?: number; limit?: number }) =>
	apiClient.get<SyncQueueListRes>({ url: AdminApi.SyncQueue, params });

const retrySyncItem = (syncId: string) =>
	apiClient.post<{ success: boolean; message: string }>({
		url: `${AdminApi.SyncQueue}/${syncId}/retry`,
	});

const getFlaggedVerifications = (params?: { page?: number; limit?: number }) =>
	apiClient.get<{ verifications: unknown[]; pagination: { total: number; page: number; pages: number } }>({
		url: AdminApi.FlaggedVerifications,
		params,
	});

// ============================================
// Audit Log Service
// ============================================

const getAuditLogs = (params?: AuditLogListParams) =>
	apiClient.get<AuditLogListRes>({ url: AdminApi.AuditLogs, params });

// ============================================
// Global Settings Service
// ============================================

const getGlobalSettings = () => apiClient.get<GlobalSettingsResponse>({ url: AdminApi.Settings });

const updateGlobalSettings = (data: GlobalSettingsResponse) =>
	apiClient.put<{ success: boolean }>({ url: AdminApi.Settings, data });

export default {
	// Dashboard
	getAdminStats,
	// Companies
	getCompanies,
	getCompany,
	getCompanyAssets,
	createCompany,
	updateCompany,
	deactivateCompany,
	activateCompany,
	// Users
	getAdminUsers,
	createSuperuser,
	assignUserToCompany,
	// QR Codes
	getAdminQRCodes,
	allocateQRCodes,
	bulkImportQRCodes,
	retireQRCode,
	// Monitoring
	getMonitoringStats,
	getSyncQueue,
	retrySyncItem,
	getFlaggedVerifications,
	// Audit Logs
	getAuditLogs,
	// Global Settings
	getGlobalSettings,
	updateGlobalSettings,
};
